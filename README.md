# O365 Browser Plugin

This repository contains a browser-based Outlook automation plugin for use in the Agent OS ecosystem.

It is designed for cases where the Microsoft Graph API cannot be used due to tenant restrictions. It provides guarded read and draft assistance for Outlook on the web while keeping unsafe actions blocked.

## What this repo does

- Provides a browser automation tool for Outlook Web access.
- Supports reading messages and drafting replies.
- Enforces security guards to prevent sending, deleting, or unsafe actions.
- Keeps sensitive data on the local machine.

## Capabilities

- Read inbox messages in a guarded, read-only manner.
- Draft replies and new emails without sending.
- Protects against off-domain or unauthorized automation.
- Works as part of the mesh-enabled Agent OS ecosystem.

## Installation

```bash
cd "O365 Browser plugin/paperclip-plugin-browser"
cp .env.example .env
npm install
npx playwright install chromium
```

## Usage

```bash
npm run login
npm run inbox
npm run draft -- "<search>" "<reply text>"
```

## Documentation

- `paperclip-plugin-browser/docs/SETUP.md` — environment and browser setup.
- `paperclip-plugin-browser/docs/SECURITY.md` — security model and guard details.
- `paperclip-plugin-browser/docs/INTEGRATION.md` — integration with Agent OS / mesh runner.

## Notes

This repo is intended for secure, read-only Outlook Web automation when Graph access is not available.
