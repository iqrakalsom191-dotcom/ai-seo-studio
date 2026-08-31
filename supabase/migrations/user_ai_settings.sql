create table if not exists user_ai_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  provider text not null,
  api_key text not null,
  model text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table user_ai_settings enable row level security;

create policy "Users manage own AI settings" on user_ai_settings
  for all using (auth.uid() = user_id);
