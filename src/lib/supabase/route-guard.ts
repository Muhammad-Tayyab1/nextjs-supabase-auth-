export const PROTECTED_PREFIXES = ["/dashboard", "/reset-password"];
export const AUTH_PREFIXES = ["/login", "/signup", "/forgot-password"];
export const MFA_CHALLENGE_PATH = "/login/mfa";

export type RouteDecision =
  | { type: "allow" }
  | { type: "redirect"; to: "/login"; withNext: true }
  | { type: "redirect"; to: typeof MFA_CHALLENGE_PATH; withNext: false }
  | { type: "redirect"; to: "/dashboard"; withNext: false };

/**
 * Pure routing decision used by the proxy/middleware. Kept side-effect free
 * (no cookies, no Supabase calls) so it can be unit tested without a mock
 * Supabase client or a real NextRequest.
 */
export function resolveRouteDecision(params: {
  pathname: string;
  isAuthenticated: boolean;
  needsMfaChallenge: boolean;
}): RouteDecision {
  const { pathname, isAuthenticated, needsMfaChallenge } = params;

  const isMfaChallenge = pathname === MFA_CHALLENGE_PATH;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthPage =
    !isMfaChallenge && AUTH_PREFIXES.some((p) => pathname.startsWith(p));

  if (!isAuthenticated && (isProtected || isMfaChallenge)) {
    return { type: "redirect", to: "/login", withNext: true };
  }

  if (isAuthenticated && needsMfaChallenge && isProtected) {
    return { type: "redirect", to: MFA_CHALLENGE_PATH, withNext: false };
  }

  if (isAuthenticated && !needsMfaChallenge && (isAuthPage || isMfaChallenge)) {
    return { type: "redirect", to: "/dashboard", withNext: false };
  }

  return { type: "allow" };
}
