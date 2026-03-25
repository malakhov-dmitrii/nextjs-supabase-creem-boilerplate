import { describe, test, expect } from "vitest";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";

describe("sitemap", () => {
  test("includes home page", () => {
    const entries = sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls.some((u) => u.endsWith("/") || !u.includes("/", 8))).toBe(true);
  });

  test("includes pricing page", () => {
    const entries = sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls.some((u) => u.includes("/pricing"))).toBe(true);
  });

  test("returns 4 entries", () => {
    expect(sitemap()).toHaveLength(4);
  });
});

describe("robots", () => {
  test("disallows /api/ and /dashboard/", () => {
    const config = robots();
    const rules = Array.isArray(config.rules) ? config.rules : [config.rules];
    const disallowed = rules.flatMap((r) =>
      Array.isArray(r.disallow) ? r.disallow : r.disallow ? [r.disallow] : []
    );
    expect(disallowed).toContain("/api/");
    expect(disallowed).toContain("/dashboard/");
  });

  test("includes sitemap URL", () => {
    const config = robots();
    expect(config.sitemap).toContain("sitemap.xml");
  });
});
