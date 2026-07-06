"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function postMessage(formData: FormData) {
  const { supabase, user } = await requireUser();

  const content = (formData.get("content") as string)?.trim();

  if (!content) {
    return;
  }

  if (content.length > 280) {
    redirect(
      `/dashboard?error=${encodeURIComponent("Messages must be 280 characters or fewer")}`,
    );
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

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return { supabase, user };
}

export async function createTask(formData: FormData) {
  const { supabase, user } = await requireUser();

  const title = (formData.get("title") as string)?.trim();

  if (!title) {
    return;
  }

  const { error } = await supabase
    .from("tasks")
    .insert({ user_id: user.id, title });

  if (error) {
    redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard");
}

export async function toggleTask(formData: FormData) {
  const { supabase } = await requireUser();

  const id = formData.get("id") as string;
  const isComplete = formData.get("isComplete") === "true";

  const { error } = await supabase
    .from("tasks")
    .update({ is_complete: !isComplete })
    .eq("id", id);

  if (error) {
    redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard");
}

export async function deleteTask(formData: FormData) {
  const { supabase } = await requireUser();

  const id = formData.get("id") as string;

  const { error } = await supabase.from("tasks").delete().eq("id", id);

  if (error) {
    redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard");
}

export async function createNote(formData: FormData) {
  const { supabase, user } = await requireUser();

  const title = (formData.get("title") as string)?.trim() || "Untitled";
  const body = (formData.get("body") as string) ?? "";

  const { error } = await supabase
    .from("notes")
    .insert({ user_id: user.id, title, body });

  if (error) {
    redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard");
}

export async function updateNote(formData: FormData) {
  const { supabase } = await requireUser();

  const id = formData.get("id") as string;
  const title = (formData.get("title") as string)?.trim() || "Untitled";
  const body = (formData.get("body") as string) ?? "";

  const { error } = await supabase
    .from("notes")
    .update({ title, body, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard");
}

export async function deleteNote(formData: FormData) {
  const { supabase } = await requireUser();

  const id = formData.get("id") as string;

  const { error } = await supabase.from("notes").delete().eq("id", id);

  if (error) {
    redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard");
}

export async function deleteAccount() {
  const { supabase, user } = await requireUser();

  const { data: avatarFiles } = await supabase.storage
    .from("avatars")
    .list(user.id);

  if (avatarFiles && avatarFiles.length > 0) {
    await supabase.storage
      .from("avatars")
      .remove(avatarFiles.map((file) => `${user.id}/${file.name}`));
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);
  }

  await supabase.auth.signOut();
  redirect(`/?message=${encodeURIComponent("Your account has been deleted")}`);
}
