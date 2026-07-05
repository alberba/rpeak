-- Resultado del análisis de IA de un entrenamiento, guardado para no tener que
-- volver a llamar al modelo cada vez que se abre el historial. Una fila por
-- entrenamiento: repetir el análisis sobrescribe la anterior.
create table public.workout_analyses (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null unique references public.workout_sessions (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  model text not null check (char_length(model) between 1 and 160),
  summary text not null,
  highlights text[] not null default '{}',
  suggestions text[] not null default '{}',
  risk_flags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index workout_analyses_user_id_idx on public.workout_analyses (user_id);

alter table public.workout_analyses enable row level security;

create policy "workout_analyses_select_own" on public.workout_analyses
  for select using (auth.uid() = user_id);

create policy "workout_analyses_insert_own" on public.workout_analyses
  for insert with check (auth.uid() = user_id);

create policy "workout_analyses_update_own" on public.workout_analyses
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "workout_analyses_delete_own" on public.workout_analyses
  for delete using (auth.uid() = user_id);

revoke all on public.workout_analyses from anon;
grant select, insert, update, delete on public.workout_analyses to authenticated;
