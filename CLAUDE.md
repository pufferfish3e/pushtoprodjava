# Claude Guidance for [PROJECT_NAME]

Read `AGENTS.md` first.
This file is only a Claude-specific companion.

## Core stance

Optimize for the 5-hour hackathon, not for architectural perfection.
Choose the smallest implementation that makes the demo stronger and the team faster.

## Claude-specific defaults

- Prefer the latest stable Sonnet-tier model available to the team for extraction work
- Keep Claude calls server-side only
- Use the Messages API
- Ask Claude for structured JSON, then validate it
- Retest extraction and briefing prompts on fixed sample transcripts before changing the model or prompt near demo time

## What Claude should focus on in this repo

- transcript -> structured operational state (tasks, owners, deadlines, blockers, decisions, urgency)
- role-specific briefing generation: Secretary / OC / CC VCC / EXCO get different slices of the same state
- urgency inference and blocker detection
- secretary-usable minutes draft generation from transcript + structured state
- risk signal derivation (overloaded person, unowned blocker, critical-path slip)
- concise, predictable outputs for the dashboard briefing tabs and review UI
- code changes that preserve clear contracts between the 6-agent pipeline stages

## What Claude should not optimize for

- branding decisions
- overbuilt abstractions
- background automation beyond the agreed MVP
- wide refactors that make parallel work harder

## Preferred implementation style

- use the existing Next.js 16 starter
- keep data shapes simple and mostly snake_case
- favor direct route-handler code over extra service layers until the MVP is stable
- leave logs and error messages readable for both humans and agents

## When in doubt

If there is a tradeoff between "more impressive" and "more reliable in a live demo," choose the reliable option.
