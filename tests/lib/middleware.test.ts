import { describe, expect, test } from "vitest";
import { config } from "@/middleware";

describe("middleware config", () => {
  test("matcher includes dashboard routes", () => {
    expect(config.matcher).toContain("/dashboard/:path*");
  });

  test("matcher includes login route", () => {
    expect(config.matcher).toContain("/login");
  });

  test("matcher includes signup route", () => {
    expect(config.matcher).toContain("/signup");
  });

  test("matcher has exactly 3 entries", () => {
    expect(config.matcher).toHaveLength(3);
  });
});
