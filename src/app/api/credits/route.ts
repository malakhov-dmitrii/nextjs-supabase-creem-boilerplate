import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/demo/mode";
import { getDemoStore } from "@/lib/demo/store";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function GET() {
  if (isDemoMode()) {
    const store = getDemoStore();
    const wallet = store.creditWallets.get("demo-user");
    return NextResponse.json({ balance: wallet?.balance ?? 0 });
  }

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data } = await getSupabaseAdmin()
    .from("credits")
    .select("balance")
    .eq("user_id", user.id)
    .single();

  return NextResponse.json({ balance: data?.balance ?? 0 });
}
