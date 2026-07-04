"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type OAuthProvider = "google" | "github";

async function getOrigin() {
  return (await headers()).get("origin");
}

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal && aal.nextLevel === "aal2" && aal.nextLevel !== aal.currentLevel) {
    redirect("/login/mfa");
  }

  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const origin = await getOrigin();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  redirect(
    `/signup?message=${encodeURIComponent("Check your email to confirm your account")}`,
  );
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function loginWithMagicLink(formData: FormData) {
  const supabase = await createClient();
  const origin = await getOrigin();

  const email = formData.get("email") as string;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect(
    `/login?message=${encodeURIComponent("Check your email for a magic link")}`,
  );
}

export async function signInWithOAuth(formData: FormData) {
  const supabase = await createClient();
  const origin = await getOrigin();

  const provider = formData.get("provider") as OAuthProvider;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect(data.url);
}

export async function signInAsGuest() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInAnonymously();

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient();
  const origin = await getOrigin();

  const email = formData.get("email") as string;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });

  if (error) {
    redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect(
    `/forgot-password?message=${encodeURIComponent(
      "Check your email for a password reset link",
    )}`,
  );
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const password = formData.get("password") as string;

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect(`/reset-password?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect(
    `/dashboard?message=${encodeURIComponent("Your password has been updated")}`,
  );
}

export async function requestEmailChange(formData: FormData) {
  const supabase = await createClient();
  const origin = await getOrigin();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const email = formData.get("email") as string;

  const { error } = await supabase.auth.updateUser(
    { email },
    { emailRedirectTo: `${origin}/auth/callback?next=/dashboard` },
  );

  if (error) {
    redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);
  }

  redirect(
    `/dashboard?message=${encodeURIComponent(
      "Check your new email address to confirm the change",
    )}`,
  );
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const displayName = formData.get("displayName") as string;
  const bio = formData.get("bio") as string;

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    display_name: displayName,
    bio,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard");
  redirect(
    `/dashboard?message=${encodeURIComponent("Profile updated")}`,
  );
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const file = formData.get("avatar") as File;

  if (!file || file.size === 0) {
    redirect(`/dashboard?error=${encodeURIComponent("Choose an image first")}`);
  }

  const extension = file.name.split(".").pop() ?? "png";
  const path = `${user.id}/avatar.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    redirect(`/dashboard?error=${encodeURIComponent(uploadError.message)}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);

  const { error: updateError } = await supabase.from("profiles").upsert({
    id: user.id,
    avatar_url: `${publicUrl}?t=${Date.now()}`,
    updated_at: new Date().toISOString(),
  });

  if (updateError) {
    redirect(`/dashboard?error=${encodeURIComponent(updateError.message)}`);
  }

  revalidatePath("/dashboard");
  redirect(`/dashboard?message=${encodeURIComponent("Avatar updated")}`);
}

export async function linkEmailPassword(formData: FormData) {
  const supabase = await createClient();
  const origin = await getOrigin();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.updateUser(
    { email, password },
    { emailRedirectTo: `${origin}/auth/callback?next=/dashboard` },
  );

  if (error) {
    redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);
  }

  redirect(
    `/dashboard?message=${encodeURIComponent(
      "Check your email to confirm and finish creating your account",
    )}`,
  );
}

export async function linkOAuthIdentity(formData: FormData) {
  const supabase = await createClient();
  const origin = await getOrigin();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const provider = formData.get("provider") as OAuthProvider;

  const { data, error } = await supabase.auth.linkIdentity({
    provider,
    options: {
      redirectTo: `${origin}/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);
  }

  redirect(data.url);
}
