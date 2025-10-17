-- FinSight.AI Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- User profiles
create table if not exists profiles(
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz default now()
);

-- File status enum
create type file_status as enum ('uploaded','processing','parsed','failed');

-- Uploaded files
create table if not exists files(
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  original_name text not null,
  mime_type text,
  ext text,
  size bigint,
  status file_status default 'uploaded',
  error text,
  created_at timestamptz default now()
);

-- Categorization rules
create table if not exists rules(
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null default 'Rule',
  conditions text not null,       -- e.g. "contains: subscription|saas|software" or "regex: ..."
  target_category text not null,
  gst_rate numeric default 0,
  active boolean default true,
  created_at timestamptz default now()
);

-- Parsed transactions
create table if not exists transactions(
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  file_id uuid references files(id) on delete set null,
  date date not null,
  description text not null,
  amount numeric not null,
  merchant text,
  gst_rate numeric,
  category text,
  category_confidence numeric,
  raw jsonb,
  dedupe_hash text,                          -- SHA1(user_id|date|desc|amount)
  created_at timestamptz default now()
);

-- Generated reports
create table if not exists reports(
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  kind text not null,                        -- expense|tax|pl
  period_from date not null,
  period_to date not null,
  format text not null,                      -- pdf|excel|csv
  url text,
  size_bytes bigint,
  created_at timestamptz default now()
);

-- Billing subscriptions
create table if not exists subscriptions(
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free',
  status text not null default 'inactive',
  razorpay_customer_id text,
  razorpay_subscription_id text,
  updated_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_tx_user_date on transactions(user_id,date);
create index if not exists idx_tx_user_cat on transactions(user_id,category);
create index if not exists idx_tx_dedupe on transactions(dedupe_hash);
create index if not exists idx_files_user on files(user_id);
create index if not exists idx_rules_user on rules(user_id);
create index if not exists idx_reports_user on reports(user_id);

-- Seed default categories
insert into public.categories (name) values 
  ('Technology'),
  ('Meals & Entertainment'),
  ('Travel'),
  ('Utilities'),
  ('Groceries'),
  ('Subscriptions'),
  ('Salary'),
  ('Fees'),
  ('Shopping'),
  ('Misc')
on conflict do nothing;

-- Row Level Security (RLS) policies
alter table profiles enable row level security;
alter table files enable row level security;
alter table rules enable row level security;
alter table transactions enable row level security;
alter table reports enable row level security;
alter table subscriptions enable row level security;

-- Profiles policies
create policy "Users can view own profile" on profiles for select using (auth.uid() = user_id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = user_id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = user_id);

-- Files policies
create policy "Users can view own files" on files for select using (auth.uid() = user_id);
create policy "Users can insert own files" on files for insert with check (auth.uid() = user_id);
create policy "Users can update own files" on files for update using (auth.uid() = user_id);

-- Rules policies
create policy "Users can view own rules" on rules for select using (auth.uid() = user_id);
create policy "Users can insert own rules" on rules for insert with check (auth.uid() = user_id);
create policy "Users can update own rules" on rules for update using (auth.uid() = user_id);
create policy "Users can delete own rules" on rules for delete using (auth.uid() = user_id);

-- Transactions policies
create policy "Users can view own transactions" on transactions for select using (auth.uid() = user_id);
create policy "Users can insert own transactions" on transactions for insert with check (auth.uid() = user_id);
create policy "Users can update own transactions" on transactions for update using (auth.uid() = user_id);

-- Reports policies
create policy "Users can view own reports" on reports for select using (auth.uid() = user_id);
create policy "Users can insert own reports" on reports for insert with check (auth.uid() = user_id);

-- Subscriptions policies
create policy "Users can view own subscription" on subscriptions for select using (auth.uid() = user_id);
create policy "Users can insert own subscription" on subscriptions for insert with check (auth.uid() = user_id);
create policy "Users can update own subscription" on subscriptions for update using (auth.uid() = user_id);

-- Function to automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  
  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'free', 'active');
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
