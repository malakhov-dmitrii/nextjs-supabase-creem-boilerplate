import { NextResponse } from "next/server";
import { creem } from "@/lib/creem";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("creem_customer_id")
    .eq("user_id", user.id)
    .single();

  if (!subscription?.creem_customer_id) {
    return NextResponse.json({ error: "No subscription found" }, { status: 404 });
  }

  const portal = await creem.customers.generateBillingLinks({
    customerId: subscription.creem_customer_id,
  });

  return NextResponse.json({ url: portal.customerPortalLink });
}
