/**
 * Guard
 * -----
 * The safety layer. Browser automation over email is the worst surface for
 * prompt injection, so these checks are not optional and run on every action.
 *
 * Principles enforced here:
 *  1. Domain allowlist — only operate on approved hosts; never follow links out.
 *  2. Action allowlist — only the small set of vetted operations may run.
 *  3. Untrusted content — email/page text is DATA, never instructions. The tool
 *     never chooses its next action based on the content of a message. (Enforced
 *     by design in browser.ts: extracted text is only ever returned, never fed
 *     back into act().)
 *  4. Human confirmation — any outbound/destructive action stops and asks.
 *     Sending is not implemented at all by default; drafts only.
 */
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

/** The only operations this tool is allowed to perform. */
export const ALLOWED_ACTIONS = [
  "open_inbox",
  "list_recent",
  "open_message",
  "read_message",
  "draft_reply",   // composes a reply and leaves it as a DRAFT (never sends)
  "draft_new",     // composes a new email and leaves it as a DRAFT (never sends)
] as const;
export type AllowedAction = (typeof ALLOWED_ACTIONS)[number];

/** Outbound/destructive actions are deliberately NOT in the allowlist. */
export const FORBIDDEN_ACTIONS = ["send", "delete", "forward", "archive", "move", "reply_send"] as const;

export function assertAllowedAction(action: string): asserts action is AllowedAction {
  if ((FORBIDDEN_ACTIONS as readonly string[]).includes(action)) {
    throw new Error(
      `Action "${action}" is forbidden in the browser tool. It only reads and drafts; ` +
      `sending/deleting is a human step in Outlook.`
    );
  }
  if (!(ALLOWED_ACTIONS as readonly string[]).includes(action)) {
    throw new Error(`Action "${action}" is not in the allowlist.`);
  }
}

/** Throw unless the current URL's host is approved. */
export function assertAllowedHost(currentUrl: string, allowedHosts: string[]): void {
  let host: string;
  try { host = new URL(currentUrl).hostname.toLowerCase(); }
  catch { throw new Error(`Refusing to act on an unparseable URL: ${currentUrl}`); }
  const ok = allowedHosts.some((h) => host === h || host.endsWith(`.${h}`));
  if (!ok) {
    throw new Error(
      `Refusing to act: host "${host}" is not in the allowlist (${allowedHosts.join(", ")}). ` +
      `The tool never operates off the approved domain.`
    );
  }
}

/**
 * Human confirmation for anything outbound/destructive. Returns true only on an
 * explicit "yes". Used for the (default-off) side-effect path; the standard
 * read/draft flow never reaches here.
 */
export async function confirm(summary: string): Promise<boolean> {
  const rl = createInterface({ input: stdin, output: stdout });
  try {
    const ans = (await rl.question(`\nCONFIRM: ${summary}\nType "yes" to proceed: `)).trim().toLowerCase();
    return ans === "yes";
  } finally {
    rl.close();
  }
}
