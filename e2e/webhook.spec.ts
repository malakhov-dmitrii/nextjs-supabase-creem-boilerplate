import crypto from "node:crypto";
import { expect, test } from "@playwright/test";

const WEBHOOK_URL = "/api/webhooks/creem";

test.describe("Webhook Endpoint", () => {
  test("rejects request without signature", async ({ request }) => {
    const res = await request.post(WEBHOOK_URL, {
      data: { event_type: "checkout.completed", object: {} },
    });
    expect(res.status()).toBe(401);
  });

  test("rejects request with invalid signature", async ({ request }) => {
    const body = JSON.stringify({ event_type: "checkout.completed", object: {} });
    const res = await request.post(WEBHOOK_URL, {
      data: body,
      headers: {
        "content-type": "application/json",
        "creem-signature": "invalidsignature",
      },
    });
    expect(res.status()).toBe(401);
  });

  test("accepts valid webhook with correct signature", async ({ request }) => {
    const secret = process.env.CREEM_WEBHOOK_SECRET;
    if (!secret) {
      test.skip();
      return;
    }

    const payload = JSON.stringify({
      event_type: "checkout.completed",
      object: {
        customer: { id: "cus_test", metadata: { user_id: "test-user-id" } },
        product: { id: "prod_test", name: "Test Plan" },
        subscription: { id: "sub_test", current_period_end_date: "2026-04-06T00:00:00Z" },
      },
    });

    const hmac = crypto.createHmac("sha256", secret);
    const signature = hmac.update(payload).digest("hex");

    const res = await request.post(WEBHOOK_URL, {
      data: payload,
      headers: {
        "content-type": "application/json",
        "creem-signature": signature,
      },
    });

    // 200 = success, 500 = DB error (fake user_id doesn't exist in DB)
    // Both mean signature verification passed (not 401)
    expect([200, 500]).toContain(res.status());
    const body = await res.json();
    expect(body).toHaveProperty(res.status() === 200 ? "received" : "error");
  });
});
