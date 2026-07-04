import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/logout-button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h1 className="mb-1 text-2xl font-semibold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          This page is only reachable when signed in.
        </p>

        <div className="mb-6 rounded-md bg-gray-50 p-4 text-sm dark:bg-gray-800">
          <p className="text-gray-500 dark:text-gray-400">Signed in as</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {user.email}
          </p>
        </div>

        <LogoutButton />
      </div>
    </main>
  );
}
