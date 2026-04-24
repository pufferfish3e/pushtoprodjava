# Dashboard Build Skill

## Use this when

- building the home view
- building the event detail page
- deciding what status signals matter most

## Goal

Make event status legible immediately for a CC, VCC, advisor, or judge.

## Home view should answer

- which events are active right now
- which events are closest to deadline
- where blockers exist
- whether one person is overloaded across events

## Event detail view should answer

- what tasks are still open
- what is urgent
- what is blocked
- who owns each task
- what needs attention before the event date

## Recommended sorting

Sort tasks by:
1. blocker first
2. higher urgency first
3. nearer deadline first
4. stable secondary ordering

## Minimum states to build

- empty state
- loading state
- error state
- populated state with believable data

## Recommended file targets

- `app/dashboard/page.tsx`
- `app/dashboard/events/[id]/page.tsx`
- `components/dashboard/*`
- `components/events/*`

## Do not do

- build a marketing homepage instead of an ops dashboard
- hide critical task information behind hover states
- spend a large chunk of time on secondary visualizations before the table is strong

## Acceptance checklist

- a judge can understand event status in under 10 seconds
- one event page clearly shows urgency and blockers
- the home page shows cross-event value, not just a list of cards
