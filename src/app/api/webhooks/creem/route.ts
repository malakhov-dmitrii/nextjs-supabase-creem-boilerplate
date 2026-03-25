import { Webhook } from "@creem_io/nextjs";
import { isDemoMode } from "@/lib/demo/mode";
import { sendPaymentConfirmation } from "@/lib/email";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { buildSubscriptionUpdate, buildSubscriptionUpsert, extractUserId } from "./handlers";

function handleWebhook() {
  if (isDemoMode()) {
    return null;
  }

  const db = getSupabaseAdmin();

  return Webhook({
    webhookSecret: process.env.CREEM_WEBHOOK_SECRET!,

    onCheckoutCompleted: async (event) => {
      const row = buildSubscriptionUpsert({
        metadata: event.metadata as { user_id?: string } | undefined,
        product: { id: event.product.id, name: event.product.name },
        customer: event.customer ? { id: event.customer.id } : { id: "" },
        subscription: event.subscription
          ? {
              id: event.subscription.id,
              current_period_end_date: event.subscription.current_period_end_date,
              canceled_at: null,
            }
          : undefined,
      });

      if (!row.user_id) {
        console.log("[webhook] checkout.completed: no user_id in metadata, skipping");
        return;
      }

      // Idempotency check
      const { data: existing } = await db
        .from("webhook_events")
        .select("id")
        .eq("id", event.webhookId)
        .single();

      if (existing) {
        console.log(`[webhook] duplicate event ${event.webhookId}, skipping`);
        return;
      }

      await db.from("webhook_events").insert({
        id: event.webhookId,
        event_type: "checkout.completed",
      });

      await db.from("subscriptions").upsert(row, { onConflict: "user_id" });

      // Send payment confirmation email
      if (event.customer?.email) {
        await sendPaymentConfirmation(
          event.customer.email,
          event.product?.name ?? "Subscription",
          event.product?.price ?? 0,
        );
      }
    },

    onSubscriptionActive: async (event) => {
      const update = buildSubscriptionUpdate("active", {
        current_period_end_date: event.current_period_end_date,
      });
      await db.from("subscriptions").update(update).eq("creem_subscription_id", event.id);
    },

    onSubscriptionPaid: async (event) => {
      const update = buildSubscriptionUpdate("active", {
        current_period_end_date: event.current_period_end_date,
      });
      await db.from("subscriptions").update(update).eq("creem_subscription_id", event.id);
    },

    onSubscriptionCanceled: async (event) => {
      const update = buildSubscriptionUpdate("cancelled", {
        canceled_at: event.canceled_at,
      });
      await db.from("subscriptions").update(update).eq("creem_subscription_id", event.id);
    },

    onSubscriptionExpired: async (event) => {
      await db
        .from("subscriptions")
        .update({ status: "expired" })
        .eq("creem_subscription_id", event.id);
    },

    onSubscriptionPaused: async (event) => {
      await db
        .from("subscriptions")
        .update({ status: "paused" })
        .eq("creem_subscription_id", event.id);
    },

    onSubscriptionTrialing: async (event) => {
      const update = buildSubscriptionUpdate("trialing", {
        current_period_end_date: event.current_period_end_date,
      });
      await db.from("subscriptions").update(update).eq("creem_subscription_id", event.id);
    },

    onSubscriptionPastDue: async (event) => {
      await db
        .from("subscriptions")
        .update({ status: "past_due" })
        .eq("creem_subscription_id", event.id);
    },

    onSubscriptionUpdate: async (event) => {
      const productId = typeof event.product === "string" ? event.product : event.product.id;
      await db
        .from("subscriptions")
        .update({
          creem_product_id: productId,
          status: event.status,
          current_period_end: event.current_period_end_date
            ? new Date(event.current_period_end_date).toISOString()
            : undefined,
        })
        .eq("creem_subscription_id", event.id);
    },

    onRefundCreated: async (event) => {
      const subscriptionId =
        typeof event.subscription === "string" ? event.subscription : event.subscription?.id;

      const { data: sub } = await db
        .from("subscriptions")
        .select("user_id")
        .eq("creem_subscription_id", subscriptionId ?? "")
        .single();

      await db.from("billing_events").insert({
        user_id: sub?.user_id,
        event_type: "refund",
        creem_transaction_id: event.transaction.id,
        amount: event.refund_amount,
        currency: event.refund_currency,
        status: "completed",
      });
    },

    onDisputeCreated: async (event) => {
      const subscriptionId =
        typeof event.subscription === "string" ? event.subscription : event.subscription?.id;

      const { data: sub } = await db
        .from("subscriptions")
        .select("user_id")
        .eq("creem_subscription_id", subscriptionId ?? "")
        .single();

      await db.from("billing_events").insert({
        user_id: sub?.user_id,
        event_type: "dispute",
        creem_transaction_id: event.transaction.id,
        amount: event.amount,
        currency: event.currency,
        status: "open",
      });
    },

    onGrantAccess: async ({ reason, metadata }) => {
      const userId = extractUserId(metadata as Record<string, string> | undefined);
      if (!userId) {
        console.log("[webhook] Grant access: no user_id in metadata");
        return;
      }
      await db.from("subscriptions").update({ status: "active" }).eq("user_id", userId);
      console.log(`[webhook] Granted access (${reason}) for user ${userId}`);
    },

    onRevokeAccess: async ({ reason, metadata }) => {
      const userId = extractUserId(metadata as Record<string, string> | undefined);
      if (!userId) {
        console.log("[webhook] Revoke access: no user_id in metadata");
        return;
      }
      const status = String(reason).includes("expired") ? "expired" : "cancelled";
      await db.from("subscriptions").update({ status }).eq("user_id", userId);
      console.log(`[webhook] Revoked access (${reason}) for user ${userId}`);
    },
  });
}

const webhookHandler = handleWebhook();

export async function POST(request: Request) {
  if (!webhookHandler) {
    // Demo mode — no-op
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }
  return webhookHandler(request as never);
}
