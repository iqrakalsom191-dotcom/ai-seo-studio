create table if not exists wordpress_credentials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  site_url text not null,
  username text not null,
  app_password text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table wordpress_credentials enable row level security;

create policy "Users manage own WP credentials" on wordpress_credentials
  for all using (auth.uid() = user_id);
