"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function CheckoutSync() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const polling = useRef(false);
  const [status, setStatus] = useState<"idle" | "waiting" | "done">("idle");

  useEffect(() => {
    if (polling.current) return;
    const checkout = searchParams.get("checkout");
    if (checkout !== "success") return;

    polling.current = true;
    setStatus("waiting");

    const timer = setTimeout(() => {
      router.replace("/dashboard");
      router.refresh();
      setStatus("done");
    }, 3000);

    return () => clearTimeout(timer);
  }, [searchParams, router]);

  if (status === "waiting") {
    return (
      <div
        className="bg-success/10 border-2 border-success/30 rounded-2xl p-4 mb-6"
        role="status"
      >
        <p className="text-success font-bold">
          Payment successful! Activating your subscription...
        </p>
      </div>
    );
  }

  return null;
}
