"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function postMessage(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const content = (formData.get("content") as string)?.trim();

  if (!content) {
    return;
  }

  const { error } = await supabase.from("messages").insert({
    user_id: user.id,
    author: user.email ?? user.phone ?? "Guest",
    content,
  });

  if (error) {
    redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard");
}
