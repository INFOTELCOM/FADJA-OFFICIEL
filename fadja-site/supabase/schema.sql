-- FADJA : à exécuter dans Supabase > SQL Editor (projet neuf)
create table profiles(id uuid primary key references auth.users on delete cascade, name text, structure text, role text, level text not null default 'Accueil' check (level in ('Administrateur','Formateur','Accueil')), created_at timestamptz default now());
create table inscrits(id bigint primary key, data jsonb not null, created_by uuid default auth.uid(), updated_at timestamptz default now());
create table annonces(id bigint primary key, data jsonb not null, created_by uuid default auth.uid(), updated_at timestamptz default now());
create table activite(id bigint primary key, data jsonb not null, created_by uuid default auth.uid(), updated_at timestamptz default now());
create table messages(id bigint generated always as identity primary key, name text, phone text, formation text, message text, created_at timestamptz default now());
alter table profiles enable row level security; alter table inscrits enable row level security; alter table annonces enable row level security; alter table activite enable row level security; alter table messages enable row level security;
create function my_level() returns text language sql security definer set search_path=public stable as $$ select level from profiles where id=auth.uid() $$;
create function is_admin() returns boolean language sql security definer set search_path=public stable as $$ select coalesce(my_level()='Administrateur',false) $$;
-- Le premier compte créé devient Administrateur, les suivants « Accueil »
create function handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$ begin insert into profiles(id,name,structure,role,level) values(new.id,new.raw_user_meta_data->>'name',new.raw_user_meta_data->>'structure',new.raw_user_meta_data->>'role',case when exists(select 1 from profiles) then 'Accueil' else 'Administrateur' end); return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();
-- Profils : chacun voit le sien, l'admin voit et modifie tout
create policy p_sel on profiles for select to authenticated using (id=auth.uid() or is_admin());
create policy p_upd on profiles for update to authenticated using (is_admin());
-- Inscrits : lecture pour tous les comptes ; écriture Administrateur ou Accueil ; suppression Administrateur
create policy i_sel on inscrits for select to authenticated using (true);
create policy i_ins on inscrits for insert to authenticated with check (my_level() in ('Administrateur','Accueil'));
create policy i_upd on inscrits for update to authenticated using (my_level() in ('Administrateur','Accueil'));
create policy i_del on inscrits for delete to authenticated using (is_admin());
-- Annonces : tout compte publie ; modification/suppression par l'auteur ou l'admin
create policy a_sel on annonces for select to authenticated using (true);
create policy a_ins on annonces for insert to authenticated with check (true);
create policy a_upd on annonces for update to authenticated using (created_by=auth.uid() or is_admin());
create policy a_del on annonces for delete to authenticated using (created_by=auth.uid() or is_admin());
-- Activité : journal en ajout seul, suppression admin
create policy l_sel on activite for select to authenticated using (true);
create policy l_ins on activite for insert to authenticated with check (true);
create policy l_del on activite for delete to authenticated using (is_admin());
-- Messages du formulaire : envoi public, lecture admin
create policy m_ins on messages for insert to anon, authenticated with check (length(message)<2000);
create policy m_sel on messages for select to authenticated using (is_admin());
