-- Subscriptions table: synced via Creem webhooks
create table public.subscriptions (
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
create index idx_subscriptions_user_id on public.subscriptions(user_id);
create index idx_subscriptions_creem_subscription_id on public.subscriptions(creem_subscription_id);
create index idx_subscriptions_creem_customer_id on public.subscriptions(creem_customer_id);

-- RLS
alter table public.subscriptions enable row level security;

-- Users can only read their own subscription
create policy "Users can view own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Only service role (webhooks) can insert/update
create policy "Service role can manage subscriptions"
  on public.subscriptions for all
  using (true)
  with check (true);

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
