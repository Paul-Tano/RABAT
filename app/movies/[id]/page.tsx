import { notFound } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { Calendar, Film, User, Tv, ArrowLeft } from "lucide-react"
import Navbar from "@/app/components/Navbar"
import CommentSection from "@/app/components/commentSection"
import MovieActions from "@/app/components/MovieActions"
import Link from "next/link"

interface MoviePageProps {
  params: Promise<{ id: string }>
}

export default async function MovieDetailPage({ params }: MoviePageProps) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  const movieId = parseInt(id, 10)
  if (isNaN(movieId)) return notFound()

  const movie = await prisma.movie.findUnique({
    where: { id: movieId },
    include: {
      ratings: true,
      favorites: true
    }
  })
  if (!movie) return notFound()
  // Calculer la moyenne des notes
  const averageRating = movie.ratings.length > 0
    ? parseFloat(
        (movie.ratings.reduce((acc, r) => acc + r.score, 0) / movie.ratings.length)
        .toFixed(1)
      )
    : 0
  const userRating = session
    ? movie.ratings.find(r => r.userId === parseInt(session.user.id))?.score ?? null
    : null

  const isFavorite = session
    ? movie.favorites.some(f => f.userId === parseInt(session.user.id))
    : false

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-red-600">
      <Navbar session={session} />
      <section className="relative h-[55vh] w-full overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img
            src={movie.poster || "/placeholder-bg.jpg"}
            alt={movie.title || "Background"}
            className="w-full h-full object-cover object-center opacity-25 blur-[3px] scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-transparent to-zinc-950" />
        </div>
        <div className="absolute bottom-0 left-0 z-10 px-6 md:px-12 pb-8 w-full max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight drop-shadow-lg">
            {movie.title}
          </h1>
        </div>
        
      </section>
      <div className="px-6 md:px-12 py-5 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-orange-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à l'accueil
        </Link>
      </div>
      <main className="px-6 md:px-12 py-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="md:col-span-1 space-y-4 flex flex-col items-center md:items-stretch">
          <div className="w-full max-w-[260px] md:max-w-none aspect-[2/3] rounded-2xl overflow-hidden border border-zinc-900 shadow-2xl bg-zinc-900/50">
            <img
              src={movie.poster || "/placeholder-poster.jpg"}
              alt={`Affiche de ${movie.title}`}
              className="w-full h-full object-cover"
            />
          </div>
          {movie.trailer && movie.trailer.trim() !== "" && (
          <a href={movie.trailer}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full max-w-[260px] md:max-w-none inline-flex items-center justify-center gap-2 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 border border-zinc-900 font-semibold py-3 px-4 rounded-xl transition-all text-sm"
          >
            <Tv size={16} className="text-red-500" />
            Regarder la bande-annonce
          </a>
        )}
          <div className="w-full max-w-[260px] md:max-w-none">
            <MovieActions
              movieId={movie.id}
              initialRating={averageRating}
              userRating={userRating}
              initialIsFavorite={isFavorite}
              isConnected={!!session}
            />
          </div>

        </div>
        <div className="md:col-span-2 space-y-8">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold border-b border-zinc-900 pb-2">
              Synopsis
            </h2>
            <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
              {movie.description || "Aucun synopsis disponible pour ce film."}
            </p>
          </div>
          <div className="bg-zinc-900/30 border border-zinc-950 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-base text-zinc-400 uppercase tracking-wider border-b border-zinc-900/60 pb-2">
              Détails techniques
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-center gap-3 text-sm">
                <User size={18} className="text-red-500 shrink-0" />
                <div>
                  <span className="block text-xs text-zinc-500">Réalisateur</span>
                  <span className="text-zinc-200 font-semibold">
                    {movie.director || "Inconnu"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Film size={18} className="text-red-500 shrink-0" />
                <div>
                  <span className="block text-xs text-zinc-500">Genre</span>
                  <span className="text-zinc-200 font-semibold">
                    {movie.genre || "Non spécifié"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar size={18} className="text-red-500 shrink-0" />
                <div>
                  <span className="block text-xs text-zinc-500">Année de sortie</span>
                  <span className="text-zinc-200 font-semibold">
                    {movie.releaseDate
                      ? new Date(movie.releaseDate).getFullYear()
                      : "Non renseignée"}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
      <section className="px-6 md:px-12 pb-24 mt-4">
        <CommentSection movieId={movie.id} session={session} />
      </section>

    </div>
  )
}