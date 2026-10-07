# FADJA – Site + application membres (prêt à déployer)

## Contenu
- `index.html` : site + application (images incluses, carte Google Maps intégrée)
- `config.js` : à remplir avec les clés Supabase
- `manifest.webmanifest`, `sw.js`, `icons/` : installation comme application (PWA)
- `supabase/schema.sql` : tables et règles de sécurité
- `netlify.toml` : configuration d'hébergement

## 1. Comptes sécurisés et données partagées (Supabase)
1. Créez un projet neuf sur supabase.com.
2. SQL Editor : exécutez `supabase/schema.sql`.
3. Project Settings > API : copiez « Project URL » et la clé « anon public » dans `config.js`.
4. Le premier compte créé devient Administrateur ; les suivants sont « Accueil ». L'administrateur change les niveaux dans l'onglet « Équipe » de l'application.
5. Authentication > Providers > Email : choisissez si la confirmation par e-mail est exigée.
Sans `config.js` rempli, le site fonctionne en mode local (démonstration).

## 2. Droits appliqués par la base (et pas seulement par l'interface)
- Inscrits : lecture pour tous les comptes ; ajout et modification pour Administrateur et Accueil ; suppression pour Administrateur.
- Annonces : tout compte publie ; l'auteur ou l'Administrateur modifie et supprime.
- Journal d'activité : ajout seul ; suppression par l'Administrateur.
- Messages du formulaire : envoi public ; lecture par l'Administrateur.
- Un utilisateur ne peut pas changer son propre niveau.
Chaque ligne est enregistrée séparément : deux personnes peuvent travailler en même temps sans écraser leurs données.

## 3. Hébergement et domaine
1. Netlify : glissez ce dossier sur app.netlify.com/drop (ou connectez GitHub).
2. Domain management > Add a domain (ex. fadja.cd) ; HTTPS automatique.
3. En HTTPS, « Installer l'app » installe FADJA sur mobile et ordinateur.

## 4. Points à surveiller
- Dates et tarifs viennent des affiches : vérifiez avant publication.
- La clé « anon » est publique par conception ; la sécurité repose sur les règles ci-dessus : ne les désactivez pas.
- Le formulaire public peut recevoir du spam : surveillez la table `messages`.

## 5. Publication via GitHub (dépôt INFOTELCOM/FADJA-OFFICIEL)
1. Envoyez tous les fichiers de ce dossier à la racine du dépôt (y compris `.github/workflows/pages.yml`).
2. Dépôt > Settings > Pages > Source : « GitHub Actions ».
3. Chaque envoi sur `main` republie le site à l'adresse https://infotelcom.github.io/FADJA-OFFICIEL/ (ou sur votre domaine personnalisé).
