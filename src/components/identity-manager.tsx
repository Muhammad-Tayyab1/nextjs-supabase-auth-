"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { UserIdentity } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const PROVIDER_LABELS: Record<string, string> = {
  email: "Email",
  phone: "Phone",
  google: "Google",
  github: "GitHub",
};

export function IdentityManager() {
  const router = useRouter();
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();
  const [identities, setIdentities] = useState<UserIdentity[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadIdentities() {
      const { data, error } = await supabase.auth.getUserIdentities();
      if (!active) return;
      if (error) {
        setError(error.message);
        return;
      }
      setIdentities(data.identities);
    }
    loadIdentities();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function unlink(identity: UserIdentity) {
    setError(null);
    startTransition(async () => {
      const { error } = await supabase.auth.unlinkIdentity(identity);
      if (error) {
        setError(error.message);
        return;
      }
      setIdentities((current) =>
        current.filter((i) => i.identity_id !== identity.identity_id),
      );
      router.refresh();
    });
  }

  if (identities.length === 0 && !error) return null;

  return (
    <div className="space-y-2">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {identities.map((identity) => (
        <div key={identity.identity_id} className="flex items-center justify-between gap-2">
          <Badge variant="outline">
            {PROVIDER_LABELS[identity.provider] ?? identity.provider}
          </Badge>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isPending || identities.length <= 1}
            onClick={() => unlink(identity)}
          >
            Unlink
          </Button>
        </div>
      ))}
      {identities.length <= 1 && (
        <p className="text-muted-foreground text-xs">
          You need at least one sign-in method linked to your account.
        </p>
      )}
    </div>
  );
}
