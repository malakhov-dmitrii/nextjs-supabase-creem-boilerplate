import { redirect } from "next/navigation";
import { TransactionList } from "@/components/transaction-list";
import { createSupabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-text-primary mb-2">Transaction History</h1>
        <p className="text-text-muted">View your payment history.</p>
      </div>

      <div className="p-6 bg-bg-secondary rounded-2xl border-2 border-border">
        <TransactionList />
      </div>
    </div>
  );
}
