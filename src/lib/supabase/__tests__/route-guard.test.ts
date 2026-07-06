import { describe, expect, it } from "vitest";
import { resolveRouteDecision } from "../route-guard";

describe("resolveRouteDecision", () => {
  it("allows an unauthenticated visitor to view public pages", () => {
    expect(
      resolveRouteDecision({
        pathname: "/",
        isAuthenticated: false,
        needsMfaChallenge: false,
      }),
    ).toEqual({ type: "allow" });
  });

  it("redirects an unauthenticated visitor away from a protected page, preserving next", () => {
    expect(
      resolveRouteDecision({
        pathname: "/dashboard",
        isAuthenticated: false,
        needsMfaChallenge: false,
      }),
    ).toEqual({ type: "redirect", to: "/login", withNext: true });
  });

  it("redirects an unauthenticated visitor away from /reset-password", () => {
    expect(
      resolveRouteDecision({
        pathname: "/reset-password",
        isAuthenticated: false,
        needsMfaChallenge: false,
      }),
    ).toEqual({ type: "redirect", to: "/login", withNext: true });
  });

  it("redirects an unauthenticated visitor away from the MFA challenge page", () => {
    expect(
      resolveRouteDecision({
        pathname: "/login/mfa",
        isAuthenticated: false,
        needsMfaChallenge: false,
      }),
    ).toEqual({ type: "redirect", to: "/login", withNext: true });
  });

  it("sends an authenticated user who still needs MFA to the challenge page", () => {
    expect(
      resolveRouteDecision({
        pathname: "/dashboard",
        isAuthenticated: true,
        needsMfaChallenge: true,
      }),
    ).toEqual({ type: "redirect", to: "/login/mfa", withNext: false });
  });

  it("does not force the MFA challenge on public pages", () => {
    expect(
      resolveRouteDecision({
        pathname: "/",
        isAuthenticated: true,
        needsMfaChallenge: true,
      }),
    ).toEqual({ type: "allow" });
  });

  it("lets an authenticated user who still needs MFA stay on the challenge page", () => {
    expect(
      resolveRouteDecision({
        pathname: "/login/mfa",
        isAuthenticated: true,
        needsMfaChallenge: true,
      }),
    ).toEqual({ type: "allow" });
  });

  it("redirects a fully authenticated user away from /login to /dashboard", () => {
    expect(
      resolveRouteDecision({
        pathname: "/login",
        isAuthenticated: true,
        needsMfaChallenge: false,
      }),
    ).toEqual({ type: "redirect", to: "/dashboard", withNext: false });
  });

  it("redirects a fully authenticated user away from /signup", () => {
    expect(
      resolveRouteDecision({
        pathname: "/signup",
        isAuthenticated: true,
        needsMfaChallenge: false,
      }),
    ).toEqual({ type: "redirect", to: "/dashboard", withNext: false });
  });

  it("redirects a fully authenticated user away from the MFA challenge page once verified", () => {
    expect(
      resolveRouteDecision({
        pathname: "/login/mfa",
        isAuthenticated: true,
        needsMfaChallenge: false,
      }),
    ).toEqual({ type: "redirect", to: "/dashboard", withNext: false });
  });

  it("allows a fully authenticated user to view the dashboard", () => {
    expect(
      resolveRouteDecision({
        pathname: "/dashboard",
        isAuthenticated: true,
        needsMfaChallenge: false,
      }),
    ).toEqual({ type: "allow" });
  });
});
