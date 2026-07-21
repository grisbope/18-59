-- 18:59 — Schema Supabase (Postgres)
-- Ejecutar en SQL Editor del proyecto Supabase

-- Perfiles de usuario
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  sector_id text,
  created_at timestamptz default now()
);

-- Planes de resiliencia familiar (contenido completo; no se expone en el tablero)
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

-- Agregados comunitarios por sector (SIN datos individuales ni fotos)
create table if not exists community_sector_stats (
  sector_id text primary key,
  sector_name text not null,
  total_households int not null default 0,
  households_with_plan int not null default 0,
  updated_at timestamptz default now()
);

-- Semilla sectores piloto Portoviejo
insert into community_sector_stats (sector_id, sector_name, total_households, households_with_plan)
values
  ('centro-historico', 'Centro Histórico', 420, 38),
  ('san-gregorio', 'San Gregorio / Plaza Memorial', 180, 22),
  ('picoaza', 'Picoazá', 310, 15),
  ('andre-bello', 'Andrés Bello', 250, 19),
  ('florida', 'Florida', 200, 11)
on conflict (sector_id) do nothing;

-- Función para incrementar contador al compartir plan (solo agregado)
create or replace function register_shared_plan(p_sector_id text)
returns community_sector_stats
language plpgsql
security definer
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

-- RLS
alter table profiles enable row level security;
alter table family_plans enable row level security;
alter table community_sector_stats enable row level security;

create policy "Public read sector stats"
  on community_sector_stats for select
  using (true);

create policy "Users manage own plans"
  on family_plans for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own profile"
  on profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Realtime para tablero
alter publication supabase_realtime add table community_sector_stats;
