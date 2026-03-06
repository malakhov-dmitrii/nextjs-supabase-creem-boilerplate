import { redirect } from "next/navigation";
import { Suspense } from "react";
import { CheckoutSync } from "@/components/checkout-sync";
import { SignOutButton } from "@/components/sign-out-button";
import { SubscriptionCard } from "@/components/subscription-card";
import { createSupabaseServer } from "@/lib/supabase/server";
import { type Feature, getPlanFeatures } from "@/lib/entitlements";

const FEATURE_LABELS: Record<Feature, string> = {
  analytics: "Analytics dashboard",
  api: "API access",
  support: "Email support",
  priority_support: "Priority support",
  sso: "SSO / SAML",
  custom_integrations: "Custom integrations",
  unlimited_projects: "Unlimited projects",
  unlimited_team: "Unlimited team members",
};

const ALL_FEATURES: Feature[] = [
  "unlimited_projects",
  "analytics",
  "api",
  "priority_support",
  "custom_integrations",
  "sso",
  "unlimited_team",
  "support",
];

export default async function DashboardPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const activeFeatures =
    subscription?.status === "active"
      ? getPlanFeatures(subscription.product_name)
      : [];

  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="bg-bg-secondary border-b-2 border-border">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-text-primary tracking-tight">
            Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-secondary font-medium">
              {user.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <Suspense>
          <CheckoutSync />
        </Suspense>
        <div className="grid gap-6 md:grid-cols-2">
          <SubscriptionCard subscription={subscription} />

          <div
            className="bg-bg-secondary rounded-2xl border-2 border-border p-6"
            style={{ boxShadow: "4px 4px 0px rgba(255, 255, 255, 0.06)" }}
          >
            <h2 className="text-lg font-extrabold text-text-primary mb-4">
              Your Features
            </h2>
            <div className="space-y-3">
              {ALL_FEATURES.map((feature) => {
                const active = activeFeatures.includes(feature);
                return (
                  <div
                    key={feature}
                    className={`flex items-center gap-2.5 ${active ? "text-success" : "text-text-muted"}`}
                  >
                    {active ? <CheckIcon /> : <LockIcon />}
                    <span
                      className={
                        active
                          ? "font-medium"
                          : "font-medium line-through opacity-60"
                      }
                    >
                      {FEATURE_LABELS[feature]}
                    </span>
                  </div>
                );
              })}
            </div>
            {(!subscription?.status || subscription.status !== "active") && (
              <a
                href="/pricing"
                className="inline-block mt-5 px-5 py-2.5 btn-primary text-sm"
              >
                Upgrade to unlock →
              </a>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      className="w-5 h-5 flex-shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      role="img"
      aria-label="Included"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      className="w-5 h-5 flex-shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      role="img"
      aria-label="Locked"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  );
}
