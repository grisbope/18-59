-- 18:59 — Schema Supabase (Postgres opcional)
-- El tablero ya funciona con Storage (bucket app1859) usando sb_secret_.
-- Ejecuta este SQL en el SQL Editor del proyecto para activar también Postgres + Realtime.

create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  sector_id text,
  created_at timestamptz default now()
);

create table if not exists family_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  building_id text not null,
  sector_id text not null,
  hazard_type text not null check (hazard_type in ('sismo', 'inundacion', 'sequia')),
  plan_json jsonb not null,
  shared boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists family_plans_sector_idx on family_plans(sector_id);
create index if not exists family_plans_shared_idx on family_plans(sector_id, shared);

create table if not exists community_sector_stats (
  sector_id text primary key,
  sector_name text not null,
  total_households int not null default 0,
  households_with_plan int not null default 0,
  updated_at timestamptz default now()
);

insert into community_sector_stats (sector_id, sector_name, total_households, households_with_plan)
values
  ('centro-historico', 'Centro Histórico', 420, 38),
  ('san-gregorio', 'San Gregorio / Plaza Memorial', 180, 22),
  ('picoaza', 'Picoazá', 310, 15),
  ('andre-bello', 'Andrés Bello', 250, 19),
  ('florida', 'Florida', 200, 11)
on conflict (sector_id) do nothing;

create or replace function register_shared_plan(p_sector_id text)
returns community_sector_stats
language plpgsql
security definer
set search_path = public
as $$
declare
  result community_sector_stats;
begin
  update community_sector_stats
  set households_with_plan = least(households_with_plan + 1, total_households),
      updated_at = now()
  where sector_id = p_sector_id
  returning * into result;
  return result;
end;
$$;

grant execute on function register_shared_plan(text) to anon, authenticated, service_role;

alter table profiles enable row level security;
alter table family_plans enable row level security;
alter table community_sector_stats enable row level security;

drop policy if exists "Public read sector stats" on community_sector_stats;
create policy "Public read sector stats"
  on community_sector_stats for select
  using (true);

drop policy if exists "Users manage own plans" on family_plans;
create policy "Users manage own plans"
  on family_plans for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage own profile" on profiles;
create policy "Users manage own profile"
  on profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

do $$
begin
  alter publication supabase_realtime add table community_sector_stats;
exception
  when duplicate_object then null;
end $$;
