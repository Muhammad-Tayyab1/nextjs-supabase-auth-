import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="w-full max-w-lg text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-wide text-emerald-600">
          Next.js &middot; Supabase
        </p>
        <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
          Auth flow starter
        </h1>
        <p className="mb-8 text-gray-500 dark:text-gray-400">
          Sign up, email confirmation, session-aware middleware, and a
          protected dashboard — built with the Next.js App Router and
          Supabase Auth.
        </p>

        <div className="flex items-center justify-center gap-3">
          {user ? (
            <Link
              href="/dashboard"
              className="rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
            >
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
