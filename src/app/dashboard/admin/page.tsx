import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Simple admin check — configure ADMIN_EMAIL in env
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || user.email !== adminEmail) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-extrabold text-text-primary mb-4">Access Denied</h1>
        <p className="text-text-muted">You don&apos;t have admin access.</p>
      </div>
    );
  }

  const db = getSupabaseAdmin();

  // Fetch stats
  const { count: subCount } = await db
    .from("subscriptions")
    .select("*", { count: "exact", head: true });
  const { count: licCount } = await db.from("licenses").select("*", { count: "exact", head: true });
  const { data: recentEvents } = await db
    .from("billing_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-text-primary mb-2">Admin Dashboard</h1>
        <p className="text-text-muted">Manage your SaaS from here.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="p-6 bg-bg-secondary rounded-2xl border-2 border-border">
          <p className="text-text-muted text-sm font-bold">Subscriptions</p>
          <p className="text-3xl font-extrabold text-text-primary">{subCount ?? 0}</p>
        </div>
        <div className="p-6 bg-bg-secondary rounded-2xl border-2 border-border">
          <p className="text-text-muted text-sm font-bold">Licenses</p>
          <p className="text-3xl font-extrabold text-text-primary">{licCount ?? 0}</p>
        </div>
        <div className="p-6 bg-bg-secondary rounded-2xl border-2 border-border">
          <p className="text-text-muted text-sm font-bold">Billing Events</p>
          <p className="text-3xl font-extrabold text-text-primary">{recentEvents?.length ?? 0}</p>
        </div>
      </div>

      {/* Discount Code Creator */}
      <div className="p-6 bg-bg-secondary rounded-2xl border-2 border-border">
        <h2 className="text-lg font-extrabold text-text-primary mb-4">Create Discount Code</h2>
        <p className="text-text-muted text-sm mb-3">
          Use the <code className="text-accent-orange">POST /api/discounts</code> endpoint to create
          discount codes programmatically.
        </p>
        <pre className="p-4 bg-bg-primary rounded-xl text-sm text-text-secondary overflow-x-auto font-mono">
          {`curl -X POST /api/discounts \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Summer Sale",
    "type": "percentage",
    "percentage": 20,
    "duration": "once",
    "appliesToProducts": ["prod_xxx"]
  }'`}
        </pre>
      </div>

      {/* Recent Billing Events */}
      {recentEvents && recentEvents.length > 0 && (
        <div className="p-6 bg-bg-secondary rounded-2xl border-2 border-border">
          <h2 className="text-lg font-extrabold text-text-primary mb-4">Recent Billing Events</h2>
          <div className="space-y-2">
            {recentEvents.map(
              (event: { id: string; event_type: string; status: string; created_at: string }) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 bg-bg-primary rounded-xl"
                >
                  <div>
                    <span
                      className={`text-sm font-bold ${event.event_type === "dispute" ? "text-error" : "text-warning"}`}
                    >
                      {event.event_type}
                    </span>
                    <span className="text-xs text-text-muted ml-2">{event.status}</span>
                  </div>
                  <span className="text-xs text-text-muted">
                    {new Date(event.created_at).toLocaleDateString()}
                  </span>
                </div>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
