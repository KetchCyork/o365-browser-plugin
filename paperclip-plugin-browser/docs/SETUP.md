# Setup

This tool drives a real Chromium browser against Outlook on the web. It needs
Playwright's browser binary and a one-time sign-in into an isolated profile.

## 1. Install

```bash
cp .env.example .env
npm install
npx playwright install chromium   # downloads the browser binary (~150 MB)
```

## 2. Pick the element-selection model

Stagehand uses a model to locate page elements. Two good options in `.env`:

- `BROWSER_MODEL=ollama/llama3.1` — local, keeps page content on-device (recommended
  for a work mailbox). Requires Ollama running.
- An OpenRouter/Anthropic model id — more capable, but page content goes to the
  provider during element selection.

## 3. Sign in once (isolated profile)

```bash
npm run login
```

A visible browser opens to Outlook in a **dedicated profile** (not your normal
browser). Sign in, complete MFA, then press Enter. The session persists in
`BROWSER_PROFILE_DIR`; the agent reuses only that contained session.

## 4. Use it

```bash
npm run inbox                                   # list recent messages (read-only)
npm run draft -- "Hilmar SOW" "Thanks, here's the timeline..."   # leaves a DRAFT
```

Drafts are left in Outlook for you to review and send. The tool never sends.

## Notes

- Read `docs/SECURITY.md` first — this is the riskiest component, and the defaults
  matter.
- This is a fallback. Prefer `paperclip-plugin-m365` (Graph API) whenever your
  tenant allows an app registration.
- Confirm acceptable use with TSP IT: this is a real authenticated session against
  your real mailbox.
