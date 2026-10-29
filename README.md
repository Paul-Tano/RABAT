# 🎬 RABAT

**RABAT** est une application web de critique de films. Les utilisateurs parcourent le catalogue, notent les films, partagent leurs avis et gardent leurs favoris. Les administrateurs alimentent le catalogue à partir de [TMDB](https://www.themoviedb.org/) et gèrent la communauté depuis un tableau de bord.

## ✨ Fonctionnalités

**Utilisateurs**
- Catalogue de films avec recherche et filtres (genre, année de sortie)
- Fiche détaillée : synopsis, réalisateur, genres, bande-annonce et note moyenne
- Notes de 1 à 5 étoiles, commentaires et liste de favoris
- Inscription par e-mail ou connexion avec Google
- Page profil : modification des informations et historique des commentaires

**Administrateurs**
- Tableau de bord avec statistiques
- Ajout de films en un clic grâce à la recherche TMDB (infos, affiche et bande-annonce récupérées automatiquement)
- Gestion des comptes : rôles, suspension, suppression
- Modération des commentaires

## 🛠 Stack technique

- **Framework** : Next.js 16 (App Router), React 19, TypeScript
- **Style** : Tailwind CSS 4, lucide-react
- **Base de données** : PostgreSQL avec Prisma
- **Authentification** : NextAuth (identifiants + Google)
- **Validation** : Zod
- **Données films** : API TMDB

## 🚀 Démarrage

### Prérequis

- Node.js 20+
- Une base de données PostgreSQL
- Un jeton d'accès [TMDB](https://www.themoviedb.org/settings/api)
- _(optionnel)_ Des identifiants OAuth [Google](https://console.cloud.google.com/apis/credentials)

### Installation

```bash
git clone https://github.com/paul-tano/rabat.git
cd rabat
npm install
```

Créez un fichier `.env` à la racine :

```env
DATABASE_URL="postgresql://user:password@localhost:5432/rabat"
DIRECT_URL="postgresql://user:password@localhost:5432/rabat"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="une-chaine-aleatoire"   # openssl rand -base64 32

GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

TMDB_ACCESS_TOKEN=""
```

Initialisez la base puis lancez le serveur :

```bash
npx prisma db push
npm run dev
```

L'application est disponible sur [http://localhost:3000](http://localhost:3000).

### Créer le premier administrateur

Les comptes créés à l'inscription ont le rôle `USER`. Inscrivez-vous, puis passez votre rôle à `ADMIN` avec `npx prisma studio`. Les administrateurs suivants pourront être créés depuis l'interface.

## 📜 Scripts

| Commande | Description |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run dev:wsl` | Serveur de développement sans Turbopack (WSL) |
| `npm run build` | Build de production |
| `npm run start` | Lance le build de production |
| `npm run lint` | Analyse du code avec ESLint |

## 📁 Structure

```
app/
├── api/          # Routes API (films, notes, commentaires, favoris, utilisateurs…)
├── admin/        # Espace administrateur
├── components/   # Composants réutilisables
├── movies/[id]/  # Fiche film
├── favorites/    # Favoris
├── profile/      # Profil utilisateur
└── auth/         # Connexion et inscription
lib/              # Configuration NextAuth et Prisma
prisma/           # Schéma de la base de données
proxy.ts          # Protection des routes
```

## ☁️ Déploiement

Le projet se déploie facilement sur [Vercel](https://vercel.com) : importez le dépôt, renseignez les variables d'environnement (avec `NEXTAUTH_URL` égal à l'URL de production) et ajoutez `https://<votre-domaine>/api/auth/callback/google` aux URI de redirection Google.

---

Données de films fournies par [The Movie Database (TMDB)](https://www.themoviedb.org/).
