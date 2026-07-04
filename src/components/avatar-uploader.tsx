"use client";

import { useState } from "react";

import { uploadAvatar } from "@/app/auth/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AvatarUploader({
  avatarUrl,
  fallback,
}: {
  avatarUrl: string | null;
  fallback: string;
}) {
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <form action={uploadAvatar} className="flex items-center gap-4">
      <Avatar className="size-16">
        <AvatarImage src={preview ?? avatarUrl ?? undefined} alt="Avatar" />
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
      <div className="flex flex-1 items-center gap-2">
        <Input
          name="avatar"
          type="file"
          accept="image/*"
          className="text-sm"
          onChange={(e) => {
            const file = e.target.files?.[0];
            setPreview(file ? URL.createObjectURL(file) : null);
          }}
        />
        <Button type="submit" size="sm" variant="outline">
          Upload
        </Button>
      </div>
    </form>
  );
}
