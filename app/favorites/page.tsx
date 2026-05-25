"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Heart, Star, Trash2, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Favorite {
  id: number
  movie: {
    id: number
    title: string
    poster: string
    genre: string
    director: string
    releaseDate: string
    ratings: { score: number }[]
  }
}
export default function FavoritesPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState<number | null>(null)
  const [message, setMessage] = useState("")

  useEffect(() => {
  
    fetchFavorites()
  }, [])
  const fetchFavorites = async () => {
    try {
      const res = await fetch("/api/favorites")
      const data = await res.json()
      setFavorites(data)
    } catch (error) {
      console.error("Erreur lors du chargement des favoris")
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (movieId: number, title: string) => {
    setRemovingId(movieId)
    setMessage("")
    try {
      const res = await fetch("/api/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId })
      })
      if (!res.ok) {
        setMessage("Erreur lors de la suppression")
        return
      }
      setMessage(`"${title}" retiré des favoris`)
      setFavorites(favorites.filter(f => f.movie.id !== movieId))
    } catch (error) {
      setMessage("Erreur serveur")
    } finally {
      setRemovingId(null)
    }
  }
  const getAverageRating = (ratings: { score: number }[]) => {
    if (!ratings || ratings.length === 0) return null
    const sum = ratings.reduce((acc, r) => acc + r.score, 0)
    return (sum / ratings.length).toFixed(1)
  }
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        <div className="space-y-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-orange-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à l'accueil
        </Link>
      </div>
        <div className="flex items-center gap-3">
          <Heart className="w-8 h-8 text-red-500 fill-red-500" />
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Mes Favoris</h1>
            <p className="text-sm text-zinc-400">
              {favorites.length} film{favorites.length > 1 ? "s" : ""} dans vos favoris
            </p>
          </div>
        </div>
        {message && (
          <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
            message.includes("Erreur")
              ? "bg-red-500/10 text-red-400 border border-red-500/30"
              : "bg-green-500/10 text-green-400 border border-green-500/30"
          }`}>
            {message}
          </div>
        )}

        {favorites.length === 0 ? (
          <div className="text-center py-20 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
            <Heart className="w-12 h-12 mx-auto mb-4 text-zinc-700" />
            <p className="text-lg font-semibold">Aucun favori pour le moment</p>
            <p className="text-sm mt-1">Ajoutez des films à vos favoris depuis la page d'accueil</p>
            <Link
              href="/"
              className="inline-block mt-4 px-5 py-2.5 bg-[#E25814] hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition"
            >
              Découvrir des films
            </Link>
          </div>
        ) : (
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {favorites.map((favorite) => (
              
              <div
                key={favorite.id}
                className="group bg-zinc-900/40 border border-zinc-900 rounded-2xl overflow-hidden hover:border-zinc-800 transition-all duration-300 flex flex-col shadow-md"
                >
              <Link href={`/movies/${favorite.movie.id}`} className="flex flex-col h-full">
                <div className="relative aspect-[3/4] w-full bg-zinc-800 overflow-hidden">
                  <img
                    src={favorite.movie.poster || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500"}
                    alt={favorite.movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    onClick={() => handleRemove(favorite.movie.id, favorite.movie.title)}
                    disabled={removingId === favorite.movie.id}
                    className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-red-500/80 rounded-full transition cursor-pointer"
                    title="Retirer des favoris"
                  >
                    {removingId === favorite.movie.id
                      ? <Loader2 className="w-4 h-4 animate-spin text-white" />
                      : <Trash2 className="w-4 h-4 text-white" />
                    }
                  </button>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                          <h3 className="font-bold text-zinc-100 hover:text-red-500 transition-colors line-clamp-1 cursor-pointer">
                            {favorite.movie.title}
                          </h3>
                        <p className="text-xs text-zinc-500 mt-1">
                          {favorite.movie.genre} • {new Date(favorite.movie.releaseDate).getFullYear()}
                        </p>
                        <p className="text-xs italic text-zinc-500 line-clamp-1">
                          Réal : {favorite.movie.director}
                        </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-amber-500 text-xs font-bold pt-2 border-t border-zinc-900">
                        <Star size={14} fill="currentColor" />
                        <span>
                          {getAverageRating(favorite.movie.ratings)
                            ? `${getAverageRating(favorite.movie.ratings)} / 5`
                            : "Pas encore noté"}
                        </span>
                    </div>
                 </div>
              </Link>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}