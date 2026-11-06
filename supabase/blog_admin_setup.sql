-- DocuFast India — secure blog admin setup
-- Already applied to the Supabase project docufast-blog (nwwmdglqdqoupmefwbbl).
-- Kept here for reference / re-creating the project. To re-run: SQL Editor → New query → paste → Run
--
-- Result: everyone can READ published posts; only accounts listed in public.admins
-- (signed in via Supabase Auth) can create, edit, delete or see drafts.

-- 1) Table (safe if it already exists) ---------------------------------------
create table if not exists public.blog_posts (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  tag         text not null default 'General',
  excerpt     text not null,
  content     text,
  author      text not null default 'DocuFast India',
  published   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- 2) Admin list --------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.admins enable row level security;      -- no policies = not readable via the API
revoke all on public.admins from anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- 3) Lock down blog_posts ----------------------------------------------------
alter table public.blog_posts enable row level security;

-- remove any old permissive policies (e.g. "allow anon insert/delete")
do $$
declare pol record;
begin
  for pol in select policyname from pg_policies where schemaname = 'public' and tablename = 'blog_posts' loop
    execute format('drop policy %I on public.blog_posts', pol.policyname);
  end loop;
end $$;

grant select on public.blog_posts to anon, authenticated;
grant insert, update, delete on public.blog_posts to authenticated;
revoke insert, update, delete on public.blog_posts from anon;

create policy "public reads published posts"
  on public.blog_posts for select
  using (published = true or public.is_admin());

create policy "admins insert posts"
  on public.blog_posts for insert to authenticated
  with check (public.is_admin());

create policy "admins update posts"
  on public.blog_posts for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "admins delete posts"
  on public.blog_posts for delete to authenticated
  using (public.is_admin());

-- 4) Make YOUR login an admin ------------------------------------------------
-- First create the user: Dashboard → Authentication → Users → Add user
--   (tick "Auto Confirm User"), choose your email + a strong password.
-- Then put that same email below and run this statement:
--
-- insert into public.admins (user_id)
-- select id from auth.users where email = 'YOUR_ADMIN_EMAIL_HERE'
-- on conflict do nothing;
--
-- Recommended: Authentication → Sign In / Providers → turn OFF "Allow new users to sign up",
-- so nobody else can create accounts.
