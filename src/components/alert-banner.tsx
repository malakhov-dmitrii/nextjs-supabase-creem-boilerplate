interface BillingEvent {
  id: string;
  event_type: string;
  amount?: number;
  currency?: string;
  status?: string;
  created_at: string;
}

interface AlertBannerProps {
  events: BillingEvent[];
}

export function AlertBanner({ events }: AlertBannerProps) {
  if (events.length === 0) return null;

  const openDisputes = events.filter((e) => e.event_type === "dispute" && e.status === "open");
  const recentRefunds = events.filter((e) => e.event_type === "refund");

  if (openDisputes.length === 0 && recentRefunds.length === 0) return null;

  return (
    <div className="space-y-2">
      {openDisputes.map((d) => (
        <div
          key={d.id}
          className="p-3 rounded-xl border-2 border-error/40 bg-error/5 flex items-center gap-2"
        >
          <span className="text-error text-lg">⚠</span>
          <div>
            <p className="text-sm font-bold text-error">Dispute Opened</p>
            <p className="text-xs text-text-muted">
              A payment dispute was opened on {new Date(d.created_at).toLocaleDateString()}. Please
              contact support.
            </p>
          </div>
        </div>
      ))}
      {recentRefunds.map((r) => (
        <div
          key={r.id}
          className="p-3 rounded-xl border-2 border-warning/40 bg-warning/5 flex items-center gap-2"
        >
          <span className="text-warning text-lg">↩</span>
          <div>
            <p className="text-sm font-bold text-warning">Refund Processed</p>
            <p className="text-xs text-text-muted">
              A refund was processed on {new Date(r.created_at).toLocaleDateString()}.
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
