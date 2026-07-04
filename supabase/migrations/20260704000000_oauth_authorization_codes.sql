-- Los códigos OAuth deben sobrevivir a invocaciones distintas de Vercel y ser
-- consumibles una sola vez. Solo la service role puede acceder a esta tabla.
create table public.oauth_authorization_codes (
  code_hash text primary key,
  client_id text not null,
  redirect_uri text not null,
  code_challenge text not null,
  scope text not null default '',
  resource text,
  state text,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index oauth_authorization_codes_expires_at_idx
  on public.oauth_authorization_codes (expires_at);

alter table public.oauth_authorization_codes enable row level security;

create function public.consume_oauth_authorization_code(p_code_hash text)
returns table (
  client_id text,
  redirect_uri text,
  code_challenge text,
  scope text,
  resource text,
  state text,
  expires_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  delete from public.oauth_authorization_codes as codes
  where codes.code_hash = p_code_hash
    and codes.expires_at > now()
  returning codes.client_id, codes.redirect_uri, codes.code_challenge,
    codes.scope, codes.resource, codes.state, codes.expires_at;
$$;

revoke all on table public.oauth_authorization_codes from public, anon, authenticated;
revoke all on function public.consume_oauth_authorization_code(text) from public, anon, authenticated;
grant all on table public.oauth_authorization_codes to service_role;
grant execute on function public.consume_oauth_authorization_code(text) to service_role;
