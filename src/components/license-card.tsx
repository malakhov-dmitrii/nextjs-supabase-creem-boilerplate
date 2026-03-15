"use client";

import { useState } from "react";

interface License {
  id: string;
  creem_license_key: string;
  product_name?: string;
  status: string;
  instance_name?: string;
  instance_id?: string;
  activated_at?: string;
}

interface LicenseCardProps {
  licenses: License[];
}

export function LicenseCard({ licenses }: LicenseCardProps) {
  const [activating, setActivating] = useState<string | null>(null);

  async function handleActivate(key: string) {
    const instanceName = window.prompt("Enter instance name (e.g., my-laptop):");
    if (!instanceName) return;

    setActivating(key);
    const res = await fetch("/api/licenses/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, instanceName }),
    });
    setActivating(null);

    if (res.ok) {
      window.location.reload();
    }
  }

  if (licenses.length === 0) {
    return (
      <div className="p-6 bg-bg-secondary rounded-2xl border-2 border-border">
        <h3 className="text-lg font-extrabold text-text-primary mb-2">License Keys</h3>
        <p className="text-text-muted text-sm">
          No license keys yet. Purchase a one-time product to get a license key.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-bg-secondary rounded-2xl border-2 border-border">
      <h3 className="text-lg font-extrabold text-text-primary mb-4">License Keys</h3>
      <div className="space-y-3">
        {licenses.map((lic) => (
          <div key={lic.id} className="p-3 bg-bg-primary rounded-xl border border-border">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold text-text-primary">
                {lic.product_name ?? "Product"}
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  lic.status === "active"
                    ? "bg-success/10 text-success"
                    : "bg-text-muted/10 text-text-muted"
                }`}
              >
                {lic.status}
              </span>
            </div>
            <code className="text-xs text-text-muted font-mono block mb-2">
              {lic.creem_license_key}
            </code>
            {lic.status === "inactive" && (
              <button
                type="button"
                onClick={() => handleActivate(lic.creem_license_key)}
                disabled={activating === lic.creem_license_key}
                className="text-xs btn-primary px-3 py-1"
              >
                {activating === lic.creem_license_key ? "Activating..." : "Activate"}
              </button>
            )}
            {lic.instance_name && (
              <p className="text-xs text-text-muted mt-1">Device: {lic.instance_name}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
