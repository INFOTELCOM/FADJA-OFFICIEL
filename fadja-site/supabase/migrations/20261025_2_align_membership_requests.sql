-- Harmonise les demandes avec l'interface d'administration actuelle.
alter table public.membership_requests
  add column if not exists admin_notes text;

alter table public.membership_requests
  drop constraint if exists membership_requests_status_check;
alter table public.membership_requests
  add constraint membership_requests_status_check
  check (status in ('pending','contacted','approved','rejected'));

grant insert on public.membership_requests to anon, authenticated;
grant select, update on public.membership_requests to authenticated;

drop policy if exists "Public can submit membership requests" on public.membership_requests;
drop policy if exists membership_public_submit on public.membership_requests;
create policy membership_public_submit on public.membership_requests
  for insert to anon, authenticated
  with check (
    char_length(trim(full_name)) between 2 and 160
    and char_length(trim(phone)) between 6 and 40
    and (email is null or char_length(email) <= 254)
    and (motivation is null or char_length(motivation) <= 3000)
  );

drop policy if exists "Admins can read membership requests" on public.membership_requests;
drop policy if exists membership_admin_read on public.membership_requests;
create policy membership_admin_read on public.membership_requests
  for select to authenticated using ((select private.is_admin()));

drop policy if exists "Admins can update membership requests" on public.membership_requests;
drop policy if exists membership_admin_update on public.membership_requests;
create policy membership_admin_update on public.membership_requests
  for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));