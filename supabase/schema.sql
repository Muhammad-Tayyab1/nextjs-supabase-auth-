-- Run this in the Supabase SQL editor (Project -> SQL Editor -> New query).
-- Sets up the `profiles`, `tasks`, and `notes` tables (Database examples),
-- the `avatars` bucket (Storage example), and the `messages` table
-- (Realtime Postgres Changes example) used by this app, all scoped with
-- row-level security.

-- ---------------------------------------------------------------------------
-- Database: profiles table
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  bio text,
  avatar_url text,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Automatically create an empty profile row whenever a new auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Storage: avatars bucket
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "Avatar images are publicly accessible" on storage.objects;
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Users can upload their own avatar" on storage.objects;
create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can update their own avatar" on storage.objects;
create policy "Users can update their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can delete their own avatar" on storage.objects;
create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- Realtime: messages table (Postgres Changes example)
-- ---------------------------------------------------------------------------

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  author text not null,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'messages_content_length'
  ) then
    alter table public.messages
      add constraint messages_content_length check (char_length(content) <= 280);
  end if;
end $$;

drop policy if exists "Messages are viewable by authenticated users" on public.messages;
create policy "Messages are viewable by authenticated users"
  on public.messages for select
  using (auth.role() = 'authenticated');

drop policy if exists "Users can insert their own messages" on public.messages;
create policy "Users can insert their own messages"
  on public.messages for insert
  with check (auth.uid() = user_id);

-- Stream inserts on this table to subscribed clients.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Database: tasks table (to-do list example)
-- ---------------------------------------------------------------------------

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  is_complete boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.tasks enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'tasks_title_length'
  ) then
    alter table public.tasks
      add constraint tasks_title_length check (char_length(title) <= 200);
  end if;
end $$;

drop policy if exists "Users can view their own tasks" on public.tasks;
create policy "Users can view their own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own tasks" on public.tasks;
create policy "Users can insert their own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own tasks" on public.tasks;
create policy "Users can update their own tasks"
  on public.tasks for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their own tasks" on public.tasks;
create policy "Users can delete their own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Database: notes table
-- ---------------------------------------------------------------------------

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  body text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.notes enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'notes_title_length'
  ) then
    alter table public.notes
      add constraint notes_title_length check (char_length(title) <= 120);
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'notes_body_length'
  ) then
    alter table public.notes
      add constraint notes_body_length check (char_length(body) <= 4000);
  end if;
end $$;

drop policy if exists "Users can view their own notes" on public.notes;
create policy "Users can view their own notes"
  on public.notes for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own notes" on public.notes;
create policy "Users can insert their own notes"
  on public.notes for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own notes" on public.notes;
create policy "Users can update their own notes"
  on public.notes for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their own notes" on public.notes;
create policy "Users can delete their own notes"
  on public.notes for delete
  using (auth.uid() = user_id);
