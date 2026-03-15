"use client";

import { isUnlimited } from "@/app/api/credits/helpers";

interface CreditsCardProps {
  balance: number;
  transactions?: {
    id: string;
    amount: number;
    type: string;
    description: string;
    created_at: string;
  }[];
}

export function CreditsCard({ balance, transactions = [] }: CreditsCardProps) {
  const displayBalance = isUnlimited(balance) ? "Unlimited" : balance.toLocaleString();

  return (
    <div className="p-6 bg-bg-secondary rounded-2xl border-2 border-border">
      <h3 className="text-lg font-extrabold text-text-primary mb-1">Credits</h3>
      <p className="text-3xl font-extrabold text-accent-orange mb-4">{displayBalance}</p>

      {transactions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
            Recent Activity
          </p>
          {transactions.slice(0, 5).map((tx) => (
            <div key={tx.id} className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">{tx.description}</span>
              <span
                className={`font-mono font-bold ${tx.amount > 0 ? "text-success" : "text-error"}`}
              >
                {tx.amount > 0 ? "+" : ""}
                {tx.amount}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
