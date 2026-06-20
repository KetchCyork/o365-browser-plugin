# Wiring outlook-web into the mesh runner

The browser executor exposes the capability `outlook-web`. Register it in
paperclip-mesh-runner the same way as other executors (npm install this package
and add it to the runner's BUILTIN list, or copy the executor file), then advertise
the capability on the node that has a signed-in profile:

```
RUNNER_CAPABILITIES=m365,outlook-web,memory
```

## When the runner should choose it

Prefer Graph (`m365`) for read/draft/calendar. Route to `outlook-web` only when:

- the tenant won't permit an Entra app registration (no API path), or
- a specific thing isn't reachable via Graph.

A simple policy: tasks tagged `needs:graph-fallback` (or that failed on the m365
executor) go to `outlook-web`.

## Behavior

- Read/draft only; never sends (see docs/SECURITY.md).
- Builds a fresh, isolated browser per task and closes it after — no lingering
  authenticated browser.
- Email text returned by a read is untrusted DATA; the consuming model must treat
  it as content, not instructions. The executor prefixes it with a warning to that
  effect.
