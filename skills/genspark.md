# Genspark Skill

## Use this when

- building the natural-language query box
- defining the query API contract
- deciding what Genspark should and should not do in the MVP

## Goal

Use Genspark for one clear judge-visible task:

`question about event status -> grounded answer from task data`

## Must ship

- one input field
- one response panel
- a backend path that turns a plain-English question into a useful answer
- 3 to 5 tested example prompts for demo day

## Canonical use case

Examples:
- "What is still unresolved for Appreciation Dinner?"
- "Which tasks are blocked this week?"
- "Who is overloaded across active events?"

## Scope boundary

Genspark is in scope for:
- natural-language query
- short summaries over structured task data

Genspark is out of scope for:
- Telegram alerts
- scheduled digests
- autonomous background monitoring
- replacing Claude extraction

## Integration guidance

- keep a clean adapter boundary between the UI and the agent call
- return plain-English answers plus optional supporting task references
- if the real integration is blocked, keep the UI and query contract ready so the swap-in is small

## Recommended file targets

- `app/api/query/route.ts`
- `components/*query*`
- `lib/genspark.*` or similar adapter file
- `data/demo/questions.*`

## Acceptance checklist

- a user can ask a plain-English question
- the answer is grounded in actual stored task data
- the demo has at least one strong question that immediately shows value
