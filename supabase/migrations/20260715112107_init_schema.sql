create table if not exists public.habits (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  emoji text default '📋',
  type text default 'boolean',
  target_count integer,
  logs jsonb default '{}',
  created_at text default (now()::date)::text,
  updated_at timestamp default now()
);

create table if not exists public.challenges (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  duration integer not null,
  habit_id text,
  start_date text not null,
  completed boolean default false,
  check_ins jsonb default '{}',
  created_at timestamp default now()
);

create table if not exists public.settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  onboarding_complete boolean default false,
  notification_time text default '09:00',
  notifications_enabled boolean default true,
  updated_at timestamp default now()
);

alter table public.habits enable row level security;
alter table public.challenges enable row level security;
alter table public.settings enable row level security;

create policy "Users can manage their own habits"
  on public.habits for all using (auth.uid() = user_id);

create policy "Users can manage their own challenges"
  on public.challenges for all using (auth.uid() = user_id);

create policy "Users can manage their own settings"
  on public.settings for all using (auth.uid() = user_id);
