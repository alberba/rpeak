-- Credenciales BYOK para proveedores de IA. La clave se cifra en la aplicación
-- antes de persistirse; la base de datos nunca recibe el valor en claro.
create table public.user_ai_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  openrouter_api_key_encrypted text not null,
  openrouter_key_hint text not null check (char_length(openrouter_key_hint) between 4 and 12),
  openrouter_model text not null default 'openrouter/free'
    check (char_length(openrouter_model) between 1 and 160),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_ai_settings enable row level security;

create policy "user_ai_settings_select_own" on public.user_ai_settings
  for select using (auth.uid() = user_id);

create policy "user_ai_settings_insert_own" on public.user_ai_settings
  for insert with check (auth.uid() = user_id);

create policy "user_ai_settings_update_own" on public.user_ai_settings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "user_ai_settings_delete_own" on public.user_ai_settings
  for delete using (auth.uid() = user_id);

create trigger user_ai_settings_set_updated_at
  before update on public.user_ai_settings
  for each row execute function public.set_updated_at();

revoke all on public.user_ai_settings from anon;
grant select, insert, update, delete on public.user_ai_settings to authenticated;
