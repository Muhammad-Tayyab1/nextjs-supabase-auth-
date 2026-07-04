# Next.js + Supabase Auth

A clean, production-style authentication flow built with the Next.js App
Router and Supabase Auth — sign up with email confirmation, log in, log out,
and a protected dashboard route, with session refresh handled in middleware.

## Features

- Email/password sign up with email confirmation
- Email/password log in
- Log out
- Protected `/dashboard` route (redirects to `/login` when signed out)
- Signed-in users are redirected away from `/login` and `/signup`
- Session refresh handled centrally in middleware (`src/middleware.ts`)
- Server Actions for all auth mutations — no client-side API routes needed
- Tailwind CSS UI, dark mode aware

## Tech stack

- [Next.js](https://nextjs.org/) (App Router, TypeScript)
- [Supabase](https://supabase.com/) (Auth)
- [@supabase/ssr](https://supabase.com/docs/guides/auth/server-side/nextjs) for cookie-based server/browser clients
- [Tailwind CSS](https://tailwindcss.com/)

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

### 3. Configure the redirect URL in Supabase

In your Supabase project, go to `Authentication → URL Configuration` and add
your app's callback URL to **Redirect URLs**:

```
http://localhost:3000/auth/callback
```

(Add your production URL too once you deploy, e.g.
`https://your-app.vercel.app/auth/callback`.)

### 4. Install dependencies and run

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## How it works

- `src/lib/supabase/client.ts` — browser Supabase client
- `src/lib/supabase/server.ts` — server Supabase client (reads/writes auth cookies)
- `src/lib/supabase/middleware.ts` — refreshes the session on every request and
  redirects based on auth state
- `src/middleware.ts` — wires the middleware helper into Next.js
- `src/app/auth/actions.ts` — `login`, `signup`, and `logout` Server Actions
- `src/app/auth/callback/route.ts` — exchanges the email confirmation code for
  a session
- `src/app/dashboard/page.tsx` — example protected page

## Deploying

Deploy to [Vercel](https://vercel.com/) (or any Next.js host) and set the same
two environment variables in your project settings. Don't forget to add the
production callback URL to Supabase's redirect URL allow-list.

## License

MIT
