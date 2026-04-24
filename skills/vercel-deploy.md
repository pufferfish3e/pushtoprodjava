# Vercel Deploy Skill

## Use this when

- preparing for demo deployment
- checking environment variables
- deciding what must be verified before sharing a link

## Goal

Get a stable demo deployment with the fewest moving parts.

## Must ship

- app builds on Vercel
- Clerk env vars are set
- Supabase env vars are set
- AI server routes do not expose secrets

## Deployment checklist

1. Confirm the local build path works.
2. Set production environment variables in Vercel.
3. Verify Clerk production URLs if needed.
4. Verify Supabase URL and publishable key are correct.
5. Test sign-in, dashboard load, and one API route after deploy.

## Good defaults

- keep server-only secrets on the server
- avoid Node APIs or packages that Vercel cannot run easily
- prefer route handlers over custom servers

## Do not do

- invent a custom deployment stack during the hackathon
- change hosting targets late unless the current path is fully blocked

## Acceptance checklist

- a deployed URL loads
- auth still works
- the core demo path works end to end
