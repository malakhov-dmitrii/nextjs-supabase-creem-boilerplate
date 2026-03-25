export interface DemoSubscription {
  id: string;
  user_id: string;
  creem_customer_id?: string;
  creem_subscription_id: string;
  creem_product_id: string;
  product_name?: string;
  status: string;
  current_period_end?: string;
  cancel_at?: string | null;
  previous_product_id?: string;
  seats: number;
  created_at?: string;
}

export interface DemoCreditWallet {
  user_id: string;
  balance: number;
}

export interface DemoCreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: string;
  description: string;
  created_at: string;
}

export interface DemoLicense {
  id: string;
  user_id: string;
  key: string;
  product_id: string;
  product_name?: string;
  status: string;
  instance_name?: string;
  instance_id?: string;
  activated_at?: string;
}

export interface DemoUser {
  id: string;
  email: string;
  password: string;
  full_name?: string;
}

export interface DemoSession {
  userId: string;
  token: string;
}

export interface DemoStore {
  users: Map<string, DemoUser>;
  sessions: Map<string, DemoSession>;
  subscriptions: Map<string, DemoSubscription>;
  creditWallets: Map<string, DemoCreditWallet>;
  creditTransactions: Map<string, DemoCreditTransaction>;
  licenses: Map<string, DemoLicense>;
  webhookEvents: Map<string, { event_type: string; processed_at: string }>;
  billingEvents: Map<string, { event_type: string; user_id?: string; amount?: number }>;
}

function createSeededStore(): DemoStore {
  const now = new Date().toISOString();
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  return {
    users: new Map([
      [
        "demo-user",
        {
          id: "demo-user",
          email: "demo@saaskit.dev",
          password: "demo",
          full_name: "Demo User",
        },
      ],
    ]),
    sessions: new Map(),
    subscriptions: new Map([
      [
        "sub_demo_pro",
        {
          id: "sub_demo_pro",
          user_id: "demo-user",
          creem_subscription_id: "sub_demo_pro",
          creem_product_id: "prod_pro",
          product_name: "Pro Plan",
          status: "active",
          current_period_end: thirtyDaysFromNow,
          seats: 1,
          created_at: now,
        },
      ],
    ]),
    creditWallets: new Map([["demo-user", { user_id: "demo-user", balance: 50 }]]),
    creditTransactions: new Map([
      [
        "ct_1",
        {
          id: "ct_1",
          user_id: "demo-user",
          amount: 100,
          type: "subscription_topup",
          description: "Pro plan credit grant",
          created_at: now,
        },
      ],
      [
        "ct_2",
        {
          id: "ct_2",
          user_id: "demo-user",
          amount: -30,
          type: "spend",
          description: "API usage",
          created_at: now,
        },
      ],
      [
        "ct_3",
        {
          id: "ct_3",
          user_id: "demo-user",
          amount: -20,
          type: "spend",
          description: "Report generation",
          created_at: now,
        },
      ],
    ]),
    licenses: new Map([
      [
        "lic_demo",
        {
          id: "lic_demo",
          user_id: "demo-user",
          key: "DEMO-XXXX-YYYY-ZZZZ",
          product_id: "prod_pro",
          product_name: "Pro Plan",
          status: "active",
          instance_name: "Demo Machine",
          activated_at: now,
        },
      ],
    ]),
    webhookEvents: new Map(),
    billingEvents: new Map(),
  };
}

declare global {
  // biome-ignore lint: globalThis requires var
  var __demoStore: DemoStore | undefined;
}

export function getDemoStore(): DemoStore {
  if (!globalThis.__demoStore) {
    globalThis.__demoStore = createSeededStore();
  }
  return globalThis.__demoStore;
}

export function resetDemoStore(): void {
  globalThis.__demoStore = createSeededStore();
}

let idCounter = 0;
export function generateDemoId(): string {
  idCounter++;
  return `demo_${Date.now()}_${idCounter}`;
}
