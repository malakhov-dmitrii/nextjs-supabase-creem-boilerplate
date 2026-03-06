-- Subscriptions table: synced via Creem webhooks
create table if not exists public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade unique not null,
  creem_customer_id text,
  creem_subscription_id text,
  creem_product_id text,
  product_name text,
  status text default 'inactive' check (status in ('active', 'cancelled', 'paused', 'expired', 'inactive')),
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);
create index if not exists idx_subscriptions_creem_subscription_id on public.subscriptions(creem_subscription_id);
create index if not exists idx_subscriptions_creem_customer_id on public.subscriptions(creem_customer_id);

-- RLS
alter table public.subscriptions enable row level security;

-- Users can only read their own subscription
create policy "Users can view own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Note: Service role (used by webhooks) bypasses RLS automatically.

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.handle_updated_at();

-- Webhook events: idempotency tracking
create table if not exists public.webhook_events (
  id text primary key,
  event_type text not null,
  processed_at timestamptz default now()
);

create index if not exists idx_webhook_events_processed_at on public.webhook_events(processed_at);

alter table public.webhook_events enable row level security;

-- Purchases table: one-time purchases synced via Creem webhooks
create table if not exists public.purchases (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  creem_customer_id text,
  creem_product_id text not null,
  product_name text,
  purchased_at timestamptz default now()
);

create index if not exists idx_purchases_user_id on public.purchases(user_id);

-- RLS
alter table public.purchases enable row level security;

create policy "Users can view own purchases"
  on public.purchases for select
  using (auth.uid() = user_id);
