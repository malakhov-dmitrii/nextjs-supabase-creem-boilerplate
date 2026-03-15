import { type NextRequest, NextResponse } from "next/server";
import { creem } from "@/lib/creem";
import { isDemoMode } from "@/lib/demo/mode";
import { generateDemoId, getDemoStore } from "@/lib/demo/store";
import { createSupabaseServer } from "@/lib/supabase/server";
import { validateActivateRequest } from "../validators";

export async function POST(request: NextRequest) {
  if (isDemoMode()) {
    const body = await request.json();
    const store = getDemoStore();
    const license = Array.from(store.licenses.values()).find((l) => l.key === body.key);
    if (license) {
      license.status = "active";
      license.instance_name = body.instanceName;
      license.instance_id = generateDemoId();
      license.activated_at = new Date().toISOString();
      return NextResponse.json({ success: true, license });
    }
    // Create a new license entry if not found
    const newLicense = {
      id: generateDemoId(),
      user_id: "demo-user",
      key: body.key,
      product_id: "demo-product",
      status: "active",
      instance_name: body.instanceName,
      instance_id: generateDemoId(),
      activated_at: new Date().toISOString(),
    };
    store.licenses.set(newLicense.id, newLicense);
    return NextResponse.json({ success: true, license: newLicense });
  }

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const validation = validateActivateRequest(body);

  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    const result = await creem.licenses.activate(validation.data);
    return NextResponse.json({ success: true, license: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Activation failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
