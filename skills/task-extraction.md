# Task Extraction Workflow Skill

## Use this when

- implementing note intake
- building the review step
- deciding how extraction should land in the database

## Goal

Make note ingestion reliable enough that the dashboard and demo can trust it.

## Working flow

1. User pastes raw notes.
2. App sends notes plus event context to Claude.
3. Claude returns structured JSON.
4. App validates the output.
5. User reviews or lightly edits if needed.
6. App saves approved tasks to Supabase.

## Must capture

- assignee
- task
- deadline if present
- urgency
- status
- blocker flag
- notes

## Review guidance

Review should be fast.
Do not build a full document editor.
The user should be able to:
- sanity check extracted tasks
- correct obvious bad fields
- publish or save

## Recommended file targets

- `app/api/process/route.ts`
- note input component
- review component
- shared extraction types

## Do not do

- combine extraction, query, and export into one giant workflow
- make the review UI slower than the original manual process

## Acceptance checklist

- tasks can move from notes to persisted rows
- the user sees what was extracted before publish
- the schema is stable enough for the dashboard and query layer
