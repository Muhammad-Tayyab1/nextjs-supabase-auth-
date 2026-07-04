# Next.js + Supabase Auth

A production-style starter covering the Supabase platform end to end —
every Supabase Auth sign-in method, a Postgres table secured with row-level
security, file uploads via Supabase Storage, and a live presence widget over
Supabase Realtime — built with the Next.js App Router and shadcn/ui.

## Features

### Auth

- Email/password sign up with email confirmation
- Email/password log in
- Magic link (passwordless email OTP) sign-in
- Phone number sign-in/up via SMS OTP
- Forgot password / reset password flow
- Change email and change password from the dashboard
- Two-factor authentication (TOTP) enrollment and login challenge
- Anonymous ("continue as guest") sign-in
- Log out
- Protected `/dashboard` and `/reset-password` routes (redirect to `/login`
  when signed out); signed-in users are redirected away from `/login`,
  `/signup`, and `/forgot-password`
- Session refresh and MFA-aware route gating handled centrally in `proxy.ts`
- Server Actions for all form-based auth mutations — no client-side API
  routes needed

### Database

- A `profiles` table (`display_name`, `bio`, `avatar_url`) with row-level
  security policies scoping every row to its owner, auto-created via a
  trigger on `auth.users` — see `supabase/schema.sql`

### Storage

- Avatar upload to a public `avatars` bucket, scoped per-user with storage
  RLS policies

### Realtime

- A "who's online" presence widget on the dashboard using a Realtime channel

### UI

- Built with [shadcn/ui](https://ui.shadcn.com/) components (Tailwind CSS v4,
  Radix primitives), dark mode aware

## Tech stack

- [Next.js](https://nextjs.org/) 16 (App Router, TypeScript)
- [Supabase](https://supabase.com/) (Auth, Database, Storage, Realtime)
- [@supabase/ssr](https://supabase.com/docs/guides/auth/server-side/nextjs) for cookie-based server/browser clients
- [Tailwind CSS](https://tailwindcss.com/) v4
- [shadcn/ui](https://ui.shadcn.com/) / Radix UI primitives

## Getting started

### 1. Create a Supabase project

Create a free project at [supabase.com](https://supabase.com/dashboard), then
grab the **Project URL** and **anon public key** from
`Project Settings → API`.

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in the values:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run the database + storage setup

Open `Project → SQL Editor → New query` in the Supabase dashboard, paste in
the contents of [`supabase/schema.sql`](./supabase/schema.sql), and run it.
This creates the `profiles` table with RLS policies and the public `avatars`
storage bucket with per-user upload/update/delete policies.

### 4. Configure redirect URLs in Supabase

In your Supabase project, go to `Authentication → URL Configuration` and add
your app's callback URL to **Redirect URLs**:

```
http://localhost:3000/auth/callback
```

(Add your production URL too once you deploy, e.g.
`https://your-app.vercel.app/auth/callback`.)

### 5. Enable the auth methods you want to use

All of these are configured under `Authentication → Providers` /
`Authentication → Sign In / Providers` in the Supabase dashboard:

- **Email** — enabled by default (covers password login, magic link, and
  password reset).
- **Phone** — enable the Phone provider and configure an SMS provider
  (Twilio, MessageBird, Vonage, or Textlocal) to use phone/SMS OTP sign-in.
- **Anonymous sign-ins** — toggle on under `Authentication → Sign In / Providers → Anonymous Sign-Ins`.
- **MFA (TOTP)** — enabled by default; no extra configuration needed.

### 6. Install dependencies and run

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## How it works

- `src/lib/supabase/client.ts` — browser Supabase client
- `src/lib/supabase/server.ts` — server Supabase client (reads/writes auth cookies)
- `src/lib/supabase/middleware.ts` — refreshes the session on every request,
  redirects based on auth state, and routes to `/login/mfa` when a signed-in
  user still needs to complete a two-factor challenge
- `src/proxy.ts` — wires the middleware helper into Next.js (Next.js 16
  renamed the `middleware.ts` convention to `proxy.ts`)
- `src/app/auth/actions.ts` — Server Actions for password/magic-link/reset/
  email-change/profile/avatar mutations
- `src/app/auth/callback/route.ts` — exchanges the PKCE `code` param for a
  session (used by signup confirmation, magic link, password reset, and
  email change)
- `src/components/phone-otp-form.tsx` — client component driving the two-step
  phone OTP flow directly against the browser Supabase client
- `src/components/mfa-manager.tsx` — TOTP enroll/verify/unenroll UI on the
  dashboard
- `src/app/login/mfa/page.tsx` — the AAL2 challenge page shown mid-login when
  a user has TOTP enabled
- `src/components/presence-widget.tsx` — Realtime Presence channel showing
  who else is viewing the dashboard
- `src/components/avatar-uploader.tsx`, `src/app/auth/actions.ts#uploadAvatar` — Storage upload example
- `src/components/profile-form.tsx`, `#updateProfile` — Database read/write example
- `src/app/dashboard/page.tsx` — protected page composing all of the above
- `supabase/schema.sql` — the `profiles` table, its RLS policies, and the
  `avatars` storage bucket + policies

## Deploying

Deploy to [Vercel](https://vercel.com/) (or any Next.js host) and set the
same two environment variables in your project settings. Don't forget to add
the production callback URL to Supabase's redirect URL allow-list.

## License

MIT
