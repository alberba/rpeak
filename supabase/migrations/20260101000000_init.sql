-- RPeak: esquema inicial (perfiles, planes, entrenamientos, catálogo de ejercicios).
-- Los bloques de plan/entrenamiento se guardan como JSONB: son un árbol recursivo
-- (bloque single/superset -> ejercicios -> series) que Zod valida en la app
-- (packages/domain); esta base de datos solo los persiste y los protege con RLS.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text not null,
  avatar_url text,
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Crea automáticamente el perfil al darse de alta vía Google OAuth, usando los
-- metadatos que entrega el proveedor (nombre y avatar).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', new.email),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- plans
-- ---------------------------------------------------------------------------

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  description text not null default '' check (char_length(description) <= 2000),
  blocks jsonb not null default '[]'::jsonb check (jsonb_typeof(blocks) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index plans_user_id_idx on public.plans (user_id);
create index plans_user_id_created_at_idx on public.plans (user_id, created_at desc);

alter table public.plans enable row level security;

create policy "plans_select_own" on public.plans
  for select using (auth.uid() = user_id);

create policy "plans_insert_own" on public.plans
  for insert with check (auth.uid() = user_id);

create policy "plans_update_own" on public.plans
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "plans_delete_own" on public.plans
  for delete using (auth.uid() = user_id);

create trigger plans_set_updated_at
  before update on public.plans
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- workout_sessions
-- ---------------------------------------------------------------------------

create table public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  plan_id uuid references public.plans (id) on delete set null,
  name text not null check (char_length(name) between 1 and 120),
  notes text not null default '' check (char_length(notes) <= 2000),
  blocks jsonb not null default '[]'::jsonb check (jsonb_typeof(blocks) = 'array'),
  started_at timestamptz not null,
  finished_at timestamptz,
  constraint workout_sessions_finished_after_started check (finished_at is null or finished_at >= started_at)
);

create index workout_sessions_user_id_idx on public.workout_sessions (user_id);
create index workout_sessions_plan_id_idx on public.workout_sessions (plan_id);
create index workout_sessions_user_id_started_at_idx on public.workout_sessions (user_id, started_at desc);

alter table public.workout_sessions enable row level security;

create policy "workout_sessions_select_own" on public.workout_sessions
  for select using (auth.uid() = user_id);

create policy "workout_sessions_insert_own" on public.workout_sessions
  for insert with check (auth.uid() = user_id);

create policy "workout_sessions_update_own" on public.workout_sessions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "workout_sessions_delete_own" on public.workout_sessions
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- exercises (catálogo de solo lectura para la app; se puebla en supabase/seed.sql)
-- ---------------------------------------------------------------------------

create table public.exercises (
  id text primary key,
  name text not null,
  force text check (force in ('push', 'pull', 'static')),
  level text not null check (level in ('beginner', 'intermediate', 'expert')),
  mechanic text check (mechanic in ('compound', 'isolation')),
  equipment text check (
    equipment in (
      'barbell', 'dumbbell', 'other', 'body only', 'cable', 'machine',
      'kettlebells', 'bands', 'medicine ball', 'exercise ball', 'foam roll', 'e-z curl bar'
    )
  ),
  primary_muscles text[] not null default '{}',
  secondary_muscles text[] not null default '{}',
  instructions text[] not null default '{}',
  category text not null check (
    category in ('strength', 'stretching', 'plyometrics', 'powerlifting', 'olympic weightlifting', 'strongman', 'cardio')
  ),
  constraint exercises_primary_muscles_valid check (
    primary_muscles <@ array[
      'abdominals', 'abductors', 'adductors', 'biceps', 'calves', 'chest', 'forearms', 'glutes',
      'hamstrings', 'lats', 'lower back', 'middle back', 'neck', 'quadriceps', 'shoulders', 'traps', 'triceps'
    ]::text[]
  ),
  constraint exercises_secondary_muscles_valid check (
    secondary_muscles <@ array[
      'abdominals', 'abductors', 'adductors', 'biceps', 'calves', 'chest', 'forearms', 'glutes',
      'hamstrings', 'lats', 'lower back', 'middle back', 'neck', 'quadriceps', 'shoulders', 'traps', 'triceps'
    ]::text[]
  )
);

create index exercises_category_idx on public.exercises (category);
create index exercises_primary_muscles_idx on public.exercises using gin (primary_muscles);
create index exercises_name_idx on public.exercises using gin (to_tsvector('simple', name));

alter table public.exercises enable row level security;

-- Catálogo compartido: cualquier usuario autenticado puede leerlo. Se escribe solo
-- por migración/seed con la service role, que además ignora RLS.
create policy "exercises_select_authenticated" on public.exercises
  for select to authenticated using (true);
