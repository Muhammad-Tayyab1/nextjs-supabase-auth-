import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>
            {message || "An unexpected authentication error occurred."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login" className="text-primary text-sm font-medium hover:underline">
            Back to log in
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
