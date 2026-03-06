import crypto from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const SUBSCRIPTION_STATUS_MAP: Record<string, string> = {
  "subscription.active": "active",
  "subscription.renewed": "active",
  "subscription.cancelled": "cancelled",
  "subscription.expired": "expired",
  "subscription.paused": "paused",
};

function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(payload).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("creem-signature");

  if (!signature || !process.env.CREEM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 401 });
  }

  if (!verifyWebhookSignature(body, signature, process.env.CREEM_WEBHOOK_SECRET)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { event_type: string; object: Record<string, unknown> };
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = event.event_type;
  const db = getSupabaseAdmin();

  if (eventType === "checkout.completed") {
    const { customer, product, subscription } = event.object as {
      customer: { id: string; metadata?: { user_id?: string } };
      product: { id: string; name: string };
      subscription?: { id: string; current_period_end?: string; current_period_end_date?: string };
    };

    if (!customer.metadata?.user_id) {
      return NextResponse.json({ error: "Missing user_id in metadata" }, { status: 400 });
    }

    const { error } = await db.from("subscriptions").upsert(
      {
        user_id: customer.metadata.user_id,
        creem_customer_id: customer.id,
        creem_subscription_id: subscription?.id,
        creem_product_id: product.id,
        product_name: product.name,
        status: "active",
        current_period_end:
          subscription?.current_period_end_date || subscription?.current_period_end,
      },
      { onConflict: "user_id" },
    );

    if (error) {
      console.error("Webhook DB error (checkout.completed):", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
  } else if (SUBSCRIPTION_STATUS_MAP[eventType]) {
    const sub = event.object as {
      id: string;
      current_period_end?: string;
      current_period_end_date?: string;
    };
    const status = SUBSCRIPTION_STATUS_MAP[eventType];
    const updateData: Record<string, string> = { status };

    if (status === "active") {
      const periodEnd = sub.current_period_end_date || sub.current_period_end;
      if (periodEnd) updateData.current_period_end = periodEnd;
    }

    const { error } = await db
      .from("subscriptions")
      .update(updateData)
      .eq("creem_subscription_id", sub.id);

    if (error) {
      console.error(`Webhook DB error (${eventType}):`, error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
  } else {
    console.log(`Unhandled event: ${eventType}`);
  }

  return NextResponse.json({ received: true });
}
