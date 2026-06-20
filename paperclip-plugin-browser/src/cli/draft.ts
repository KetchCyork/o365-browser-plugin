/**
 * draft — leave a reply draft in Outlook (never sends).
 *   npm run draft -- "<search terms to find the message>" "<your reply text>"
 */
import "dotenv/config";
import { loadConfig } from "../config.js";
import { OutlookBrowser } from "../browser.js";

async function main() {
  const [query, ...textParts] = process.argv.slice(2);
  const text = textParts.join(" ");
  if (!query || !text) throw new Error('Usage: draft -- "<search>" "<reply text>"');
  const browser = new OutlookBrowser(loadConfig());
  try {
    await browser.init();
    await browser.openInbox();
    await browser.openMessage(query);
    await browser.draftReply(text);
    console.log("Reply draft left in Outlook (not sent). Review and send it there.");
  } finally {
    await browser.close();
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
