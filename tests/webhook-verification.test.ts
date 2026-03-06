import crypto from "node:crypto";
import { describe, expect, it } from "vitest";

function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(payload).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  } catch {
    return false;
  }
}

function signPayload(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

describe("Webhook Signature Verification", () => {
  const secret = "whsec_test_secret_key_123";

  it("should verify a valid signature", () => {
    const payload = JSON.stringify({ event_type: "checkout.completed", object: {} });
    const signature = signPayload(payload, secret);
    expect(verifyWebhookSignature(payload, signature, secret)).toBe(true);
  });

  it("should reject an invalid signature", () => {
    const payload = JSON.stringify({ event_type: "checkout.completed" });
    expect(verifyWebhookSignature(payload, "invalid_signature_hex", secret)).toBe(false);
  });

  it("should reject a tampered payload", () => {
    const payload = JSON.stringify({ event_type: "checkout.completed" });
    const signature = signPayload(payload, secret);
    const tampered = JSON.stringify({ event_type: "checkout.completed", hacked: true });
    expect(verifyWebhookSignature(tampered, signature, secret)).toBe(false);
  });

  it("should reject a signature with wrong secret", () => {
    const payload = JSON.stringify({ event_type: "checkout.completed" });
    const signature = signPayload(payload, "wrong_secret");
    expect(verifyWebhookSignature(payload, signature, secret)).toBe(false);
  });

  it("should handle empty payload", () => {
    const signature = signPayload("", secret);
    expect(verifyWebhookSignature("", signature, secret)).toBe(true);
  });

  it("should handle mismatched length signatures gracefully", () => {
    expect(verifyWebhookSignature("test", "short", secret)).toBe(false);
  });
});
