# Clerk Skill

## Use this when

- protecting routes
- reading auth state
- connecting auth to Supabase
- deciding how much tenant logic is enough for the hackathon

## Goal

Make auth boring and reliable so the team can focus on the product demo.

## Must ship

- sign-in and sign-up work
- dashboard routes are protected
- server code can read auth state
- Supabase receives trusted auth context

## Recommended usage

- `auth()` in server components and route handlers
- `currentUser()` only when user profile details are needed
- `useAuth()` or `useUser()` in client code
- keep `proxy.ts` focused on access control, not data fetching

## Tenant guidance

Preferred:
- use Clerk organization data as the `org_id` boundary

Hackathon fallback:
- if Organizations setup is slowing the sprint, use a single signed-in tenant plus a fixed demo `org_id`
- document the simplification rather than blocking delivery

## Recommended file targets

- `proxy.ts`
- auth-related layout or providers
- `lib/supabase/server.ts`
- client auth helper code

## Do not do

- rebuild auth flows manually
- put business logic in `proxy.ts`
- let auth setup dominate the first hour

## Acceptance checklist

- protected pages redirect or guard correctly
- Supabase calls can be scoped by authenticated context
- the app can support a believable single-org demo even if full multi-org polish is postponed
