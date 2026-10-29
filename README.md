# 🎬 RABAT

**RABAT** est une application web de critique de films : les utilisateurs parcourent un catalogue, notent les films, rédigent des commentaires et gèrent leurs favoris. Les administrateurs alimentent le catalogue depuis [TMDB](https://www.themoviedb.org/) et gèrent les comptes depuis un tableau de bord.

> _« Note tes films et partage tes critiques »_

---

## Sommaire

- [Fonctionnalités](#-fonctionnalités)
- [Stack technique](#-stack-technique)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Variables d'environnement](#-variables-denvironnement)
- [Scripts](#-scripts)
- [Structure du projet](#-structure-du-projet)
- [Modèle de données](#-modèle-de-données)
- [API](#-api)
- [Authentification et rôles](#-authentification-et-rôles)
- [Déploiement](#-déploiement)

---

## ✨ Fonctionnalités

### Pour les visiteurs
- Catalogue de films paginé, avec mise en avant du dernier film ajouté (affiche, synopsis, bande-annonce)
- Recherche et filtres (genre, année de sortie)
- Fiche détaillée de chaque film : réalisateur, genre, date de sortie, bande-annonce YouTube, note moyenne et commentaires

### Pour les utilisateurs connectés
- Inscription par e-mail / mot de passe ou connexion avec **Google**
- Notation des films de 1 à 5 étoiles (une note par film, modifiable)
- Commentaires (suppression de ses propres commentaires)
- Liste de **favoris**
- Page **profil** : modification du nom d'utilisateur, de l'e-mail et du mot de passe, historique des commentaires

### Pour les administrateurs
- Tableau de bord avec statistiques (utilisateurs, admins, films, notes, commentaires, dernières notes)
- Ajout de films via une recherche **TMDB** (titre, synopsis, affiche, réalisateur, genres et bande-annonce récupérés automatiquement, en français)
- Suppression de films
- Gestion des comptes : création, modification du rôle, suspension / réactivation, suppression
- Modération des commentaires

---

## 🛠 Stack technique

| Domaine | Outil |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router) + React 19 |
| Langage | TypeScript |
| Style | Tailwind CSS 4, icônes [lucide-react](https://lucide.dev) |
| Base de données | PostgreSQL |
| ORM | [Prisma 5](https://www.prisma.io) |
| Authentification | [NextAuth.js v4](https://next-auth.js.org) (Credentials + Google, sessions JWT) |
| Validation | [Zod](https://zod.dev) |
| Hachage des mots de passe | bcryptjs |
| Données films | API [TMDB](https://developer.themoviedb.org/) |

---

## 📋 Prérequis

- **Node.js** 20 ou plus récent
- **npm**
- Une base **PostgreSQL** (locale, Docker, ou hébergée : Supabase, Neon…)
- Un **jeton d'accès en lecture TMDB** (API Read Access Token) — [créer un compte développeur](https://www.themoviedb.org/settings/api)
- _(Optionnel)_ Des identifiants **OAuth Google** pour la connexion Google — [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

---

## 🚀 Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/paul-tano/rabat.git
cd rabat

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
#    (voir la section suivante)
touch .env

# 4. Créer les tables dans la base de données
npx prisma db push

# 5. Lancer le serveur de développement
npm run dev
```

L'application est disponible sur [http://localhost:3000](http://localhost:3000).

> 💡 Sous **WSL**, si Turbopack pose problème, utilisez `npm run dev:wsl`.

### Créer le premier administrateur

Les comptes créés via l'inscription ont le rôle `USER`. Pour obtenir un premier compte administrateur, inscrivez-vous puis passez votre rôle à `ADMIN` directement en base, par exemple avec Prisma Studio :

```bash
npx prisma studio
```

ou en SQL :

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'vous@exemple.com';
```

Reconnectez-vous ensuite : l'accès à `/admin` est débloqué. Les administrateurs suivants peuvent être créés depuis l'interface.

---

## 🔐 Variables d'environnement

Créez un fichier `.env` à la racine du projet (il est ignoré par git) :

```env
# Base de données PostgreSQL
# URL utilisée par l'application (peut passer par un pooler de connexions)
DATABASE_URL="postgresql://user:password@localhost:5432/rabat"
# URL directe utilisée par Prisma pour les migrations / db push
# (identique à DATABASE_URL si vous n'utilisez pas de pooler)
DIRECT_URL="postgresql://user:password@localhost:5432/rabat"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="une-chaine-aleatoire-longue"   # openssl rand -base64 32

# Google OAuth
GOOGLE_CLIENT_ID="xxxxxxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="xxxxxxxx"

# TMDB (API Read Access Token, v4)
TMDB_ACCESS_TOKEN="eyJhbGciOi..."
```

| Variable | Rôle |
| --- | --- |
| `DATABASE_URL` | Connexion PostgreSQL utilisée à l'exécution |
| `DIRECT_URL` | Connexion directe pour Prisma (schéma, migrations) |
| `NEXTAUTH_URL` | URL publique de l'application |
| `NEXTAUTH_SECRET` | Clé de signature des JWT de session |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Connexion avec Google. URI de redirection à déclarer : `<NEXTAUTH_URL>/api/auth/callback/google` |
| `TMDB_ACCESS_TOKEN` | Recherche de films lors de l'ajout au catalogue |

---

## 📜 Scripts

| Commande | Description |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run dev:wsl` | Serveur de développement sans Turbopack (utile sous WSL) |
| `npm run build` | Génère le client Prisma puis compile l'application |
| `npm run start` | Lance la version compilée |
| `npm run lint` | Analyse le code avec ESLint |

Commandes Prisma utiles :

```bash
npx prisma db push      # synchronise le schéma avec la base
npx prisma generate     # régénère le client Prisma
npx prisma studio       # interface graphique pour explorer la base
```

---

## 📁 Structure du projet

```
.
├── app/
│   ├── page.tsx                # Accueil : film mis en avant + catalogue
│   ├── layout.tsx / providers.tsx
│   ├── movies/[id]/            # Fiche d'un film
│   ├── favorites/              # Favoris de l'utilisateur
│   ├── profile/                # Profil et historique
│   ├── auth/login, register/   # Connexion et inscription
│   ├── admin/                  # Back-office (statistiques, films, comptes)
│   ├── components/             # Navbar, MovieGrid, RatingStars, CommentSection…
│   └── api/                    # Routes API (voir plus bas)
├── hooks/                      # useFavorites, useRatings
├── lib/
│   ├── auth.ts                 # Configuration NextAuth
│   └── prisma.ts               # Client Prisma partagé
├── prisma/schema.prisma        # Schéma de la base de données
├── types/                      # Types partagés et extension des types NextAuth
└── proxy.ts                    # Protection des routes (ex-middleware Next.js)
```

---

## 🗄 Modèle de données

```
User ─┬─< Rating   >─┐
      ├─< Comment  >─┼── Movie
      ├─< Favorite >─┘
      ├─< Account   (NextAuth)
      └─< Session   (NextAuth)
```

- **User** : e-mail, nom d'utilisateur, mot de passe haché (absent pour les comptes Google), rôle `USER` / `ADMIN`, statut actif / suspendu
- **Movie** : identifiant TMDB unique, titre, synopsis, affiche, réalisateur, genre(s), date de sortie, bande-annonce
- **Rating** : note de 1 à 5, unique par couple utilisateur / film
- **Comment** : texte libre lié à un utilisateur et un film
- **Favorite** : unique par couple utilisateur / film

La suppression d'un utilisateur ou d'un film supprime en cascade ses notes, commentaires et favoris.

---

## 🔌 API

Toutes les routes sont sous `/api`. 🔓 public · 👤 connecté · 🛡 administrateur.

| Méthode | Route | Accès | Description |
| --- | --- | --- | --- |
| `POST` | `/register` | 🔓 | Inscription |
| `*` | `/auth/[...nextauth]` | 🔓 | Endpoints NextAuth |
| `GET` | `/movies?page=&limit=` | 🔓 | Liste paginée des films |
| `POST` | `/movies` | 🛡 | Ajout d'un film |
| `GET` | `/movies/[id]` | 🔓 | Détail d'un film |
| `DELETE` | `/movies/[id]` | 🛡 | Suppression d'un film |
| `GET` | `/tmdb?query=` | 🛡 | Recherche de films sur TMDB |
| `POST` | `/ratings` | 👤 | Noter un film (crée ou met à jour) |
| `POST` | `/comments` | 👤 | Publier un commentaire |
| `GET` | `/comments/[id]` | 👤 | Détail d'un commentaire |
| `DELETE` | `/comments/[id]` | 👤 | Supprimer un commentaire (auteur ou admin) |
| `GET` | `/comments/user` | 👤 | Commentaires de l'utilisateur connecté |
| `GET` / `POST` / `DELETE` | `/favorites` | 👤 | Lister, ajouter, retirer un favori |
| `GET` / `PUT` | `/users/me` | 👤 | Lire / modifier son profil |
| `GET` | `/users` | 🛡 | Liste des utilisateurs |
| `GET` / `PUT` / `DELETE` | `/users/[id]` | 🛡 | Gérer un compte |
| `GET` | `/stats` | 🛡 | Statistiques du tableau de bord |

Les corps de requête sont validés avec Zod ; les erreurs sont renvoyées au format `{ "error": "message" }`.

---

## 🛡 Authentification et rôles

- **Connexion** par e-mail / mot de passe (haché avec bcrypt) ou par **Google**. Un compte Google dont l'e-mail existe déjà est rattaché au compte existant ; sinon un compte est créé avec un nom d'utilisateur dérivé du nom Google.
- Les sessions sont des **JWT**. Le rôle est relu en base à chaque requête de session : un changement de rôle ou une suspension prend effet immédiatement.
- Un compte **suspendu** ne peut plus se connecter.
- [`proxy.ts`](./proxy.ts) protège `/admin`, `/profile` et les routes API sensibles : un visiteur non connecté est redirigé vers `/auth/login`, et un non-administrateur est renvoyé vers l'accueil s'il tente d'accéder à `/admin`. Chaque route API revérifie aussi les droits côté serveur.

---

## ☁️ Déploiement

L'application est prête à être déployée sur [Vercel](https://vercel.com) :

1. Importez le dépôt dans Vercel.
2. Renseignez toutes les [variables d'environnement](#-variables-denvironnement), avec `NEXTAUTH_URL` égal à l'URL de production.
3. Ajoutez `https://<votre-domaine>/api/auth/callback/google` aux URI de redirection autorisées dans la console Google.
4. Initialisez le schéma sur la base de production avec `npx prisma db push`.

La commande de build (`prisma generate && next build`) génère automatiquement le client Prisma.

Avec une base hébergée derrière un pooler (Supabase, Neon…), utilisez l'URL du pooler pour `DATABASE_URL` et l'URL directe pour `DIRECT_URL`.

---

## 🙏 Crédits

Les données et affiches de films proviennent de [The Movie Database (TMDB)](https://www.themoviedb.org/). Ce produit utilise l'API TMDB mais n'est ni approuvé ni certifié par TMDB.
