-- Migration 002: Expand schema for comprehensive Creem integration
-- Adds: profiles, credits, licenses, webhook_events, billing_events tables
-- Modifies: subscriptions (new columns + expanded status CHECK)

-- ============================================================
-- 1. Profiles table (synced with auth.users)
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  creem_customer_id text unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 2. Expand subscriptions table
-- ============================================================

-- Drop old CHECK and add expanded one
alter table public.subscriptions drop constraint if exists subscriptions_status_check;
alter table public.subscriptions add constraint subscriptions_status_check
  check (status in ('active', 'trialing', 'past_due', 'scheduled_cancel', 'cancelled', 'paused', 'expired', 'inactive'));

-- New columns
alter table public.subscriptions add column if not exists cancel_at timestamptz;
alter table public.subscriptions add column if not exists previous_product_id text;
alter table public.subscriptions add column if not exists seats integer default 1;

-- ============================================================
-- 3. Credits wallet
-- ============================================================
create table if not exists public.credits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  balance integer not null default 0 check (balance >= -1),
  updated_at timestamptz default now()
);

create index if not exists idx_credits_user_id on public.credits(user_id);

alter table public.credits enable row level security;

create policy "Users can view own credits"
  on public.credits for select
  using (auth.uid() = user_id);

-- Credit transaction audit log
create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  amount integer not null,
  type text not null check (type in ('subscription_topup', 'purchase', 'spend', 'refund')),
  description text,
  created_at timestamptz default now()
);

create index if not exists idx_credit_transactions_user_id on public.credit_transactions(user_id);

alter table public.credit_transactions enable row level security;

create policy "Users can view own credit transactions"
  on public.credit_transactions for select
  using (auth.uid() = user_id);

-- Atomic spend function (prevents race conditions)
create or replace function public.spend_credits(
  p_user_id uuid,
  p_amount integer,
  p_reason text
) returns integer as $$
declare
  v_balance integer;
begin
  -- Lock row and get current balance
  select balance into v_balance
  from public.credits
  where user_id = p_user_id
  for update;

  if v_balance is null then
    raise exception 'No credits record for user';
  end if;

  -- Unlimited credits: log spend but don't deduct
  if v_balance = -1 then
    insert into public.credit_transactions (user_id, amount, type, description)
    values (p_user_id, -p_amount, 'spend', p_reason);
    return -1;
  end if;

  if v_balance < p_amount then
    raise exception 'Insufficient credits: have %, need %', v_balance, p_amount;
  end if;

  -- Deduct
  update public.credits
  set balance = balance - p_amount, updated_at = now()
  where user_id = p_user_id;

  -- Log transaction
  insert into public.credit_transactions (user_id, amount, type, description)
  values (p_user_id, -p_amount, 'spend', p_reason);

  return v_balance - p_amount;
end;
$$ language plpgsql security definer;

-- ============================================================
-- 4. Licenses
-- ============================================================
create table if not exists public.licenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  creem_license_key text not null,
  creem_product_id text not null,
  product_name text,
  status text not null default 'inactive' check (status in ('active', 'inactive', 'expired')),
  instance_name text,
  instance_id text,
  activated_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_licenses_user_id on public.licenses(user_id);
create index if not exists idx_licenses_key on public.licenses(creem_license_key);

alter table public.licenses enable row level security;

create policy "Users can view own licenses"
  on public.licenses for select
  using (auth.uid() = user_id);

-- ============================================================
-- 5. Webhook events (idempotency)
-- ============================================================
create table if not exists public.webhook_events (
  id text primary key,
  event_type text not null,
  processed_at timestamptz default now()
);

-- ============================================================
-- 6. Billing events (refunds, disputes)
-- ============================================================
create table if not exists public.billing_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  event_type text not null check (event_type in ('refund', 'dispute')),
  creem_transaction_id text,
  creem_subscription_id text,
  amount integer,
  currency text,
  reason text,
  status text default 'open',
  created_at timestamptz default now()
);

create index if not exists idx_billing_events_user_id on public.billing_events(user_id);

alter table public.billing_events enable row level security;

create policy "Users can view own billing events"
  on public.billing_events for select
  using (auth.uid() = user_id);

-- ============================================================
-- Reuse updated_at trigger for new tables
-- ============================================================
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger credits_updated_at
  before update on public.credits
  for each row execute function public.handle_updated_at();
