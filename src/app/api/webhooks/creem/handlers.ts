/**
 * Pure functions for webhook event processing.
 * Extracted from route handler for testability.
 */

const STATUS_MAP: Record<string, string> = {
  "subscription.canceled": "cancelled",
  "subscription.active": "active",
  "subscription.past_due": "past_due",
  "subscription.trialing": "trialing",
  "subscription.paused": "paused",
  "subscription.expired": "expired",
  "subscription.unpaid": "past_due",
  "subscription.paid": "active",
  "subscription.update": "active",
};

export function mapSubscriptionStatus(eventType: string): string | null {
  return STATUS_MAP[eventType] ?? null;
}

interface CheckoutEvent {
  metadata?: { user_id?: string };
  product: { id: string; name?: string };
  customer: { id: string };
  subscription?: {
    id: string;
    current_period_end_date?: Date | null;
    canceled_at?: Date | null;
  };
  feature?: {
    license?: { key: string };
  };
}

export interface SubscriptionUpsertRow {
  user_id: string | undefined;
  creem_customer_id: string;
  creem_subscription_id: string | undefined;
  creem_product_id: string;
  product_name: string | undefined;
  status: string;
  current_period_end?: string;
}

export function buildSubscriptionUpsert(event: CheckoutEvent): SubscriptionUpsertRow {
  return {
    user_id: event.metadata?.user_id,
    creem_customer_id: event.customer.id,
    creem_subscription_id: event.subscription?.id,
    creem_product_id: event.product.id,
    product_name: event.product.name,
    status: "active",
    current_period_end: event.subscription?.current_period_end_date
      ? new Date(event.subscription.current_period_end_date).toISOString()
      : undefined,
  };
}

interface SubscriptionUpdateFields {
  current_period_end_date?: Date | null;
  canceled_at?: Date | null;
}

export interface SubscriptionUpdateRow {
  status: string;
  current_period_end?: string;
  cancel_at?: string;
}

export function extractUserId(metadata: Record<string, string> | undefined): string | undefined {
  return metadata?.user_id;
}

export function buildSubscriptionUpdate(
  status: string,
  fields: SubscriptionUpdateFields,
): SubscriptionUpdateRow {
  const row: SubscriptionUpdateRow = { status };

  if (fields.current_period_end_date) {
    row.current_period_end = new Date(fields.current_period_end_date).toISOString();
  }

  if (status === "scheduled_cancel" && fields.canceled_at) {
    row.cancel_at = new Date(fields.canceled_at).toISOString();
  }

  return row;
}
