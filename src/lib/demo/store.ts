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

function createEmptyStore(): DemoStore {
  return {
    users: new Map(),
    sessions: new Map(),
    subscriptions: new Map(),
    creditWallets: new Map(),
    creditTransactions: new Map(),
    licenses: new Map(),
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
    globalThis.__demoStore = createEmptyStore();
  }
  return globalThis.__demoStore;
}

export function resetDemoStore(): void {
  globalThis.__demoStore = createEmptyStore();
}

let idCounter = 0;
export function generateDemoId(): string {
  idCounter++;
  return `demo_${Date.now()}_${idCounter}`;
}
