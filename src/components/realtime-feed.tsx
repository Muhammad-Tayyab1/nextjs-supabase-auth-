"use client";

import { useEffect, useRef, useState } from "react";

import { postMessage } from "@/app/dashboard/actions";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type FeedMessage = {
  id: string;
  author: string;
  content: string;
  created_at: string;
};

export function RealtimeFeed({
  initialMessages,
}: {
  initialMessages: FeedMessage[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("public:messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const row = payload.new as FeedMessage;
          setMessages((current) =>
            current.some((m) => m.id === row.id) ? current : [...current, row],
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="space-y-3">
      <div className="max-h-56 space-y-2 overflow-y-auto rounded-md border p-3">
        {messages.length === 0 && (
          <p className="text-muted-foreground text-sm">No messages yet — say hello.</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className="text-sm">
            <span className="font-medium">{m.author}</span>{" "}
            <span className="text-muted-foreground">{m.content}</span>
          </div>
        ))}
      </div>
      <form
        ref={formRef}
        action={async (formData) => {
          formRef.current?.reset();
          await postMessage(formData);
        }}
        className="flex gap-2"
      >
        <Input name="content" placeholder="Say something..." required maxLength={280} />
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
}
