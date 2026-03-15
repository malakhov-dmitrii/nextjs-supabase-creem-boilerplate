import { redirect } from "next/navigation";
import { LicenseCard } from "@/components/license-card";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LicensesPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: licenses } = await getSupabaseAdmin()
    .from("licenses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-text-primary mb-2">License Keys</h1>
        <p className="text-text-muted">Manage your license keys and activations.</p>
      </div>

      <LicenseCard licenses={licenses ?? []} />
    </div>
  );
}
