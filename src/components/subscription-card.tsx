"use client";

import { useState } from "react";

interface Subscription {
  status: string;
  product_name: string;
  current_period_end: string;
  creem_customer_id: string;
}

export function SubscriptionCard({ subscription }: { subscription: Subscription | null }) {
  const [loading, setLoading] = useState(false);

  async function handleManageBilling() {
    setLoading(true);
    const res = await fetch("/api/billing-portal", { method: "POST" });
    const { url } = await res.json();
    if (url) window.location.href = url;
    setLoading(false);
  }

  if (!subscription) {
    return (
      <div
        className="bg-bg-secondary rounded-2xl border-2 border-border p-6"
        style={{ boxShadow: "4px 4px 0px rgba(255, 255, 255, 0.06)" }}
      >
        <h2 className="text-lg font-extrabold text-text-primary mb-2">Subscription</h2>
        <p className="text-text-muted mb-4">No active subscription.</p>
        <a href="/pricing" className="inline-block px-5 py-2.5 btn-primary text-sm">
          View Plans →
        </a>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    active: "bg-success/20 text-success border-2 border-success/30",
    cancelled: "bg-error/20 text-error border-2 border-error/30",
    paused: "bg-warning/20 text-warning border-2 border-warning/30",
    expired: "bg-accent-violet/20 text-accent-violet border-2 border-accent-violet/30",
  };

  return (
    <div
      className="bg-bg-secondary rounded-2xl border-2 border-border p-6"
      style={{ boxShadow: "4px 4px 0px rgba(255, 255, 255, 0.06)" }}
    >
      <h2 className="text-lg font-extrabold text-text-primary mb-4">Subscription</h2>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-text-secondary">Plan</span>
          <span className="font-bold text-text-primary">{subscription.product_name}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-text-secondary">Status</span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide ${statusColors[subscription.status] || statusColors.expired}`}
          >
            {subscription.status}
          </span>
        </div>
        {subscription.current_period_end && (
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Next billing</span>
            <span className="text-sm font-medium text-text-primary">
              {new Date(subscription.current_period_end).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={handleManageBilling}
        disabled={loading}
        className="mt-5 w-full py-3 btn-dark disabled:btn-disabled text-sm"
      >
        {loading ? "Loading..." : "Manage Billing →"}
      </button>
    </div>
  );
}
