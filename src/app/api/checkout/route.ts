import { type NextRequest, NextResponse } from "next/server";
import { creem } from "@/lib/creem";
import { isDemoMode } from "@/lib/demo/mode";
import { generateDemoId, getDemoStore } from "@/lib/demo/store";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  if (isDemoMode()) {
    const { productId } = await request.json();
    const store = getDemoStore();
    const subId = generateDemoId();
    const newSub = {
      id: subId,
      user_id: "demo-user",
      creem_subscription_id: subId,
      creem_product_id: productId ?? "demo-product",
      product_name: "Demo Plan",
      status: "active",
      seats: 1,
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
    store.subscriptions.set(subId, newSub);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    return NextResponse.redirect(`${appUrl}/dashboard?checkout=success`);
  }

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId, discountCode } = await request.json();

  const checkout = await creem.checkouts.create({
    productId,
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
    discountCode: discountCode || undefined,
    metadata: {
      user_id: user.id,
    },
  });

  return NextResponse.json({ url: checkout.checkoutUrl });
}
