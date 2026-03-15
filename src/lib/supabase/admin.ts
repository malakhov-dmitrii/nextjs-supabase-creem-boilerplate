import { createClient } from "@supabase/supabase-js";
import { isDemoMode } from "@/lib/demo/mode";
import { createDemoClient } from "@/lib/demo/supabase-mock";

export function getSupabaseAdmin() {
  if (isDemoMode()) {
    return createDemoClient();
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
