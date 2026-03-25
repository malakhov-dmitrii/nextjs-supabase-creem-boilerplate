import { type NextRequest, NextResponse } from "next/server";
import { creem } from "@/lib/creem";
import { isDemoMode } from "@/lib/demo/mode";
import { getDemoStore } from "@/lib/demo/store";
import { checkRateLimit } from "@/lib/rate-limit";
import { createSupabaseServer } from "@/lib/supabase/server";
import { validateUpgradeRequest } from "../validators";

export async function POST(request: NextRequest) {
  if (isDemoMode()) {
    const body = await request.json();
    const store = getDemoStore();
    const sub = Array.from(store.subscriptions.values()).find(
      (s) => s.creem_subscription_id === body.subscriptionId,
    );
    if (sub) {
      sub.creem_product_id = body.newProductId;
    }
    return NextResponse.json({ success: true, subscription: sub ?? null });
  }

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { success } = await checkRateLimit(user.id);
  if (!success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const body = await request.json();
  const validation = validateUpgradeRequest(body);

  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { subscriptionId, newProductId } = validation.data;

  try {
    const result = await creem.subscriptions.upgrade(subscriptionId, {
      productId: newProductId,
      updateBehavior: "proration-charge-immediately",
    });
    return NextResponse.json({ success: true, subscription: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upgrade failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
