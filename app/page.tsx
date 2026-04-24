import {
  Show,
  UserButton,
} from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function HomePage() {
  const { userId } = await auth();
  const configured = isSupabaseConfigured();

  return (
    <main className="min-h-screen px-6 py-10 text-slate-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-8 shadow-2xl shadow-slate-950/20 backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-sky-300">
                Next.js + Clerk + Supabase
              </p>
              <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Boilerplate you can actually understand in one sitting.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                This starter keeps the stack small: App Router, TypeScript,
                Tailwind, Clerk auth, and Supabase ready for direct RLS access
                with Clerk session tokens.
              </p>
            </div>

            <Show when="signed-in">
              <div className="rounded-full border border-white/10 bg-white/5 p-2">
                <UserButton />
              </div>
            </Show>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Show when="signed-in">
              <Link
                className="rounded-full bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
                href="/dashboard"
              >
                Open dashboard
              </Link>
            </Show>
            <Show when="signed-out">
              <Link
                className="rounded-full bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
                href="/sign-in"
              >
                Sign in
              </Link>
            </Show>
            <Show when="signed-out">
              <Link
                className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/30 hover:bg-white/5"
                href="/sign-up"
              >
                Sign up
              </Link>
            </Show>
            <a
              className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/30 hover:bg-white/5"
              href="https://supabase.com/dashboard"
              rel="noreferrer"
              target="_blank"
            >
              Open Supabase
            </a>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-medium text-slate-400">Status</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {configured
                  ? "Supabase env configured"
                  : "Supabase env missing"}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {userId
                  ? "Signed in with Clerk. Supabase can now trust the same session token for RLS."
                  : "Add Clerk and Supabase values to .env.local, then sign in to test the full flow."}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-medium text-slate-400">Included</p>
              <p className="mt-2 text-lg font-semibold text-white">
                Public home, Clerk auth pages, protected dashboard
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                No sample schema, no sample CRUD, no component library.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
            <h2 className="text-xl font-semibold text-white">Setup checklist</h2>
            <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
              <li>1. Copy <code>.env.example</code> to <code>.env.local</code>.</li>
              <li>
                2. Create a Clerk app and paste its publishable and secret keys.
              </li>
              <li>
                3. Create a Supabase project and paste its URL and publishable
                key.
              </li>
              <li>
                4. Activate Clerk&apos;s Supabase integration and add Clerk as a
                third-party auth provider in Supabase.
              </li>
              <li>
                5. Run <code>npm run dev</code> and sign in from{" "}
                <code>/sign-in</code>.
              </li>
            </ol>

            <div className="mt-5 rounded-2xl border border-sky-400/20 bg-sky-400/10 p-4 text-sm text-sky-100">
              Clerk owns authentication now. Supabase no longer needs magic-link
              email templates, redirect URLs, or Auth UI setup for this starter.
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
            <h2 className="text-xl font-semibold text-white">Routes</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li>
                <code>/</code> public overview and setup notes
              </li>
              <li>
                <code>/sign-in</code> Clerk sign-in page
              </li>
              <li>
                <code>/sign-up</code> Clerk sign-up page
              </li>
              <li>
                <code>/dashboard</code> protected server-rendered page
              </li>
              <li>
                <code>/login</code> legacy alias that redirects to <code>/sign-in</code>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
