-- DocuFast India — contact-form enquiries (already applied to docufast-blog).
-- Public can INSERT only; only admins (public.is_admin()) can read/update/delete.
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 100),
  phone text not null check (char_length(phone) between 8 and 20),
  email text check (email is null or char_length(email) <= 150),
  service text check (service is null or char_length(service) <= 100),
  message text check (message is null or char_length(message) <= 2000),
  status text not null default 'new',
  created_at timestamptz not null default now()
);
alter table public.enquiries enable row level security;
create policy "anyone can submit" on public.enquiries for insert to anon, authenticated with check (true);
create policy "admins read" on public.enquiries for select to authenticated using (public.is_admin());
create policy "admins update" on public.enquiries for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins delete" on public.enquiries for delete to authenticated using (public.is_admin());
