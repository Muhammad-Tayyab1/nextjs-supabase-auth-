import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard", "/reset-password"];
const AUTH_PREFIXES = ["/login", "/signup", "/forgot-password"];
const MFA_CHALLENGE_PATH = "/login/mfa";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not run any logic between createServerClient and getUser().
  // A simple mistake here can make it very hard to debug issues with
  // users being randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isMfaChallenge = pathname === MFA_CHALLENGE_PATH;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthPage =
    !isMfaChallenge && AUTH_PREFIXES.some((p) => pathname.startsWith(p));

  if (!user && (isProtected || isMfaChallenge)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  let needsMfaChallenge = false;
  if (user) {
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    needsMfaChallenge =
      !!aal && aal.nextLevel === "aal2" && aal.nextLevel !== aal.currentLevel;
  }

  if (needsMfaChallenge && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = MFA_CHALLENGE_PATH;
    return NextResponse.redirect(url);
  }

  if (user && !needsMfaChallenge && (isAuthPage || isMfaChallenge)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
