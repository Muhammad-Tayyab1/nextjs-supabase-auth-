import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { AccountSettings } from "@/components/account-settings";
import { AuthMessage } from "@/components/auth-message";
import { AvatarUploader } from "@/components/avatar-uploader";
import { LogoutButton } from "@/components/logout-button";
import { MfaManager } from "@/components/mfa-manager";
import { PresenceWidget } from "@/components/presence-widget";
import { ProfileForm } from "@/components/profile-form";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Profile = {
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, bio, avatar_url")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  const identityLabel = user.email ?? user.phone ?? "Guest";
  const fallback = identityLabel.slice(0, 2).toUpperCase();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          This page is only reachable when signed in.
        </p>
      </div>

      <AuthMessage error={error} message={message} />

      <Card>
        <CardHeader>
          <CardTitle>Signed in as</CardTitle>
          <CardDescription>{identityLabel}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{user.is_anonymous ? "Anonymous" : "Verified"}</Badge>
          {user.app_metadata.provider && (
            <Badge variant="outline">{user.app_metadata.provider}</Badge>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Stored in the <code>profiles</code> table with row-level security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <AvatarUploader avatarUrl={profile?.avatar_url ?? null} fallback={fallback} />
          <ProfileForm
            displayName={profile?.display_name ?? null}
            bio={profile?.bio ?? null}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Who&apos;s online</CardTitle>
          <CardDescription>Live presence via Supabase Realtime</CardDescription>
        </CardHeader>
        <CardContent>
          <PresenceWidget userId={user.id} label={identityLabel} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Two-factor authentication</CardTitle>
          <CardDescription>Protect your account with an authenticator app</CardDescription>
        </CardHeader>
        <CardContent>
          <MfaManager />
        </CardContent>
      </Card>

      {!user.is_anonymous && (
        <Card>
          <CardHeader>
            <CardTitle>Account settings</CardTitle>
            <CardDescription>Update your email or password</CardDescription>
          </CardHeader>
          <CardContent>
            <AccountSettings email={user.email ?? null} />
          </CardContent>
        </Card>
      )}

      <LogoutButton />
    </main>
  );
}
