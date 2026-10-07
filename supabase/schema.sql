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


-- CMS public : formations, ateliers, pages et menus administrables
create table if not exists public.site_content(
  id bigint generated by default as identity primary key,
  type text not null default 'custom' check(type in ('formation','atelier','article','service','custom')),
  title text not null,
  slug text not null unique,
  summary text,
  description text,
  image_url text,
  date_text text,
  price_text text,
  location text,
  cta_label text default 'En savoir plus',
  cta_url text,
  published boolean not null default false,
  sort_order integer not null default 100,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.site_pages(
  id bigint generated by default as identity primary key,
  title text not null,
  slug text not null unique,
  content text not null default '',
  published boolean not null default false,
  sort_order integer not null default 100,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.site_menu(
  id bigint generated by default as identity primary key,
  label text not null,
  href text not null,
  menu_type text not null default 'link' check(menu_type in ('link','page','content')),
  visible boolean not null default true,
  sort_order integer not null default 100,
  target text not null default '_self' check(target in ('_self','_blank')),
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.site_content enable row level security;
alter table public.site_pages enable row level security;
alter table public.site_menu enable row level security;
grant select on public.site_content, public.site_pages, public.site_menu to anon, authenticated;
grant insert,update,delete on public.site_content, public.site_pages, public.site_menu to authenticated;
drop policy if exists site_content_public on public.site_content;
create policy site_content_public on public.site_content for select to anon,authenticated using (published or (select private.is_admin()));
drop policy if exists site_content_admin_ins on public.site_content;
create policy site_content_admin_ins on public.site_content for insert to authenticated with check ((select private.is_admin()));
drop policy if exists site_content_admin_upd on public.site_content;
create policy site_content_admin_upd on public.site_content for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
drop policy if exists site_content_admin_del on public.site_content;
create policy site_content_admin_del on public.site_content for delete to authenticated using ((select private.is_admin()));
drop policy if exists site_pages_public on public.site_pages;
create policy site_pages_public on public.site_pages for select to anon,authenticated using (published or (select private.is_admin()));
drop policy if exists site_pages_admin_ins on public.site_pages;
create policy site_pages_admin_ins on public.site_pages for insert to authenticated with check ((select private.is_admin()));
drop policy if exists site_pages_admin_upd on public.site_pages;
create policy site_pages_admin_upd on public.site_pages for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
drop policy if exists site_pages_admin_del on public.site_pages;
create policy site_pages_admin_del on public.site_pages for delete to authenticated using ((select private.is_admin()));
drop policy if exists site_menu_public on public.site_menu;
create policy site_menu_public on public.site_menu for select to anon,authenticated using (visible or (select private.is_admin()));
drop policy if exists site_menu_admin_ins on public.site_menu;
create policy site_menu_admin_ins on public.site_menu for insert to authenticated with check ((select private.is_admin()));
drop policy if exists site_menu_admin_upd on public.site_menu;
create policy site_menu_admin_upd on public.site_menu for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
drop policy if exists site_menu_admin_del on public.site_menu;
create policy site_menu_admin_del on public.site_menu for delete to authenticated using ((select private.is_admin()));
create index if not exists site_content_public_idx on public.site_content(published,sort_order);
create index if not exists site_pages_public_idx on public.site_pages(published,sort_order);
create index if not exists site_menu_public_idx on public.site_menu(visible,sort_order);

-- Extension CMS : programmation, mise en avant, SEO et inscriptions
alter table public.site_content add column if not exists featured boolean not null default false;
alter table public.site_content add column if not exists category text;
alter table public.site_content add column if not exists starts_at timestamptz;
alter table public.site_content add column if not exists ends_at timestamptz;
alter table public.site_content add column if not exists registration_url text;
alter table public.site_content add column if not exists contact_text text;
alter table public.site_content add column if not exists seo_title text;
alter table public.site_content add column if not exists seo_description text;
alter table public.site_content add column if not exists gallery jsonb not null default '[]'::jsonb;
alter table public.site_pages add column if not exists seo_title text;
alter table public.site_pages add column if not exists seo_description text;
alter table public.site_menu add column if not exists icon text;
alter table public.site_menu add column if not exists parent_id bigint references public.site_menu(id) on delete set null;
create index if not exists site_content_published_order_idx on public.site_content (published, sort_order, id);
create index if not exists site_menu_visible_order_idx on public.site_menu (visible, sort_order, id);
create index if not exists site_menu_parent_idx on public.site_menu (parent_id);
