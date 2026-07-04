import Link from "next/link";

import { requestPasswordReset } from "@/app/auth/actions";
import { AuthMessage } from "@/components/auth-message";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Reset your password</CardTitle>
          <CardDescription>
            We&apos;ll email you a link to set a new password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthMessage error={error} message={message} />

          <form action={requestPasswordReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
              />
            </div>

            <Button type="submit" className="w-full">
              Send reset link
            </Button>
          </form>

          <p className="text-muted-foreground mt-6 text-center text-sm">
            Remembered your password?{" "}
            <Link href="/login" className="text-foreground font-medium hover:underline">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
