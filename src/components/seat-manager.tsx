"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface SeatManagerProps {
  subscriptionId: string;
  currentSeats: number;
}

export function SeatManager({ subscriptionId, currentSeats }: SeatManagerProps) {
  const [seats, setSeats] = useState(currentSeats);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleUpdate() {
    if (seats === currentSeats || seats <= 0) return;

    setLoading(true);
    setError(null);

    const res = await fetch("/api/subscriptions/update-seats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriptionId, units: seats }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Update failed");
      setLoading(false);
      return;
    }

    router.refresh();
    setLoading(false);
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-bold text-text-primary">Team Seats</p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setSeats(Math.max(1, seats - 1))}
          className="w-8 h-8 rounded-lg border-2 border-border text-text-primary font-bold hover:border-accent-orange"
        >
          -
        </button>
        <span className="text-lg font-bold text-text-primary min-w-[2rem] text-center">
          {seats}
        </span>
        <button
          type="button"
          onClick={() => setSeats(seats + 1)}
          className="w-8 h-8 rounded-lg border-2 border-border text-text-primary font-bold hover:border-accent-orange"
        >
          +
        </button>
        {seats !== currentSeats && (
          <button
            type="button"
            onClick={handleUpdate}
            disabled={loading}
            className="px-3 py-1 text-sm btn-primary disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update"}
          </button>
        )}
      </div>
      {error && <p className="text-error text-sm">{error}</p>}
    </div>
  );
}
