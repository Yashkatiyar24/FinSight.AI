-- FinSight.AI Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enable pgcrypto for generating random UUIDs
create extension if not exists "pgcrypto";

-- Enums
create type plan_tier as enum ('free', 'pro', 'business');
create type file_type as enum ('csv', 'xls', 'xlsx', 'pdf');
create type upload_status as enum ('received', 'parsing', 'parsed', 'failed');
create type report_type as enum ('expense', 'tax', 'pnl');
create type subscription_status as enum ('active', 'trialing', 'canceled', 'past_due');

-- User profiles (extended from auth.users)
create table if not exists profiles(
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  company_name text,
  gstin text,
  address text,
  phone text,
  plan_tier plan_tier default 'free',
  verified boolean default false,
  notification_email boolean default true,
  notification_sms boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- File uploads
create table if not exists uploads(
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  original_name text not null,
  file_path text not null,
  file_type file_type not null,
  size_bytes bigint not null,
  status upload_status default 'received',
  parsed_rows integer default 0,
  failed_rows integer default 0,
  error_details jsonb,
  created_at timestamptz default now(),
  processed_at timestamptz
);

-- Transactions
create table if not exists transactions(
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  tx_date date not null,
  description text not null,
  merchant text,
  amount numeric not null,
  gst_rate numeric,
  gst_amount numeric,
  gstin text,
  category text,
  final_category text,
  ml_confidence numeric,
  ml_predicted_category text,
  source_upload_id uuid references uploads(id) on delete set null,
  rule_applied_id uuid,
  is_income boolean default false,
  is_recurring boolean default false,
  notes text,
  raw_data jsonb,
  dedupe_hash text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Categorization rules
create table if not exists rules(
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  description text,
  enabled boolean default true,
  priority integer default 0,
  conditions jsonb not null,
  actions jsonb not null,
  match_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Generated reports
create table if not exists reports(
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  type report_type not null,
  period_start date not null,
  period_end date not null,
  file_url text,
  file_path text,
  metrics jsonb,
  parameters jsonb,
  created_at timestamptz default now()
);

-- Billing and subscriptions
create table if not exists billing(
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  razorpay_subscription_id text,
  razorpay_customer_id text,
  plan plan_tier default 'free',
  status subscription_status default 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_ends_at timestamptz,
  canceled_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Audit logs
create table if not exists audit_logs(
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  action text not null,
  resource_type text,
  resource_id text,
  details jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz default now()
);

-- Category feedback for ML improvement
create table if not exists category_feedback(
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  transaction_id uuid references transactions(id) on delete cascade,
  original_category text,
  corrected_category text not null,
  confidence_score numeric,
  created_at timestamptz default now()
);

-- Storage buckets (run this manually in Supabase dashboard)
-- insert into storage.buckets (id, name, public) values ('uploads', 'uploads', false);
-- insert into storage.buckets (id, name, public) values ('reports', 'reports', false);

-- Indexes for performance
create index if not exists idx_tx_user_date on transactions(user_id, tx_date);
create index if not exists idx_tx_user_cat on transactions(user_id, final_category);
create index if not exists idx_tx_dedupe on transactions(dedupe_hash);
create index if not exists idx_tx_amount on transactions(user_id, amount);
create index if not exists idx_uploads_user on uploads(user_id, created_at);
create index if not exists idx_rules_user on rules(user_id, enabled);
create index if not exists idx_reports_user on reports(user_id, created_at);
create index if not exists idx_billing_user on billing(user_id);

-- Default categories (these will be used in the app logic)
-- Technology, Meals & Entertainment, Travel, Utilities, Groceries, 
-- Subscriptions, Salary, Fees, Shopping, Misc

-- Row Level Security (RLS) policies
alter table profiles enable row level security;
alter table uploads enable row level security;
alter table transactions enable row level security;
alter table rules enable row level security;
alter table reports enable row level security;
alter table billing enable row level security;
alter table audit_logs enable row level security;
alter table category_feedback enable row level security;

-- Profiles policies
create policy "Users can view own profile" on profiles for select using (auth.uid() = user_id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = user_id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = user_id);

-- Uploads policies
create policy "Users can view own uploads" on uploads for select using (auth.uid() = user_id);
create policy "Users can insert own uploads" on uploads for insert with check (auth.uid() = user_id);
create policy "Users can update own uploads" on uploads for update using (auth.uid() = user_id);

-- Transactions policies
create policy "Users can view own transactions" on transactions for select using (auth.uid() = user_id);
create policy "Users can insert own transactions" on transactions for insert with check (auth.uid() = user_id);
create policy "Users can update own transactions" on transactions for update using (auth.uid() = user_id);
create policy "Users can delete own transactions" on transactions for delete using (auth.uid() = user_id);

-- Rules policies
create policy "Users can view own rules" on rules for select using (auth.uid() = user_id);
create policy "Users can insert own rules" on rules for insert with check (auth.uid() = user_id);
create policy "Users can update own rules" on rules for update using (auth.uid() = user_id);
create policy "Users can delete own rules" on rules for delete using (auth.uid() = user_id);

-- Reports policies
create policy "Users can view own reports" on reports for select using (auth.uid() = user_id);
create policy "Users can insert own reports" on reports for insert with check (auth.uid() = user_id);

-- Billing policies
create policy "Users can view own billing" on billing for select using (auth.uid() = user_id);
create policy "Users can insert own billing" on billing for insert with check (auth.uid() = user_id);
create policy "Users can update own billing" on billing for update using (auth.uid() = user_id);

-- Audit logs policies
create policy "Users can view own audit logs" on audit_logs for select using (auth.uid() = user_id);
create policy "Users can insert own audit logs" on audit_logs for insert with check (auth.uid() = user_id);

-- Category feedback policies
create policy "Users can view own feedback" on category_feedback for select using (auth.uid() = user_id);
create policy "Users can insert own feedback" on category_feedback for insert with check (auth.uid() = user_id);

-- Function to automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'));
  
  insert into public.billing (user_id, plan, status)
  values (new.id, 'free', 'active');
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger update_profiles_updated_at before update on profiles
  for each row execute procedure update_updated_at_column();

create trigger update_transactions_updated_at before update on transactions
  for each row execute procedure update_updated_at_column();

create trigger update_rules_updated_at before update on rules
  for each row execute procedure update_updated_at_column();

create trigger update_billing_updated_at before update on billing
  for each row execute procedure update_updated_at_column();

-- Function to get dashboard metrics
create or replace function get_dashboard_metrics(user_uuid uuid, start_date date default null, end_date date default null)
returns jsonb as $$
declare
  result jsonb;
  total_income numeric := 0;
  total_expenses numeric := 0;
  total_transactions integer := 0;
  categories jsonb;
begin
  -- Set default date range if not provided
  if start_date is null then
    start_date := date_trunc('month', current_date)::date;
  end if;
  
  if end_date is null then
    end_date := current_date;
  end if;
  
  -- Calculate totals
  select 
    coalesce(sum(case when is_income then amount else 0 end), 0),
    coalesce(sum(case when not is_income then abs(amount) else 0 end), 0),
    count(*)
  into total_income, total_expenses, total_transactions
  from transactions 
  where user_id = user_uuid 
    and tx_date between start_date and end_date;
  
  -- Get category breakdown
  select jsonb_agg(
    jsonb_build_object(
      'category', final_category,
      'amount', sum(abs(amount)),
      'count', count(*)
    )
  )
  into categories
  from transactions 
  where user_id = user_uuid 
    and tx_date between start_date and end_date
    and not is_income
    and final_category is not null
  group by final_category
  order by sum(abs(amount)) desc;
  
  -- Build result
  result := jsonb_build_object(
    'total_revenue', total_income,
    'total_expenses', total_expenses,
    'net_profit', total_income - total_expenses,
    'total_transactions', total_transactions,
    'total_gst', coalesce((select sum(gst_amount) from transactions where user_id = user_uuid and tx_date between start_date and end_date), 0),
    'categories', coalesce(categories, '[]'::jsonb)
  );
  
  return result;
end;
$$ language plpgsql security definer;

-- Function to get user usage stats
create or replace function get_user_usage_stats(user_uuid uuid)
returns jsonb as $$
declare
  result jsonb;
begin
  select jsonb_build_object(
    'uploads_count', (select count(*) from uploads where user_id = user_uuid),
    'transactions_count', (select count(*) from transactions where user_id = user_uuid),
    'rules_count', (select count(*) from rules where user_id = user_uuid and enabled = true),
    'reports_count', (select count(*) from reports where user_id = user_uuid),
    'current_month_uploads', (select count(*) from uploads where user_id = user_uuid and created_at >= date_trunc('month', current_date))
  ) into result;
  
  return result;
end;
$$ language plpgsql security definer;
