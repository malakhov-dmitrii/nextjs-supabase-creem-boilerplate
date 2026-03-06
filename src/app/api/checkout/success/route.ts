import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
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

  // Fetch subscription details from Creem to verify
  const res = await fetch(
    `https://test-api.creem.io/v1/subscriptions?subscription_id=${subscriptionId}`,
    { headers: { "x-api-key": process.env.CREEM_API_KEY! } },
  );

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to verify subscription" }, { status: 400 });
  }

  const subscription = await res.json();

  const { error } = await getSupabaseAdmin()
    .from("subscriptions")
    .upsert(
      {
        user_id: user.id,
        creem_customer_id: customerId || subscription.customer?.id,
        creem_subscription_id: subscriptionId,
        creem_product_id: productId,
        product_name: subscription.product?.name || "Pro",
        status: subscription.status || "active",
        current_period_end: subscription.current_period_end_date,
      },
      { onConflict: "user_id" },
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ synced: true });
}
