"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function CheckoutSync() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const synced = useRef(false);
  const [status, setStatus] = useState<"idle" | "syncing" | "error">("idle");

  useEffect(() => {
    if (synced.current) return;
    const checkout = searchParams.get("checkout");
    if (checkout !== "success") return;

    const subscriptionId = searchParams.get("subscription_id");
    const productId = searchParams.get("product_id");
    const customerId = searchParams.get("customer_id");

    if (!subscriptionId || !productId) return;

    synced.current = true;
    setStatus("syncing");

    fetch("/api/checkout/success", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriptionId, productId, customerId }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Sync failed");
        router.replace("/dashboard");
        router.refresh();
      })
      .catch(() => {
        setStatus("error");
      });
  }, [searchParams, router]);

  if (status === "error") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p className="text-red-800 font-medium">
          Failed to sync subscription. Please refresh the page.
        </p>
      </div>
    );
  }

  if (status === "syncing") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <p className="text-green-800 font-medium">Syncing your subscription...</p>
      </div>
    );
  }

  return null;
}
