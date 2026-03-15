import { type NextRequest, NextResponse } from "next/server";
import { creem } from "@/lib/creem";
import { isDemoMode } from "@/lib/demo/mode";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  if (isDemoMode()) {
    return NextResponse.json({ synced: true });
  }

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { subscriptionId, productId, customerId } = body;

  if (!subscriptionId || !productId) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  // Fetch subscription details from Creem SDK (auto-detects test/prod)
  const subscription = await creem.subscriptions.get(subscriptionId);

  const productName =
    typeof subscription.product === "string" ? "Plan" : (subscription.product?.name ?? "Plan");

  const { error } = await getSupabaseAdmin()
    .from("subscriptions")
    .upsert(
      {
        user_id: user.id,
        creem_customer_id:
          customerId ??
          (typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.id),
        creem_subscription_id: subscriptionId,
        creem_product_id: productId,
        product_name: productName,
        status: subscription.status ?? "active",
        current_period_end: subscription.currentPeriodEndDate
          ? new Date(subscription.currentPeriodEndDate).toISOString()
          : undefined,
      },
      { onConflict: "user_id" },
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ synced: true });
}
