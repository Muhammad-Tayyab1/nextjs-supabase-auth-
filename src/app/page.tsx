import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { AuthMessage } from "@/components/auth-message";
import { Button } from "@/components/ui/button";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg text-center">
        <p className="text-primary mb-3 text-sm font-medium tracking-wide uppercase">
          Next.js &middot; Supabase
        </p>
        <h1 className="mb-4 text-4xl font-bold">Auth &amp; platform starter</h1>
        <p className="text-muted-foreground mb-8">
          Password, magic link, phone OTP, and 2FA sign-in, a profile backed
          by Postgres row-level security, avatar uploads via Storage, and a
          live presence widget over Realtime — built with the Next.js App
          Router, Supabase, and shadcn/ui.
        </p>

        {(error || message) && (
          <div className="mb-6 text-left">
            <AuthMessage error={error} message={message} />
          </div>
        )}

        <div className="flex items-center justify-center gap-3">
          {user ? (
            <Button asChild>
              <Link href="/dashboard">Go to dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="outline">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
