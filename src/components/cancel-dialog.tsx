"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface CancelDialogProps {
  subscriptionId: string;
  currentPeriodEnd?: string;
}

export function CancelDialog({ subscriptionId, currentPeriodEnd }: CancelDialogProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"scheduled" | "immediate">("scheduled");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleCancel() {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/subscriptions/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriptionId, mode }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Cancel failed");
      setLoading(false);
      return;
    }

    router.refresh();
    setOpen(false);
    setLoading(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-text-muted hover:text-error transition-colors"
      >
        Cancel Subscription
      </button>
    );
  }

  return (
    <div className="rounded-xl border-2 border-error/30 bg-error/5 p-4 space-y-3">
      <p className="text-sm font-bold text-text-primary">Cancel your subscription?</p>

      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="cancel-mode"
            checked={mode === "scheduled"}
            onChange={() => setMode("scheduled")}
            className="accent-accent-orange"
          />
          <span className="text-sm text-text-secondary">
            At end of billing period
            {currentPeriodEnd && (
              <span className="text-text-muted">
                {" "}
                ({new Date(currentPeriodEnd).toLocaleDateString()})
              </span>
            )}
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="cancel-mode"
            checked={mode === "immediate"}
            onChange={() => setMode("immediate")}
            className="accent-accent-orange"
          />
          <span className="text-sm text-text-secondary">Immediately</span>
        </label>
      </div>

      {error && <p className="text-error text-sm">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="px-4 py-2 text-sm bg-error text-white font-bold rounded-lg hover:bg-error/90 disabled:opacity-50"
        >
          {loading ? "Cancelling..." : "Confirm Cancellation"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          className="px-4 py-2 text-sm text-text-muted hover:text-text-primary"
        >
          Keep Subscription
        </button>
      </div>
    </div>
  );
}
