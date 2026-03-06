import { redirect } from "next/navigation";
import { Suspense } from "react";
import { CheckoutSync } from "@/components/checkout-sync";
import { SignOutButton } from "@/components/sign-out-button";
import { SubscriptionCard } from "@/components/subscription-card";
import { createSupabaseServer } from "@/lib/supabase/server";

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
              Your SaaS Features
            </h2>
            {subscription?.status === "active" ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-success">
                  <CheckIcon /> <span className="font-medium">Unlimited projects</span>
                </div>
                <div className="flex items-center gap-2.5 text-success">
                  <CheckIcon /> <span className="font-medium">Priority support</span>
                </div>
                <div className="flex items-center gap-2.5 text-success">
                  <CheckIcon /> <span className="font-medium">Advanced analytics</span>
                </div>
                <div className="flex items-center gap-2.5 text-success">
                  <CheckIcon /> <span className="font-medium">Custom integrations</span>
                </div>
              </div>
            ) : (
              <p className="text-text-muted">
                Upgrade to a paid plan to unlock all features.
              </p>
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
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      role="img"
      aria-label="Check"
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
