create table if not exists public.site_settings (
  id integer primary key check (id = 1),
  whatsapp_number text not null,
  updated_at timestamptz not null default now()
);

-- Replace the example with your initial public contact number.
insert into public.site_settings (id, whatsapp_number)
values (1, '+9647000000000')
on conflict (id) do nothing;

-- The table is accessed by server-side functions using the service role key.
-- Never expose SUPABASE_SERVICE_ROLE_KEY in browser JavaScript.
alter table public.site_settings enable row level security;