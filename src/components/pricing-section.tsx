"use client";

import { useState } from "react";
import { PricingCard } from "./pricing-card";

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  features: string[];
  productId: string;
  popular?: boolean;
}

export function PricingSection({ plans }: { plans: PricingPlan[] }) {
  const [discountCode, setDiscountCode] = useState("");
  const [showDiscount, setShowDiscount] = useState(false);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <PricingCard key={plan.name} plan={plan} discountCode={discountCode || undefined} />
        ))}
      </div>

      <div className="flex justify-center">
        {!showDiscount ? (
          <button
            type="button"
            onClick={() => setShowDiscount(true)}
            className="text-sm text-accent-orange hover:underline font-bold"
          >
            Have a discount code?
          </button>
        ) : (
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
              placeholder="Enter code"
              className="px-3 py-2 bg-bg-secondary border-2 border-border rounded-xl text-text-primary text-sm placeholder:text-text-muted focus:border-accent-orange focus:outline-none w-44"
            />
            {discountCode && <span className="text-xs text-success font-bold">Applied!</span>}
          </div>
        )}
      </div>
    </div>
  );
}
