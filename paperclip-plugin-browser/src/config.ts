/**
 * Browser tool config
 * -------------------
 * A guarded Outlook-on-the-web automation, for the rare cases the Graph API
 * can't cover (e.g. tenant won't allow an app registration). It is the highest-
 * risk component in the system, so the defaults are conservative: isolated
 * profile, domain allowlist, read/draft only, never sends.
 */
import { homedir } from "node:os";
import { join } from "node:path";

function env(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

export interface BrowserConfig {
  /** Outlook on the web entry point. */
  outlookUrl: string;
  /** Hosts the agent is allowed to operate on. Anything else is refused. */
  allowedHosts: string[];
  /** Dedicated browser profile dir — isolated from your normal browser. */
  userDataDir: string;
  /** Run headed by default so you can watch what it does. */
  headless: boolean;
  /** Model Stagehand uses for element selection (a local Ollama model keeps
   *  page content on-device; or an OpenRouter/Anthropic model). */
  model: string;
  /** Master switch: allow ANY outbound/destructive action (send/delete). Default false. */
  allowSideEffects: boolean;
  /** Verbosity for Stagehand (0-2). */
  verbose: 0 | 1 | 2;
}

export function loadConfig(): BrowserConfig {
  const base = join(homedir(), ".paperclip-browser");
  const v = Number(env("BROWSER_VERBOSE", "1"));
  return {
    outlookUrl: env("OUTLOOK_URL", "https://outlook.office.com/mail/"),
    allowedHosts: env("BROWSER_ALLOWED_HOSTS", "outlook.office.com,outlook.office365.com")
      .split(",").map((s) => s.trim().toLowerCase()).filter(Boolean),
    userDataDir: env("BROWSER_PROFILE_DIR", join(base, "profile")),
    headless: env("BROWSER_HEADLESS", "false") === "true",
    model: env("BROWSER_MODEL", "ollama/llama3.1"),
    allowSideEffects: env("BROWSER_ALLOW_SIDE_EFFECTS", "false") === "true",
    verbose: (v === 0 || v === 2 ? v : 1),
  };
}
