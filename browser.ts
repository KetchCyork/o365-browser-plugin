/**
 * OutlookBrowser
 * --------------
 * Guarded Stagehand automation of Outlook on the web. Read and draft only.
 *
 * Injection-defense by design:
 *  - Extracted email text is RETURNED to the caller as data and is never used to
 *    decide the tool's next action. The action plan comes from the operator's
 *    command, not from message content.
 *  - Our own draft text is typed via the keyboard, not passed through the LLM, so
 *    it can't be reinterpreted as an instruction.
 *  - act() instructions reference the app's fixed chrome (Reply button, New mail),
 *    not message content. (Residual risk remains — see docs/SECURITY.md.)
 *  - Every operation re-checks the domain allowlist.
 */
import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";
import type { BrowserConfig } from "./config.js";
import { assertAllowedAction, assertAllowedHost } from "./guard.js";

export interface MessageSummary { from: string; subject: string; time: string; }
export interface MessageBody { subject: string; from: string; body: string; }

export class OutlookBrowser {
  private sh: Stagehand;
  private page: any; // Stagehand-augmented Playwright Page (act/extract/observe)

  constructor(private cfg: BrowserConfig) {
    this.sh = new Stagehand({
      env: "LOCAL",
      model: cfg.model,
      verbose: cfg.verbose,
      localBrowserLaunchOptions: {
        headless: cfg.headless,
        userDataDir: cfg.userDataDir, // dedicated, isolated profile
      },
    });
  }

  async init(navigate = true): Promise<void> {
    await this.sh.init();
    this.page = this.sh.context.pages()[0];
    if (navigate) {
      await this.page.goto(this.cfg.outlookUrl);
      this.assertDomain();
    }
  }

  private assertDomain(): void {
    assertAllowedHost(this.page.url(), this.cfg.allowedHosts);
  }

  /** Open the inbox view. */
  async openInbox(): Promise<void> {
    assertAllowedAction("open_inbox");
    this.assertDomain();
    await this.page.act("go to the Inbox folder");
    this.assertDomain();
  }

  /** List recent messages. Returned as DATA only. */
  async listRecent(limit = 10): Promise<MessageSummary[]> {
    assertAllowedAction("list_recent");
    this.assertDomain();
    const out = await this.page.extract({
      instruction: `the ${limit} most recent emails in the message list: sender, subject, and time`,
      schema: z.object({
        messages: z.array(z.object({ from: z.string(), subject: z.string(), time: z.string() })),
      }),
    });
    return (out?.messages ?? []).slice(0, limit);
  }

  /** Open a specific message. `query` comes from the operator, never from page text. */
  async openMessage(query: string): Promise<void> {
    assertAllowedAction("open_message");
    this.assertDomain();
    await this.page.act(`in the message list, open the email whose sender or subject matches: ${query}`);
    this.assertDomain();
  }

  /** Read the currently open message. Returned as DATA only. */
  async readMessage(): Promise<MessageBody> {
    assertAllowedAction("read_message");
    this.assertDomain();
    const out = await this.page.extract({
      instruction: "the currently open email's subject, sender, and full body text",
      schema: z.object({ subject: z.string(), from: z.string(), body: z.string() }),
    });
    return { subject: out?.subject ?? "", from: out?.from ?? "", body: out?.body ?? "" };
  }

  /**
   * Compose a reply to the open message and LEAVE IT AS A DRAFT. Clicks Reply via
   * the app chrome, then types our text with the keyboard (not via the LLM).
   * Does NOT click Send. Outlook autosaves it to Drafts for human review.
   */
  async draftReply(text: string): Promise<void> {
    assertAllowedAction("draft_reply");
    this.assertDomain();
    await this.page.act("click the Reply button in the reading pane toolbar");
    this.assertDomain();
    // Type our own text deterministically into the focused reply body.
    await this.page.keyboard.type(text);
    // Intentionally stop here. No send.
  }

  /** Compose a new email and leave it as a draft (best-effort; reply-drafting is the primary path). */
  async draftNew(to: string, subject: string, body: string): Promise<void> {
    assertAllowedAction("draft_new");
    this.assertDomain();
    await this.page.act("click the New mail / New message button");
    this.assertDomain();
    await this.page.act("click the To recipients field");
    await this.page.keyboard.type(to);
    await this.page.keyboard.press("Tab");
    await this.page.act("click the Subject field");
    await this.page.keyboard.type(subject);
    await this.page.act("click the message body area");
    await this.page.keyboard.type(body);
    // No send.
  }

  async close(): Promise<void> {
    await this.sh.close();
  }
}
