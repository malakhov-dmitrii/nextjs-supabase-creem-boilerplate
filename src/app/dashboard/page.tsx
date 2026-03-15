import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AlertBanner } from "@/components/alert-banner";
import { CancelDialog } from "@/components/cancel-dialog";
import { CheckoutSync } from "@/components/checkout-sync";
import { CreditsCard } from "@/components/credits-card";
import { LicenseCard } from "@/components/license-card";
import { SeatManager } from "@/components/seat-manager";
import { SignOutButton } from "@/components/sign-out-button";
import { SubscriptionCard } from "@/components/subscription-card";
import { UpgradeDialog } from "@/components/upgrade-dialog";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServer } from "@/lib/supabase/server";

const PLANS = [
  {
    id: process.env.NEXT_PUBLIC_CREEM_STARTER_PRODUCT_ID ?? "prod_starter",
    name: "Starter",
    price: 900,
  },
  { id: process.env.NEXT_PUBLIC_CREEM_PRO_PRODUCT_ID ?? "prod_pro", name: "Pro", price: 2900 },
  {
    id: process.env.NEXT_PUBLIC_CREEM_ENTERPRISE_PRODUCT_ID ?? "prod_enterprise",
    name: "Enterprise",
    price: 9900,
  },
];

export default async function DashboardPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const db = getSupabaseAdmin();

  // Fetch all dashboard data in parallel
  const [subResult, creditsResult, licensesResult, eventsResult, txResult] = await Promise.all([
    supabase.from("subscriptions").select("*").eq("user_id", user.id).maybeSingle(),
    db.from("credits").select("balance").eq("user_id", user.id).maybeSingle(),
    db
      .from("licenses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
    db
      .from("billing_events")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
    db
      .from("credit_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const subscription = subResult.data;
  const credits = creditsResult.data;
  const licenses = licensesResult.data ?? [];
  const billingEvents = eventsResult.data ?? [];
  const creditTransactions = txResult.data ?? [];

  const isActive = subscription?.status === "active" || subscription?.status === "trialing";
  const isScheduledCancel = subscription?.status === "scheduled_cancel";

  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="bg-bg-secondary border-b-2 border-border">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-extrabold text-text-primary tracking-tight">Dashboard</h1>
            <nav className="hidden sm:flex items-center gap-4">
              <Link
                href="/dashboard/transactions"
                className="text-sm font-bold text-text-muted hover:text-text-primary transition-colors"
              >
                Transactions
              </Link>
              <Link
                href="/dashboard/licenses"
                className="text-sm font-bold text-text-muted hover:text-text-primary transition-colors"
              >
                Licenses
              </Link>
              {process.env.ADMIN_EMAIL === user.email && (
                <Link
                  href="/dashboard/admin"
                  className="text-sm font-bold text-accent-orange hover:underline"
                >
                  Admin
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-secondary font-medium hidden md:block">
              {user.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-6">
        <Suspense>
          <CheckoutSync />
        </Suspense>

        {/* Alerts */}
        <AlertBanner events={billingEvents} />

        {/* Scheduled cancel banner */}
        {isScheduledCancel && subscription?.cancel_at && (
          <div className="p-4 rounded-xl border-2 border-warning/40 bg-warning/5">
            <p className="text-sm font-bold text-warning">
              Your subscription ends on {new Date(subscription.cancel_at).toLocaleDateString()}.
            </p>
            <p className="text-xs text-text-muted mt-1">
              You&apos;ll continue to have access until then.{" "}
              <Link href="/pricing" className="text-accent-orange hover:underline font-bold">
                Resubscribe
              </Link>
            </p>
          </div>
        )}

        {/* Main grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Subscription */}
          <SubscriptionCard subscription={subscription} />

          {/* Credits */}
          <CreditsCard balance={credits?.balance ?? 0} transactions={creditTransactions} />
        </div>

        {/* Plan management (only if active subscription) */}
        {isActive && subscription?.creem_subscription_id && subscription?.creem_product_id && (
          <div
            className="p-6 bg-bg-secondary rounded-2xl border-2 border-border space-y-6"
            style={{ boxShadow: "4px 4px 0px rgba(255, 255, 255, 0.06)" }}
          >
            <h2 className="text-lg font-extrabold text-text-primary">Manage Subscription</h2>

            <UpgradeDialog
              subscriptionId={subscription.creem_subscription_id}
              currentProductId={subscription.creem_product_id}
              plans={PLANS}
            />

            {subscription.seats && subscription.seats > 0 && (
              <SeatManager
                subscriptionId={subscription.creem_subscription_id}
                currentSeats={subscription.seats}
              />
            )}

            <CancelDialog
              subscriptionId={subscription.creem_subscription_id}
              currentPeriodEnd={subscription.current_period_end}
            />
          </div>
        )}

        {/* Licenses */}
        {licenses.length > 0 && <LicenseCard licenses={licenses} />}

        {/* Features */}
        <div
          className="bg-bg-secondary rounded-2xl border-2 border-border p-6"
          style={{ boxShadow: "4px 4px 0px rgba(255, 255, 255, 0.06)" }}
        >
          <h2 className="text-lg font-extrabold text-text-primary mb-4">Your SaaS Features</h2>
          {isActive ? (
            <div className="space-y-3">
              <Feature label="Unlimited projects" />
              <Feature label="Priority support" />
              <Feature label="Advanced analytics" />
              <Feature label="Custom integrations" />
            </div>
          ) : (
            <p className="text-text-muted">
              <Link href="/pricing" className="text-accent-orange font-bold hover:underline">
                Upgrade to a paid plan
              </Link>{" "}
              to unlock all features.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

function Feature({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2.5 text-success">
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        role="img"
        aria-label="Check"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
      <span className="font-medium">{label}</span>
    </div>
  );
}
