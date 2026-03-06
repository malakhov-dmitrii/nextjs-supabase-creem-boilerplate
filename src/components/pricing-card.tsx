"use client";

import { useState } from "react";

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  features: string[];
  productId: string;
  popular?: boolean;
}

export function PricingCard({ plan }: { plan: PricingPlan }) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: plan.productId }),
    });

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else if (data.error === "Unauthorized") {
      window.location.href = "/login";
    }
    setLoading(false);
  }

  return (
    <div
      className={`bg-bg-secondary rounded-2xl border-3 p-7 flex flex-col ${
        plan.popular ? "border-accent-orange" : "border-border"
      }`}
      style={{
        boxShadow: plan.popular
          ? "6px 6px 0px var(--accent-orange)"
          : "4px 4px 0px rgba(255, 255, 255, 0.06)",
      }}
    >
      {plan.popular && (
        <span className="self-start px-4 py-1.5 bg-accent-orange text-black text-xs font-extrabold uppercase tracking-widest rounded-full mb-4 border-2 border-black">
          Most Popular
        </span>
      )}
      <h3 className="text-xl font-extrabold text-text-primary">{plan.name}</h3>
      <div className="mt-2 mb-6">
        <span className="text-5xl font-extrabold text-text-primary tracking-tight">
          {plan.price}
        </span>
        <span className="text-text-muted text-lg">/{plan.period}</span>
      </div>
      <ul className="space-y-3 mb-8 flex-1">
        {plan.features.map((feature) => (
          <li
            key={feature}
            className="flex items-center gap-2.5 text-sm text-text-secondary"
          >
            <svg
              className="w-5 h-5 text-success flex-shrink-0"
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
            {feature}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading}
        className={`w-full py-3 text-base ${
          plan.popular
            ? "btn-primary"
            : "btn-dark"
        } disabled:btn-disabled`}
      >
        {loading ? "Redirecting..." : "Get Started →"}
      </button>
    </div>
  );
}
