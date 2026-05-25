'use client'
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { Search, Loader2 } from "lucide-react"
import { useState } from "react"
import { TmdbMovie } from "@/types"


export default function CreateMoviePage() {
  const [query, setQuery] = useState("")
  const [tmdbResults, setTmdbResults] = useState<TmdbMovie[]>([])
  const [searching, setSearching] = useState(false)
  const [message, setMessage] = useState("")
  const [addingId, setAddingId] = useState<number | null>(null)



   const handleSearch = async () => {
    if (!query.trim()) return
    setSearching(true)
    setTmdbResults([])
    try {
      const res = await fetch(`/api/tmdb?query=${encodeURIComponent(query)}`)
      const data = await res.json()
      if (!res.ok) {
        setMessage(data.error || "Erreur lors de la recherche")
        return
      }
      if (data.length === 0) {
        setMessage("Film non trouvé")
      }
      setTmdbResults(data)
    } catch (error) {
      setMessage("Erreur lors de la recherche")
    } finally {
      setSearching(false)
    }
  }
  const handleAddMovie = async (movie: TmdbMovie) => {
    setAddingId(movie.tmdbId)
    setMessage("")
    try {
      const res = await fetch("/api/movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(movie)
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage(data.error || "Erreur lors de l'ajout")
        return
      }
      setMessage(`"${movie.title}" ajouté avec succès`)

    } catch (error) {
      setMessage("Erreur lors de l'ajout")
    } finally {
      setAddingId(null)
    }
  }
  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-3">
        <Link
          href="/admin/films"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-orange-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux films
        </Link>
      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
          message.includes("succès")
            ? "bg-green-500/10 text-green-400 border border-green-500/30"
            : "bg-red-500/10 text-red-400 border border-red-500/30"
        }`}>
          {message}
        </div>
      )}
      <div className="space-y-4">
        <h2 className="text-lg font-bold">Rechercher un film sur TMDB</h2>

        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Ex: Inception, Interstellar..."
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
          />
          <button
            onClick={handleSearch}
            disabled={searching}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50 cursor-pointer"
          >
            {searching
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Search className="h-4 w-4" />
            }
            Rechercher
          </button>
        </div>

        {tmdbResults.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {tmdbResults.map((movie) => (
              <div
                key={movie.tmdbId}
                className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden"
              >
                {/* Poster */}
                <div className="aspect-[3/4] bg-zinc-800">
                  {movie.poster ? (
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">
                      Pas d'image
                    </div>
                  )}
                </div>

                <div className="p-3 space-y-2">
                  <p className="text-sm font-semibold text-white line-clamp-1">
                    {movie.title}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {movie.director} • {movie.releaseDate?.slice(0, 4)}
                  </p>

                  <button
                    onClick={() => handleAddMovie(movie)}
                    disabled={addingId === movie.tmdbId}
                    className="w-full flex items-center justify-center gap-1 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-xs font-semibold rounded-lg border border-orange-500/30 transition disabled:opacity-50 cursor-pointer"
                  >
                    {addingId === movie.tmdbId
                      ? <Loader2 className="h-3 w-3 animate-spin" />
                      : <Plus className="h-3 w-3" />
                    }
                    Ajouter
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
