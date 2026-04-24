# Claude API Skill

## Use this when

- building `app/api/process`
- writing `lib/claude.*`
- changing the extraction prompt
- validating Claude outputs against the app schema

## Goal

Turn messy meeting notes into predictable structured data that the rest of the app can trust.

## Must ship

- server-side Claude call only
- one stable extraction prompt
- JSON parse plus schema validation
- extraction tested on at least 3 sample note inputs

## Nice if time allows

- latency logging
- light retry or error messaging
- prompt variants for follow-up evaluation

## Do not do

- call Claude from the browser
- rely on regex parsing
- expand into full document generation before the dashboard flow is stable
- keep changing the schema late in the sprint

## Recommended file targets

- `app/api/process/route.ts`
- `lib/claude.ts`
- `lib/types.ts`
- `data/demo/*` once fixtures exist

## Working shape

Prefer one extraction result shape that stays stable:

```json
{
  "event": "Appreciation Dinner",
  "meeting_number": 2,
  "tasks": [
    {
      "id": "t1",
      "assignee": "John",
      "task": "Confirm venue deposit",
      "deadline": "2026-04-26",
      "urgency": 5,
      "status": "pending",
      "is_blocker": true,
      "notes": "Flagged as urgent in meeting"
    }
  ],
  "decisions": [],
  "conflicts": []
}
```

## Workflow

1. Freeze the JSON schema early.
2. Write the prompt around that schema.
3. Parse JSON only.
4. Validate the parsed object.
5. Reject or repair invalid output before saving.
6. Test on fixed sample notes, not only happy-path notes.

## Acceptance checklist

- extraction works with pasted notes
- invalid AI output does not silently corrupt app state
- urgency and blockers appear in the output
- at least one sample note produces a believable conflict or blocker signal
