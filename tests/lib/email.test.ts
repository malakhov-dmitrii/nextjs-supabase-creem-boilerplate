import { describe, expect, test } from "vitest";
import { sendPaymentConfirmation, sendWelcomeEmail } from "@/lib/email";

describe("email service (no RESEND_API_KEY)", () => {
  test("sendWelcomeEmail is a no-op without API key", async () => {
    const result = await sendWelcomeEmail("test@test.com", "Test User");
    expect(result).toEqual({ success: true, skipped: true });
  });

  test("sendPaymentConfirmation is a no-op without API key", async () => {
    const result = await sendPaymentConfirmation("test@test.com", "Pro Plan", 2900);
    expect(result).toEqual({ success: true, skipped: true });
  });
});
