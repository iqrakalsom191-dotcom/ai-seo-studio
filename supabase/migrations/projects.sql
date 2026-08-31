create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  keyword text not null,
  status text not null default 'in_progress',
  current_step smallint not null default 1,
  keyword_analysis jsonb,
  selected_title text,
  meta_title text,
  meta_description text,
  slug text,
  faqs jsonb,
  schema jsonb,
  competitor_notes text,
  generated_content text,
  wordpress_status text not null default 'none',
  wordpress_post_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table projects enable row level security;

create policy "Users manage own projects" on projects
  for all using (auth.uid() = user_id);

create index if not exists projects_user_id_idx on projects(user_id);
