import { UserButton } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();

  if (!isSupabaseConfigured()) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-10">
        <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-slate-950/70 p-8 text-slate-200 shadow-2xl shadow-slate-950/30">
          <h1 className="text-3xl font-semibold text-white">Setup needed</h1>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Add your Supabase URL and publishable key to <code>.env.local</code>{" "}
            before using Supabase from this dashboard.
          </p>
          <Link
            className="mt-6 inline-flex rounded-full bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
            href="/"
          >
            Return home
          </Link>
        </div>
      </main>
    );
  }

  const email = user?.primaryEmailAddress?.emailAddress ?? "No primary email";

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-slate-950/70 p-8 shadow-2xl shadow-slate-950/30">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-sky-300">
              Protected
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-white">
              Dashboard
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              This page is server-rendered and protected by Clerk. Any Supabase
              queries you run here can use the same Clerk session token for RLS.
            </p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 p-2">
            <UserButton />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
            <p className="text-sm font-medium text-slate-400">Signed in as</p>
            <p className="mt-2 text-xl font-semibold text-white">
              {email ?? "Unknown email"}
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
            <p className="text-sm font-medium text-slate-400">Clerk user ID</p>
            <p className="mt-2 break-all text-sm text-slate-200">
              {userId}
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white">Where to build next</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Use <code>lib/supabase/server.ts</code> in server code and{" "}
            <code>lib/supabase/client.ts</code> in client code to send Clerk
            tokens to Supabase. Then add your own tables and RLS policies.
          </p>
        </div>
      </div>
    </main>
  );
}
