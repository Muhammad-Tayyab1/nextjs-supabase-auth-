# Next.js + Supabase Auth

A production-style starter covering the Supabase platform end to end —
every Supabase Auth sign-in method (including OAuth, anonymous account
linking, and account deletion), Postgres tables secured with row-level
security (profiles, a to-do list, notes), file uploads via Supabase Storage,
and Realtime Presence + Postgres Changes examples — built with the Next.js
App Router and shadcn/ui, with unit tests, e2e tests, and CI wired up out of
the box.

## Features

### Auth

- Email/password sign up with email confirmation
- Email/password log in
- Magic link (passwordless email OTP) sign-in
- Phone number sign-in/up via SMS OTP
- OAuth social sign-in (Google, GitHub)
- Forgot password / reset password flow
- Change email and change password from the dashboard
- Two-factor authentication (TOTP) enrollment and login challenge
- Anonymous ("continue as guest") sign-in, with account linking so a guest
  can convert their session to a permanent email/password or OAuth account
- Account deletion (permanently deletes the user and all owned data)
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
- A `tasks` table backing a to-do list (create, complete, delete), scoped to
  its owner with row-level security
- A `notes` table backing a free-form notes list (create, edit, delete),
  scoped to its owner with row-level security

### Storage

- Avatar upload to a public `avatars` bucket, scoped per-user with storage
  RLS policies

### Realtime

- A "who's online" presence widget on the dashboard using a Realtime Presence channel
- A live activity feed streamed with Realtime Postgres Changes on a `messages` table

### UI

- Built with [shadcn/ui](https://ui.shadcn.com/) components (Tailwind CSS v4,
  Radix primitives), dark mode aware

### Developer experience

- GitHub Actions CI (`.github/workflows/ci.yml`) running lint, typecheck,
  unit tests, build, and an end-to-end smoke suite on every pull request
- Unit/component tests with [Vitest](https://vitest.dev/) + React Testing
  Library (`npm test`) — pure logic (route gating, `cn()`) and presentational
  components, no live Supabase project required
- End-to-end smoke tests with [Playwright](https://playwright.dev/)
  (`npm run test:e2e`) covering the public pages and route-protection
  redirects against a running dev server
- `npm run typecheck` for a standalone TypeScript check

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

Fill in the values from `Project Settings → API`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

`SUPABASE_SERVICE_ROLE_KEY` is the **service_role secret** — never prefix it
with `NEXT_PUBLIC_` or send it to the browser. It's only read inside the
account-deletion Server Action (`src/lib/supabase/admin.ts`), since deleting
an auth user requires Supabase's Admin API, which a user's own session can't
call.

### 3. Run the database + storage setup

Open `Project → SQL Editor → New query` in the Supabase dashboard, paste in
the contents of [`supabase/schema.sql`](./supabase/schema.sql), and run it.
This creates the `profiles`, `tasks`, and `notes` tables with RLS policies,
the public `avatars` storage bucket with per-user upload/update/delete
policies, and the `messages` table (added to the `supabase_realtime`
publication) used by the live activity feed.

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
- **Google / GitHub OAuth** — under `Authentication → Sign In / Providers`,
  enable Google and/or GitHub and paste in the Client ID/Secret from an OAuth
  app you register with each provider. Use the **Callback URL** shown on that
  provider's settings page (`https://<project-ref>.supabase.co/auth/v1/callback`)
  as the redirect URI when registering the OAuth app — that's a Supabase URL,
  not this app's `/auth/callback` route.
- **Anonymous sign-ins** — toggle on under `Authentication → Sign In / Providers → Anonymous Sign-Ins`.
  To let guests link an OAuth identity (as opposed to just email/password),
  also enable **Manual linking** under `Authentication → Settings`.
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
- `src/lib/supabase/middleware.ts` — refreshes the session on every request
  and applies the routing decision from `route-guard.ts`
- `src/lib/supabase/route-guard.ts` — the pure, unit-tested routing decision
  (protected pages, auth pages, the `/login/mfa` challenge) with no
  Supabase/cookie dependencies
- `src/lib/supabase/admin.ts` — service-role client used only by Server
  Actions that need Supabase's Admin API (account deletion)
- `src/proxy.ts` — wires the middleware helper into Next.js (Next.js 16
  renamed the `middleware.ts` convention to `proxy.ts`)
- `src/app/auth/actions.ts` — Server Actions for password/magic-link/OAuth/
  reset/email-change/profile/avatar/account-linking mutations
- `src/app/auth/callback/route.ts` — exchanges the PKCE `code` param for a
  session (used by signup confirmation, magic link, OAuth, password reset,
  email change, and account linking)
- `src/components/phone-otp-form.tsx` — client component driving the two-step
  phone OTP flow directly against the browser Supabase client
- `src/components/oauth-buttons.tsx` — Google/GitHub sign-in buttons calling
  `signInWithOAuth`
- `src/components/account-linking.tsx` — lets an anonymous ("guest") user
  convert to a permanent account via `updateUser` (email/password) or
  `linkIdentity` (OAuth)
- `src/components/mfa-manager.tsx` — TOTP enroll/verify/unenroll UI on the
  dashboard
- `src/app/login/mfa/page.tsx` — the AAL2 challenge page shown mid-login when
  a user has TOTP enabled
- `src/components/presence-widget.tsx` — Realtime Presence channel showing
  who else is viewing the dashboard
- `src/components/realtime-feed.tsx`, `src/app/dashboard/actions.ts#postMessage` —
  Realtime Postgres Changes example: a shared feed backed by the `messages`
  table, streamed live to every connected client
- `src/components/avatar-uploader.tsx`, `src/app/auth/actions.ts#uploadAvatar` — Storage upload example
- `src/components/profile-form.tsx`, `#updateProfile` — Database read/write example
- `src/components/task-list.tsx`, `src/app/dashboard/actions.ts#createTask/toggleTask/deleteTask` — a to-do list backed by the `tasks` table
- `src/components/notes-list.tsx`, `#createNote/updateNote/deleteNote` — a notes list backed by the `notes` table
- `src/app/dashboard/loading.tsx` — Skeleton loading state shown while the dashboard's Server Component data is fetched
- `src/components/delete-account-dialog.tsx`, `src/app/dashboard/actions.ts#deleteAccount` —
  account deletion: cleans up the user's avatar files, then calls the Admin
  API to delete the auth user (row data cascades via foreign keys)
- `src/app/dashboard/page.tsx` — protected page composing all of the above
- `supabase/schema.sql` — the `profiles`, `tasks`, `notes`, and `messages`
  tables and the `avatars` storage bucket, with their RLS policies and
  realtime publication
- `.github/workflows/ci.yml` — lint, typecheck, unit tests, build, and e2e
  smoke tests on every pull request
- `vitest.config.mts`, `**/__tests__/*` — unit/component test setup and specs
- `playwright.config.ts`, `e2e/smoke.spec.ts` — end-to-end smoke test setup and specs

## Deploying

Deploy to [Vercel](https://vercel.com/) (or any Next.js host) and set the
same environment variables (including `SUPABASE_SERVICE_ROLE_KEY`, as a
server-only/secret variable) in your project settings. Don't forget to add
the production callback URL to Supabase's redirect URL allow-list.

## License

MIT
