import { createBrowserClient } from "@supabase/ssr";
import { isDemoMode } from "@/lib/demo/mode";
import { createDemoClient } from "@/lib/demo/supabase-mock";

export function createSupabaseBrowser() {
  if (isDemoMode()) {
    return createDemoClient();
  }
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
