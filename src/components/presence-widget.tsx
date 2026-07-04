"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";

type PresenceUser = {
  label: string;
  onlineAt: string;
};

export function PresenceWidget({
  userId,
  label,
}: {
  userId: string;
  label: string;
}) {
  const [users, setUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel("dashboard-presence", {
      config: { presence: { key: userId } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<PresenceUser>();
        setUsers(Object.values(state).flat());
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            label,
            onlineAt: new Date().toISOString(),
          } satisfies PresenceUser);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, label]);

  return (
    <div className="space-y-2">
      <p className="text-muted-foreground text-sm">
        {users.length} {users.length === 1 ? "person" : "people"} viewing this
        dashboard right now
      </p>
      <div className="flex flex-wrap gap-2">
        {users.map((u, i) => (
          <Badge key={`${u.label}-${i}`} variant="secondary">
            {u.label}
          </Badge>
        ))}
      </div>
    </div>
  );
}
