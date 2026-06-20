/**
 * login — open the isolated browser profile to Outlook so you can sign in ONCE.
 * The session persists in the dedicated profile dir; the agent reuses it later.
 * Keeps the window open until you press Enter.
 */
import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { loadConfig } from "../config.js";
import { OutlookBrowser } from "../browser.js";

async function main() {
  const cfg = loadConfig();
  const browser = new OutlookBrowser({ ...cfg, headless: false });
  await browser.init();
  const rl = createInterface({ input: stdin, output: stdout });
  await rl.question("\nSign in to Outlook in the opened window, then press Enter to finish...");
  rl.close();
  await browser.close();
  console.log("Profile saved. The agent can now reuse this session.");
}
main().catch((e) => { console.error(e); process.exit(1); });
