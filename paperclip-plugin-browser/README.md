# paperclip-plugin-browser

A **guarded** Outlook-on-the-web automation (Stagehand + Playwright) for the rare
cases the Microsoft Graph API can't be used — e.g. your tenant won't allow an app
registration. It **reads and drafts only, and never sends.**

> This is the highest-risk component in the system. Read `docs/SECURITY.md` before
> using it, and prefer `paperclip-plugin-m365` (Graph) whenever you can.

## What it does

- List recent inbox messages (read-only).
- Read an open message (returned as untrusted data).
- Draft a reply or new email — left in Outlook for you to review and send.

## What protects you

- Sending/deleting/forwarding are hard-blocked in code.
- Every action is checked against a domain allowlist (off-domain = refused).
- Only a small allowlisted set of operations can run.
- Email content is treated as data, never as instructions; your draft text is typed,
  not passed through the model.
- Isolated browser profile; headed by default; optional on-device model.

## Quickstart

```bash
cp .env.example .env
npm install
npx playwright install chromium
npm run login      # sign in once into the isolated profile
npm run inbox
npm run draft -- "<search>" "<reply text>"
```

Full setup: `docs/SETUP.md`. Security model: `docs/SECURITY.md`. Runner wiring:
`docs/INTEGRATION.md`.

## What's verified

Compiles cleanly against the real `@browserbasehq/stagehand` v3 types, and the
guard logic (domain allowlist, action allowlist) is unit-tested — including
lookalike-host and forbidden-action cases. Live browser runs require Playwright's
Chromium and a sign-in on your machine, which can't be exercised in CI here.

## Make it yours

Ships without git history so your first commit is yours:

```bash
git init && git add -A && git commit -m "Initial commit: guarded Outlook browser tool"
git remote add origin git@github.com:<you>/paperclip-plugin-browser.git
git push -u origin main
```

## License

MIT (recommended).
