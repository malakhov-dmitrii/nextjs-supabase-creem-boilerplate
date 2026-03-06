import { type NextRequest, NextResponse } from "next/server";
import { creem } from "@/lib/creem";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId } = await request.json();

  const checkout = await creem.checkouts.create({
    productId,
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
    metadata: {
      user_id: user.id,
    },
  });

  return NextResponse.json({ url: checkout.checkoutUrl });
}
