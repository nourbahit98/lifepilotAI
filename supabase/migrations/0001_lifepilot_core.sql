create extension if not exists pgcrypto;

create schema if not exists app_private;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  preferred_language text not null default 'nl',
  subscription_plan text not null default 'free' check (subscription_plan in ('free', 'premium', 'premium_plus')),
  stripe_customer_id text,
  onboarding_completed boolean not null default false,
  role text not null default 'user' check (role in ('user', 'admin')),
  blocked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default 'Nieuwe opdracht',
  selected_module text not null default 'general',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  filename text not null,
  file_type text not null,
  storage_path text not null,
  extracted_text text,
  analysis_status text not null default 'pending' check (analysis_status in ('pending', 'processed', 'failed')),
  created_at timestamptz not null default now()
);

create table if not exists public.generated_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  file_type text not null check (file_type in ('pdf', 'docx', 'xlsx', 'csv', 'ics')),
  storage_path text not null,
  source_conversation_id uuid references public.conversations(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.planning_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  start_datetime timestamptz,
  end_datetime timestamptz,
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high')),
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done', 'moved')),
  source text not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_memory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category text not null,
  key text not null,
  value text not null,
  consent_given boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, category, key)
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  stripe_subscription_id text unique,
  stripe_price_id text,
  plan text not null default 'free' check (plan in ('free', 'premium', 'premium_plus')),
  status text not null default 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.usage_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  usage_type text not null check (usage_type in ('ai_command', 'upload', 'export')),
  amount integer not null default 1 check (amount > 0),
  billing_period text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.security_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  event_type text not null,
  severity text not null default 'info' check (severity in ('info', 'warning', 'error')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists conversations_user_updated_idx on public.conversations(user_id, updated_at desc);
create index if not exists messages_conversation_created_idx on public.messages(conversation_id, created_at);
create index if not exists documents_user_created_idx on public.documents(user_id, created_at desc);
create index if not exists generated_files_user_created_idx on public.generated_files(user_id, created_at desc);
create index if not exists planning_items_user_start_idx on public.planning_items(user_id, start_datetime);
create index if not exists usage_records_user_period_idx on public.usage_records(user_id, billing_period, usage_type);

create or replace function app_private.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function app_private.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
      and blocked_at is null
  );
$$;

create or replace function app_private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, subscription_plan)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'free'
  )
  on conflict (id) do nothing;

  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'free', 'active')
  on conflict do nothing;

  return new;
end;
$$;

revoke all on function app_private.is_admin() from public, anon, authenticated;
revoke all on function app_private.handle_new_user() from public, anon, authenticated;
revoke all on function app_private.touch_updated_at() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function app_private.handle_new_user();

drop trigger if exists touch_profiles_updated_at on public.profiles;
create trigger touch_profiles_updated_at before update on public.profiles
  for each row execute function app_private.touch_updated_at();

drop trigger if exists touch_conversations_updated_at on public.conversations;
create trigger touch_conversations_updated_at before update on public.conversations
  for each row execute function app_private.touch_updated_at();

drop trigger if exists touch_planning_items_updated_at on public.planning_items;
create trigger touch_planning_items_updated_at before update on public.planning_items
  for each row execute function app_private.touch_updated_at();

drop trigger if exists touch_user_memory_updated_at on public.user_memory;
create trigger touch_user_memory_updated_at before update on public.user_memory
  for each row execute function app_private.touch_updated_at();

drop trigger if exists touch_subscriptions_updated_at on public.subscriptions;
create trigger touch_subscriptions_updated_at before update on public.subscriptions
  for each row execute function app_private.touch_updated_at();

alter table public.profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.documents enable row level security;
alter table public.generated_files enable row level security;
alter table public.planning_items enable row level security;
alter table public.user_memory enable row level security;
alter table public.subscriptions enable row level security;
alter table public.usage_records enable row level security;
alter table public.security_events enable row level security;

create policy "profiles select own or admin" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id or app_private.is_admin());

create policy "profiles update own editable data" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "profiles admin update" on public.profiles
  for update to authenticated
  using (app_private.is_admin())
  with check (app_private.is_admin());

create policy "conversations owner all" on public.conversations
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "messages owner all" on public.messages
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
        and conversations.user_id = (select auth.uid())
    )
  );

create policy "documents owner all" on public.documents
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "generated files owner all" on public.generated_files
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "planning owner all" on public.planning_items
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "memory owner all" on public.user_memory
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "subscriptions owner select" on public.subscriptions
  for select to authenticated
  using ((select auth.uid()) = user_id or app_private.is_admin());

create policy "usage owner select" on public.usage_records
  for select to authenticated
  using ((select auth.uid()) = user_id or app_private.is_admin());

create policy "security events admin select" on public.security_events
  for select to authenticated
  using (app_private.is_admin());

grant usage on schema public to anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, preferred_language, onboarding_completed, updated_at) on public.profiles to authenticated;
grant select, insert, update, delete on public.conversations to authenticated;
grant select, insert, update, delete on public.messages to authenticated;
grant select, insert, update, delete on public.documents to authenticated;
grant select, insert, update, delete on public.generated_files to authenticated;
grant select, insert, update, delete on public.planning_items to authenticated;
grant select, insert, update, delete on public.user_memory to authenticated;
grant select on public.subscriptions to authenticated;
grant select on public.usage_records to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'documents',
    'documents',
    false,
    52428800,
    array[
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/png',
      'image/jpeg'
    ]
  ),
  (
    'generated-files',
    'generated-files',
    false,
    52428800,
    array[
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'text/calendar'
    ]
  )
on conflict (id) do update
set file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "document storage owner select" on storage.objects
  for select to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "document storage owner insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "document storage owner update" on storage.objects
  for update to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "document storage owner delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "generated storage owner select" on storage.objects
  for select to authenticated
  using (bucket_id = 'generated-files' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "generated storage owner insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'generated-files' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "generated storage owner delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'generated-files' and (storage.foldername(name))[1] = (select auth.uid())::text);
