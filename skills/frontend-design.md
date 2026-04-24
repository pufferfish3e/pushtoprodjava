# Frontend Build Skill

## Use this when

- building pages or components
- deciding how polished the UI needs to be
- translating the product story into screens quickly

## Goal

Ship a clean, credible operational dashboard without locking the team into a final brand system.

## Design status

- Project name: `[PROJECT_NAME]`
- Permanent design system: `[DESIGN_SYSTEM_TBD]`

That means:
- do not invent final brand tokens
- do not make visual choices that will be painful to replace later

## Must ship

- clear note input area
- event overview screen
- event detail task table
- loading, empty, and error states
- good readability on laptop-sized screens

## Preferred temporary style

- neutral Tailwind palette
- strong contrast
- simple cards, lists, and tables
- urgency stands out clearly
- blockers are visible without a tooltip hunt

## Library guidance

- if `shadcn/ui` is installed quickly, prefer it for primitives
- if not, do not stall the sprint waiting for component setup

## Information hierarchy

Show the important things first:
- event name
- days until event or upcoming date
- blocker count
- high-urgency tasks
- assignee and deadline

## Do not do

- build a complex motion system
- spend hours theming
- hide critical status inside modals
- make the home page a marketing landing page

## Acceptance checklist

- the app looks intentional even without a permanent brand
- a judge can understand status in a few seconds
- the dashboard works with seeded data before live AI is perfect
