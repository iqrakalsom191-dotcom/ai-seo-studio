create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  tool text,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamp with time zone default now()
);

alter table reviews enable row level security;

create policy "Users insert own reviews" on reviews
  for insert with check (auth.uid() = user_id);

create policy "Anyone can read reviews for public display" on reviews
  for select using (true);
