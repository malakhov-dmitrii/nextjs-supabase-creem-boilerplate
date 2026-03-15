import { getDemoStore } from "./store";

type Row = Record<string, unknown>;

/**
 * Minimal Supabase client mock for demo mode.
 * Supports: auth.getUser(), auth.signInWithPassword(), auth.signUp(), auth.signOut(),
 * auth.signInWithOAuth(), from().select().eq().single/maybeSingle(),
 * from().upsert(), from().update().eq(), from().insert(),
 * from().select().order().limit(), rpc()
 */
// biome-ignore lint/suspicious/noExplicitAny: demo mock needs flexible return types
export function createDemoClient(): any {
  const store = getDemoStore();

  // Demo user — auto-authenticated
  const demoUser = {
    id: "demo-user",
    email: "demo@saaskit.dev",
    user_metadata: {},
  };

  function getTable(name: string): Map<string, Row> {
    const tables: Record<string, Map<string, Row>> = {
      subscriptions: store.subscriptions as unknown as Map<string, Row>,
      credits: store.creditWallets as unknown as Map<string, Row>,
      credit_transactions: store.creditTransactions as unknown as Map<string, Row>,
      licenses: store.licenses as unknown as Map<string, Row>,
      webhook_events: store.webhookEvents as unknown as Map<string, Row>,
      billing_events: store.billingEvents as unknown as Map<string, Row>,
      profiles: new Map(),
    };
    return tables[name] ?? new Map();
  }

  function buildQuery(tableName: string) {
    const table = getTable(tableName);
    let rows = Array.from(table.values());
    let selectedColumns: string | null = null;
    const filters: Array<(row: Row) => boolean> = [];
    let orderBy: { col: string; asc: boolean } | null = null;
    let limitN: number | null = null;
    let countOnly = false;
    let headOnly = false;

    const chain = {
      select(cols?: string, opts?: { count?: string; head?: boolean }) {
        selectedColumns = cols ?? "*";
        if (opts?.count) countOnly = true;
        if (opts?.head) headOnly = true;
        return chain;
      },
      eq(col: string, val: unknown) {
        filters.push((row) => row[col] === val);
        return chain;
      },
      order(col: string, opts?: { ascending?: boolean }) {
        orderBy = { col, asc: opts?.ascending ?? true };
        return chain;
      },
      limit(n: number) {
        limitN = n;
        return chain;
      },
      single() {
        const result = execute();
        return { data: result[0] ?? null, error: null };
      },
      maybeSingle() {
        const result = execute();
        return { data: result[0] ?? null, error: null };
      },
      insert(data: Row | Row[]) {
        const items = Array.isArray(data) ? data : [data];
        for (const item of items) {
          const id = (item.id as string) ?? `demo_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
          table.set(id, { ...item, id });
        }
        return { data: items, error: null };
      },
      upsert(data: Row | Row[], _opts?: { onConflict?: string }) {
        const items = Array.isArray(data) ? data : [data];
        for (const item of items) {
          const id = (item.id as string) ?? `demo_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
          table.set(id, { ...item, id });
        }
        return { data: items, error: null };
      },
      update(data: Row) {
        return {
          eq(col: string, val: unknown) {
            for (const [key, row] of table.entries()) {
              if (row[col] === val) {
                table.set(key, { ...row, ...data });
              }
            }
            return { data: null, error: null };
          },
        };
      },
      then(resolve: (val: { data: Row[]; error: null; count?: number }) => void) {
        const result = execute();
        if (countOnly) {
          resolve({ data: headOnly ? [] : result, error: null, count: result.length });
        } else {
          resolve({ data: result, error: null });
        }
      },
    };

    function execute(): Row[] {
      let result = rows.filter((row) => filters.every((f) => f(row)));
      if (orderBy) {
        const { col, asc } = orderBy;
        result.sort((a, b) => {
          const va = a[col] as string;
          const vb = b[col] as string;
          return asc ? (va < vb ? -1 : 1) : va > vb ? -1 : 1;
        });
      }
      if (limitN !== null) {
        result = result.slice(0, limitN);
      }
      return result;
    }

    return chain;
  }

  return {
    auth: {
      getUser() {
        return { data: { user: demoUser }, error: null };
      },
      async signInWithPassword({ email }: { email: string; password: string }) {
        return { data: { user: { ...demoUser, email } }, error: null };
      },
      async signUp({ email }: { email: string; password: string }) {
        return { data: { user: { ...demoUser, email } }, error: null };
      },
      async signOut() {
        return { error: null };
      },
      async signInWithOAuth(_opts: { provider: string; options?: unknown }) {
        // In demo mode, OAuth just redirects to dashboard
        return { data: { url: "/dashboard" }, error: null };
      },
    },
    from(table: string) {
      return buildQuery(table);
    },
    rpc(fnName: string, params: Record<string, unknown>) {
      if (fnName === "spend_credits") {
        const userId = params.p_user_id as string;
        const amount = params.p_amount as number;
        const wallet = store.creditWallets.get(userId);
        if (!wallet || wallet.balance < amount) {
          return { data: null, error: { message: "Insufficient credits" } };
        }
        wallet.balance -= amount;
        return { data: wallet.balance, error: null };
      }
      return { data: null, error: null };
    },
  };
}
