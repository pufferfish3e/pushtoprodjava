# Demo Data Skill

## Use this when

- creating fixtures
- writing sample notes
- stabilizing the live demo

## Goal

Give the app believable SPSU-rooted data that makes the product feel real on first glance.

## Required fixture set

Prepare:
- 3 concurrent active events
- 1 obvious blocker
- 1 urgency-5 task
- 1 cross-event people conflict
- 3 to 5 sample natural-language questions
- 3 note inputs for extraction testing

## Good event choices

Use realistic SPSU-style examples such as:
- SPSU Festival
- Cyber Cup
- Appreciation Dinner
- Forum 1
- CIP3

## Good people choices

Reuse believable names from the SPSU context where helpful:
- MANI
- KEIRA
- PARIS
- RYAN
- HUSNINA
- JIALE
- SIRAJ

## Good note qualities

Notes should be:
- messy but readable
- meeting-like, not essay-like
- rich enough to produce tasks and blockers
- consistent with the event dates and urgency story

## Recommended storage

Once code paths exist, keep fixtures in repo files such as:
- `data/demo/events.*`
- `data/demo/notes.*`
- `data/demo/questions.*`

## Acceptance checklist

- the team can rehearse with fixed data
- extraction behaves consistently on the sample notes
- the demo does not depend on improvising realistic inputs live
