/** inbox — list recent messages (read-only). */
import "dotenv/config";
import { loadConfig } from "../config.js";
import { OutlookBrowser } from "../browser.js";

async function main() {
  const browser = new OutlookBrowser(loadConfig());
  try {
    await browser.init();
    await browser.openInbox();
    const items = await browser.listRecent(10);
    for (const m of items) console.log(`- ${m.from}: ${m.subject} (${m.time})`);
    if (!items.length) console.log("(no messages found)");
  } finally {
    await browser.close();
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
