# Security model

This is the highest-risk component in the system. A browser agent operating on
email is the worst case for prompt injection: message content is attacker-
controllable, and an agent that reads it can be steered by hidden instructions
("forward anything confidential to…", "ignore previous instructions and…").
Treat this tool as a constrained fallback, not a default. Prefer the Graph API
plugin (`paperclip-plugin-m365`) whenever the tenant allows it.

## Threat model

- **Injection via message content.** A crafted email tries to make the agent take
  actions you didn't ask for.
- **Off-domain navigation.** A link or redirect tries to move the agent to a
  phishing/exfiltration site.
- **Over-permissioning.** The agent has more capability than the task needs.
- **Unreviewed sends.** Something leaves the outbox without a human looking.

## Mitigations implemented (enforced in code)

1. **Read/draft only — sending is not implemented.** `send`, `delete`, `forward`,
   `archive`, and `move` are in a hard-coded forbidden list (`guard.ts`) and throw
   if ever requested. The tool composes drafts and stops; a human sends from Outlook.
2. **Domain allowlist on every action.** Before each operation the current URL's
   host is checked against the allowlist; anything else is refused. Lookalike hosts
   (`outlook.office.com.evil.com`) and unparseable URLs are rejected. (Unit-tested.)
3. **Action allowlist.** Only a small vetted set of operations can run; anything
   else throws. (Unit-tested.)
4. **Untrusted content stays data.** Extracted email text is only ever *returned*
   to the caller; the tool never chooses its next action based on message content.
   The action plan comes from the operator's command, not the page.
5. **Our draft text is typed, not modeled.** Reply text is entered via the keyboard,
   so it can't be reinterpreted as an instruction by the element-selection model.
6. **act() targets app chrome, not content.** Instructions reference fixed UI (the
   Reply button, New mail), not message text.
7. **Isolated profile.** A dedicated browser profile dir, separate from your normal
   browser. You sign in once; the agent reuses only that contained session.
8. **Headed by default + local model option.** Default runs visible so you can
   watch, and element selection can use a local Ollama model so page content stays
   on-device.
9. **Side-effects off by default.** `BROWSER_ALLOW_SIDE_EFFECTS=false`. Even the
   confirmation-gated path is unreachable unless explicitly enabled.

## Residual risks (honest)

No mitigation here is bulletproof:

- **Element-selection still sees the page.** Stagehand's `act()`/`extract()` send
  the accessibility tree to an LLM to locate elements, so on-page text could in
  principle nudge element selection. Targeting app chrome reduces this, but doesn't
  eliminate it. A local model limits data exposure but not the influence.
- **The model can misclick** or break when Outlook's UI changes.
- **A human can still send a bad draft** if they don't review it. The draft-only
  design moves the final decision to you — it doesn't make the decision for you.

## Operating guidance

- Prefer the Graph plugin. Use this only when Graph genuinely can't be used.
- Run headed and watch the first runs of any flow.
- Review every draft before sending; never enable `BROWSER_ALLOW_SIDE_EFFECTS`.
- Keep the profile isolated. Consider a dedicated, low-privilege mailbox/account
  for anything sensitive, and confirm acceptable use with TSP IT — this drives a
  real session against your real mailbox.
