-- El catálogo base permanece compartido (user_id null); los ejercicios creados
-- desde MCP pertenecen a un usuario y RLS impide que otros puedan verlos.
alter table public.exercises
  add column user_id uuid references auth.users (id) on delete cascade;

create index exercises_user_id_idx on public.exercises (user_id);

drop policy "exercises_select_authenticated" on public.exercises;

create policy "exercises_select_catalog_and_own" on public.exercises
  for select to authenticated
  using (user_id is null or auth.uid() = user_id);

create policy "exercises_insert_own" on public.exercises
  for insert to authenticated
  with check (auth.uid() = user_id);

create policy "exercises_update_own" on public.exercises
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "exercises_delete_own" on public.exercises
  for delete to authenticated
  using (auth.uid() = user_id);
