import { type NextRequest, NextResponse } from "next/server";
import { creem } from "@/lib/creem";
import { isDemoMode } from "@/lib/demo/mode";
import { getDemoStore } from "@/lib/demo/store";
import { createSupabaseServer } from "@/lib/supabase/server";
import { validateDeactivateRequest } from "../validators";

export async function POST(request: NextRequest) {
  if (isDemoMode()) {
    const body = await request.json();
    const store = getDemoStore();
    const license = Array.from(store.licenses.values()).find((l) => l.key === body.key);
    if (!license) {
      return NextResponse.json({ error: "License not found" }, { status: 404 });
    }
    license.status = "inactive";
    return NextResponse.json({ success: true, license });
  }

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const validation = validateDeactivateRequest(body);

  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    const result = await creem.licenses.deactivate(validation.data);
    return NextResponse.json({ success: true, license: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Deactivation failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
