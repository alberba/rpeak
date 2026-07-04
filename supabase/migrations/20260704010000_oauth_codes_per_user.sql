-- Vincula cada autorización de ChatGPT con el usuario que inició sesión en RPeak.
-- Los códigos existentes son efímeros y no contienen identidad, así que se descartan.
delete from public.oauth_authorization_codes;

alter table public.oauth_authorization_codes
  add column user_id uuid not null references auth.users (id) on delete cascade;

drop function public.consume_oauth_authorization_code(text);

create function public.consume_oauth_authorization_code(p_code_hash text)
returns table (
  user_id uuid,
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
  returning codes.user_id, codes.client_id, codes.redirect_uri,
    codes.code_challenge, codes.scope, codes.resource, codes.state, codes.expires_at;
$$;

revoke all on function public.consume_oauth_authorization_code(text) from public, anon, authenticated;
grant execute on function public.consume_oauth_authorization_code(text) to service_role;
