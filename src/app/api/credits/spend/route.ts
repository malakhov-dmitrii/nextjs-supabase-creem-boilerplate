import { type NextRequest, NextResponse } from "next/server";
import { isDemoMode } from "@/lib/demo/mode";
import { getDemoStore } from "@/lib/demo/store";
import { checkRateLimit } from "@/lib/rate-limit";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServer } from "@/lib/supabase/server";
import { isUnlimited, validateSpendRequest } from "../helpers";

export async function POST(request: NextRequest) {
  if (isDemoMode()) {
    const body = await request.json();
    const store = getDemoStore();
    const wallet = store.creditWallets.get("demo-user") ?? { user_id: "demo-user", balance: 0 };
    store.creditWallets.set("demo-user", wallet);
    if (!isUnlimited(wallet.balance)) {
      wallet.balance = Math.max(0, wallet.balance - (body.amount ?? 0));
    }
    return NextResponse.json({ balance: wallet.balance });
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
  const validation = validateSpendRequest(body);

  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const db = getSupabaseAdmin();
  const { data: wallet } = await db
    .from("credits")
    .select("balance")
    .eq("user_id", user.id)
    .single();

  if (!wallet) {
    return NextResponse.json({ error: "No credits record" }, { status: 404 });
  }

  if (isUnlimited(wallet.balance)) {
    // Unlimited credits — log but don't deduct
    await db.from("credit_transactions").insert({
      user_id: user.id,
      amount: -validation.data.amount,
      type: "spend",
      description: validation.data.reason,
    });
    return NextResponse.json({ balance: wallet.balance });
  }

  // Use atomic Postgres function
  try {
    const { data: newBalance, error } = await db.rpc("spend_credits", {
      p_user_id: user.id,
      p_amount: validation.data.amount,
      p_reason: validation.data.reason,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message.includes("Insufficient") ? "Insufficient credits" : error.message },
        { status: 402 },
      );
    }

    return NextResponse.json({ balance: newBalance });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Spend failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
