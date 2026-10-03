-- FADJA : schéma Supabase
create schema if not exists private;

create table if not exists profiles(
  id uuid primary key references auth.users on delete cascade,
  name text,
  structure text,
  role text,
  level text not null default 'Accueil'
    check (level in ('Administrateur','Formateur','Accueil')),
  created_at timestamptz default now()
);
create table if not exists inscrits(
  id bigint primary key,
  data jsonb not null,
  created_by uuid default auth.uid(),
  updated_at timestamptz default now()
);
create table if not exists annonces(
  id bigint primary key,
  data jsonb not null,
  created_by uuid default auth.uid(),
  updated_at timestamptz default now()
);
create table if not exists activite(
  id bigint primary key,
  data jsonb not null,
  created_by uuid default auth.uid(),
  updated_at timestamptz default now()
);
create table if not exists messages(
  id bigint generated always as identity primary key,
  name text,
  phone text,
  formation text,
  message text,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table inscrits enable row level security;
alter table annonces enable row level security;
alter table activite enable row level security;
alter table messages enable row level security;

create or replace function private.my_level()
returns text language sql security definer set search_path=public stable
as $$ select level from public.profiles where id=(select auth.uid()) $$;

create or replace function private.is_admin()
returns boolean language sql security definer set search_path=public stable
as $$ select coalesce((select level from public.profiles where id=(select auth.uid()))='Administrateur',false) $$;

revoke all on function private.my_level() from public;
revoke all on function private.is_admin() from public;
grant execute on function private.my_level() to authenticated;
grant execute on function private.is_admin() to authenticated;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public
as $$
begin
  insert into public.profiles(id,name,structure,role,level)
  values(
    new.id,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'structure',
    new.raw_user_meta_data->>'role',
    case when exists(select 1 from public.profiles)
      then 'Accueil' else 'Administrateur' end
  );
  return new;
end
$$;

do $$
begin
  if not exists(select 1 from pg_trigger where tgname='on_auth_user_created') then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute function public.handle_new_user();
  end if;
end $$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

drop policy if exists p_sel on profiles;
create policy p_sel on profiles for select to authenticated
  using ((id=(select auth.uid())) or (select private.is_admin()));

drop policy if exists p_upd on profiles;
create policy p_upd on profiles for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

drop policy if exists i_sel on inscrits;
create policy i_sel on inscrits for select to authenticated using (true);
drop policy if exists i_ins on inscrits;
create policy i_ins on inscrits for insert to authenticated
  with check ((select private.my_level()) in ('Administrateur','Accueil'));
drop policy if exists i_upd on inscrits;
create policy i_upd on inscrits for update to authenticated
  using ((select private.my_level()) in ('Administrateur','Accueil'))
  with check ((select private.my_level()) in ('Administrateur','Accueil'));
drop policy if exists i_del on inscrits;
create policy i_del on inscrits for delete to authenticated
  using ((select private.is_admin()));

drop policy if exists a_sel on annonces;
create policy a_sel on annonces for select to authenticated using (true);
drop policy if exists a_ins on annonces;
create policy a_ins on annonces for insert to authenticated with check (true);
drop policy if exists a_upd on annonces;
create policy a_upd on annonces for update to authenticated
  using ((created_by=(select auth.uid())) or (select private.is_admin()))
  with check ((created_by=(select auth.uid())) or (select private.is_admin()));
drop policy if exists a_del on annonces;
create policy a_del on annonces for delete to authenticated
  using ((created_by=(select auth.uid())) or (select private.is_admin()));

drop policy if exists l_sel on activite;
create policy l_sel on activite for select to authenticated using (true);
drop policy if exists l_ins on activite;
create policy l_ins on activite for insert to authenticated with check (true);
drop policy if exists l_del on activite;
create policy l_del on activite for delete to authenticated
  using ((select private.is_admin()));

drop policy if exists m_ins on messages;
create policy m_ins on messages for insert to anon, authenticated
  with check (length(coalesce(message,''))<2000);
drop policy if exists m_sel on messages;
create policy m_sel on messages for select to authenticated
  using ((select private.is_admin()));
