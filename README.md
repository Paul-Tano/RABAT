# 🎬 RABAT

Application web de critique de films : parcourez le catalogue, notez les films, commentez-les et gardez vos favoris. Les administrateurs ajoutent les films depuis [TMDB](https://www.themoviedb.org/) et gèrent les comptes.

## Fonctionnalités

- Catalogue avec recherche et filtres (genre, année)
- Fiche film : synopsis, réalisateur, bande-annonce, note moyenne
- Notes de 1 à 5, commentaires et favoris
- Connexion par e-mail ou Google
- Espace admin : statistiques, ajout de films via TMDB, gestion et suspension des comptes

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS · Prisma · PostgreSQL · NextAuth

## Installation

```bash
git clone https://github.com/paul-tano/rabat.git
cd rabat
npm install
npx prisma db push
npm run dev
```

L'application tourne sur [http://localhost:3000](http://localhost:3000).

### Variables d'environnement

À mettre dans un fichier `.env` à la racine :

```env
DATABASE_URL="postgresql://user:password@localhost:5432/rabat"
DIRECT_URL="postgresql://user:password@localhost:5432/rabat"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="une-chaine-aleatoire"

GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

TMDB_ACCESS_TOKEN=""
```

### Premier administrateur

Les nouveaux comptes ont le rôle `USER`. Pour le premier admin, inscrivez-vous puis changez votre rôle en `ADMIN` avec `npx prisma studio`.

## Scripts

| Commande | Description |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run dev:wsl` | Idem, sans Turbopack (WSL) |
| `npm run build` | Build de production |
| `npm run start` | Lance le build |
| `npm run lint` | ESLint |

---

Données de films fournies par [TMDB](https://www.themoviedb.org/).
