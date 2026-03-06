import { describe, expect, it } from "vitest";

function getRedirect(
  pathname: string,
  isAuthenticated: boolean
): { redirect: string } | null {
  if (!isAuthenticated && pathname.startsWith("/dashboard")) {
    return { redirect: "/login" };
  }
  if (isAuthenticated && (pathname === "/login" || pathname === "/signup")) {
    return { redirect: "/dashboard" };
  }
  return null;
}

describe("middleware routing logic", () => {
  describe("unauthenticated", () => {
    it("/dashboard -> /login", () => {
      expect(getRedirect("/dashboard", false)).toEqual({ redirect: "/login" });
    });

    it("/dashboard/settings -> /login", () => {
      expect(getRedirect("/dashboard/settings", false)).toEqual({ redirect: "/login" });
    });

    it("/login -> null (allowed)", () => {
      expect(getRedirect("/login", false)).toBeNull();
    });

    it("/signup -> null (allowed)", () => {
      expect(getRedirect("/signup", false)).toBeNull();
    });

    it("/pricing -> null", () => {
      expect(getRedirect("/pricing", false)).toBeNull();
    });

    it("/ -> null", () => {
      expect(getRedirect("/", false)).toBeNull();
    });
  });

  describe("authenticated", () => {
    it("/dashboard -> null (allowed)", () => {
      expect(getRedirect("/dashboard", true)).toBeNull();
    });

    it("/login -> /dashboard", () => {
      expect(getRedirect("/login", true)).toEqual({ redirect: "/dashboard" });
    });

    it("/signup -> /dashboard", () => {
      expect(getRedirect("/signup", true)).toEqual({ redirect: "/dashboard" });
    });

    it("/pricing -> null", () => {
      expect(getRedirect("/pricing", true)).toBeNull();
    });

    it("/ -> null", () => {
      expect(getRedirect("/", true)).toBeNull();
    });
  });
});
