import Link from "next/link";

export default async function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h1 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-white">
          Something went wrong
        </h1>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          {message || "An unexpected authentication error occurred."}
        </p>
        <Link
          href="/login"
          className="font-medium text-emerald-600 hover:underline"
        >
          Back to log in
        </Link>
      </div>
    </main>
  );
}
