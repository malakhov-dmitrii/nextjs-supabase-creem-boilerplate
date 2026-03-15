"use client";

import { useEffect, useState } from "react";

interface Transaction {
  id: string;
  displayAmount: string;
  status: string;
  created_at: string;
}

export function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchTransactions depends on page
  useEffect(() => {
    fetchTransactions();
  }, [page]);

  async function fetchTransactions() {
    setLoading(true);
    const res = await fetch(`/api/transactions?page=${page}`);
    const data = await res.json();
    setTransactions(data.transactions ?? []);
    setLoading(false);
  }

  if (loading) {
    return <p className="text-text-muted text-sm">Loading transactions...</p>;
  }

  if (transactions.length === 0) {
    return <p className="text-text-muted text-sm">No transactions yet.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-text-muted border-b border-border">
              <th className="pb-2 font-bold">Date</th>
              <th className="pb-2 font-bold">Amount</th>
              <th className="pb-2 font-bold">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-b border-border/50">
                <td className="py-2 text-text-secondary">
                  {new Date(tx.created_at).toLocaleDateString()}
                </td>
                <td className="py-2 font-mono font-bold text-text-primary">{tx.displayAmount}</td>
                <td className="py-2">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      tx.status === "completed"
                        ? "bg-success/10 text-success"
                        : tx.status === "pending"
                          ? "bg-warning/10 text-warning"
                          : "bg-text-muted/10 text-text-muted"
                    }`}
                  >
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="px-3 py-1 text-sm btn-secondary disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => setPage(page + 1)}
          disabled={transactions.length < 20}
          className="px-3 py-1 text-sm btn-secondary disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
