# Next.js + Clerk + Supabase Hackathon Boilerplate

Simple starter for a hackathon:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Clerk for auth
- Supabase for database, storage, and RLS
- Protected dashboard route

Clerk owns authentication. Supabase trusts Clerk session tokens through the native third-party auth integration.

## 1. Install and run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## 2. Create your Clerk app

1. Go to `https://dashboard.clerk.com/`
2. Create a new application.
3. Choose the sign-in methods you want for the hackathon.
4. Open `API Keys`.
5. Copy:
   - Publishable key
   - Secret key

## 3. Create your Supabase project

1. Go to `https://supabase.com/dashboard`
2. Create a new project.
3. Choose your organization.
4. Pick a project name.
5. Set a database password and save it somewhere safe.
6. Pick the region closest to your users.
7. Wait for the project to finish provisioning.

## 4. Connect Clerk to Supabase

### In Clerk

1. In the Clerk Dashboard, open the Supabase integration setup page.
2. Activate the Supabase integration.
3. Copy the Clerk domain shown there.

### In Supabase

1. Open your Supabase project.
2. Go to `Authentication -> Sign In / Up`.
3. Select `Add provider`.
4. Choose `Clerk`.
5. Paste the Clerk domain from Clerk.
6. Save the provider.

This is the key step that allows Supabase to trust Clerk session tokens directly. This is the current recommended integration path from Supabase and Clerk.

## 5. Add your local environment variables

Create `.env.local` from `.env.example` and fill in:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

Where to find the Supabase values:

1. Open `Project Settings -> Data API` in Supabase.
2. Copy:
   - Project URL
   - Publishable key

The publishable key is the client-safe key formerly often called the anon/public key.

## 6. What you do not need anymore in Supabase

Because Clerk handles auth for this starter, you do **not** need to configure:

- Supabase magic-link auth
- Supabase email templates
- Supabase auth redirect URLs for sign-in emails
- the old Clerk JWT template integration

## 7. How Supabase auth works in this starter

This repo sends Clerk session tokens to Supabase instead of using Supabase Auth sessions:

- client-side helper: `lib/supabase/client.ts`
- server-side helper: `lib/supabase/server.ts`
- protected route middleware: `proxy.ts`

Supabase then evaluates RLS policies against the Clerk token claims via `auth.jwt()`.

## 8. Minimum RLS example for your first table

If you want to test the integration end-to-end, create a simple table in `Supabase -> SQL Editor`:

```sql
create table tasks (
  id bigserial primary key,
  name text not null,
  user_id text not null default auth.jwt()->>'sub'
);

alter table public.tasks enable row level security;

create policy "Users can view their own tasks"
on public.tasks
for select
to authenticated
using ((select auth.jwt()->>'sub') = user_id);

create policy "Users can insert their own tasks"
on public.tasks
for insert
to authenticated
with check ((select auth.jwt()->>'sub') = user_id);
```

What this does:

- `auth.jwt()->>'sub'` reads the Clerk user ID from the token
- `user_id` defaults to that Clerk user ID
- each signed-in user can only read and insert their own rows

## 9. How to query Supabase in your app

### In server code

Use `createServerSupabaseClient()` from `lib/supabase/server.ts`.

### In client code

Use `createBrowserSupabaseClient()` from `lib/supabase/client.ts` and pass Clerk's `session.getToken()` as the access token provider.

Example shape:

```ts
const client = createBrowserSupabaseClient(() => session?.getToken() ?? Promise.resolve(null))
```

## 10. First local smoke test

1. Run `npm run dev`
2. Open `http://localhost:3000`
3. Sign up or sign in with Clerk
4. Open `/dashboard`
5. Confirm you can access the protected page
6. If you added the sample `tasks` table and queries, confirm each user only sees their own rows

## 11. Deploy notes

After deployment:

1. Add your production Clerk keys in your hosting provider
2. Add your production Supabase URL and publishable key in your hosting provider
3. In Clerk, add your production domain to the allowed application URLs if needed
4. Keep the Clerk <-> Supabase provider connection on the same production Clerk instance

## 12. Included routes

- `/` public home page
- `/sign-in` Clerk sign-in page
- `/sign-up` Clerk sign-up page
- `/login` redirect alias to `/sign-in`
- `/dashboard` protected page

## 13. Important notes

- This starter does not create any tables automatically.
- This starter does not sync Clerk users into your database automatically.
- If you want user rows inside Postgres, add them yourself with webhooks or server code.
- For hackathons, this is usually enough: Clerk for auth, Supabase for data, and RLS with Clerk claims.
