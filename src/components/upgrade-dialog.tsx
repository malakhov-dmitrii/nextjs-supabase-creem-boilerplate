"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Plan {
  id: string;
  name: string;
  price: number;
}

interface UpgradeDialogProps {
  subscriptionId: string;
  currentProductId: string;
  plans: Plan[];
}

export function UpgradeDialog({ subscriptionId, currentProductId, plans }: UpgradeDialogProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const currentPlan = plans.find((p) => p.id === currentProductId);

  async function handleUpgrade(newProductId: string) {
    setLoading(newProductId);
    setError(null);

    const res = await fetch("/api/subscriptions/upgrade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriptionId, newProductId }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Upgrade failed");
      setLoading(null);
      return;
    }

    router.refresh();
    setLoading(null);
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-bold text-text-primary">Change Plan</p>

      <div className="grid gap-2 sm:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentProductId;
          const isUpgrade = currentPlan && plan.price > currentPlan.price;

          return (
            <div
              key={plan.id}
              className={`rounded-lg border-2 p-3 ${
                isCurrent ? "border-accent-orange bg-accent-orange/5" : "border-border"
              }`}
            >
              <div className="text-sm font-bold text-text-primary">{plan.name}</div>
              <div className="text-sm text-text-muted">${(plan.price / 100).toFixed(0)}/mo</div>
              {isCurrent ? (
                <span className="mt-2 inline-block text-xs text-accent-orange font-bold">
                  Current Plan
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={loading !== null}
                  className="mt-2 px-3 py-1 text-xs font-bold btn-secondary disabled:opacity-50"
                >
                  {loading === plan.id ? "Processing..." : isUpgrade ? "Upgrade" : "Downgrade"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {error && <p className="text-error text-sm">{error}</p>}
    </div>
  );
}
