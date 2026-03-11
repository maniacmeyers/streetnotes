-- Waitlist signups
create table if not exists public.waitlist (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  created_at timestamptz default now() not null
);

-- Allow anonymous inserts (the API route handles validation)
alter table public.waitlist enable row level security;

create policy "Allow anonymous inserts" on public.waitlist
  for insert with check (true);
