"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div
        className="bg-bg-secondary rounded-2xl border-2 border-border p-8 max-w-md w-full text-center"
        style={{ boxShadow: "4px 4px 0px rgba(255, 255, 255, 0.06)" }}
      >
        <h2 className="text-xl font-extrabold text-text-primary mb-2">Something went wrong</h2>
        <p className="text-text-muted text-sm mb-6">
          {error.message || "An unexpected error occurred."}
        </p>
        <button type="button" onClick={reset} className="btn-primary text-sm px-6 py-2">
          Try Again
        </button>
      </div>
    </div>
  );
}
