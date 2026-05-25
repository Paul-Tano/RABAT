"use client"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { SlidersHorizontal, Star, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import Link from "next/link" 
import FilterModal from "./FilterModal"
import { Movie } from "@/types"

interface MovieGridProps {
  movies: Movie[]
  totalPages: number
  searchQuery?: string
}

export default function MovieGrid({ movies: initialMovies, totalPages: initialTotalPages, searchQuery = "" }: MovieGridProps) {
  const searchParams = useSearchParams()
  const urlSearch = searchParams.get("search") || ""
  const finalSearchQuery = urlSearch || searchQuery
  const [movies, setMovies] = useState<Movie[]>(initialMovies)
  const [totalPages, setTotalPages] = useState(initialTotalPages)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState({
    genre: "",
    year: "",
    director: ""
  })

  useEffect(() => {
    if (currentPage === 1 && !activeFilters.genre && !activeFilters.year && !activeFilters.director) {
      setMovies(initialMovies)
      return
    }
    fetchMovies()
  }, [currentPage])

  const fetchMovies = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/movies?page=${currentPage}&limit=12`)
      const data = await res.json()
      setMovies(data.movies)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error("Erreur")
    } finally {
      setLoading(false)
    }
  }

  const handleApplyFilters = (filters: { genre: string; year: string; director: string }) => {
    setActiveFilters(filters)
    setCurrentPage(1)
  }

  const handleResetFilters = () => {
    setActiveFilters({ genre: "", year: "", director: "" })
    setCurrentPage(1)
  }

  const getAverageRating = (ratings: { score: number }[]) => {
    if (!ratings || ratings.length === 0) return null
    const sum = ratings.reduce((acc, r) => acc + r.score, 0)
    return (sum / ratings.length).toFixed(1)
  }

  // Filtrage côté client
 const filteredMovies = movies.filter((movie) => {
  const year = new Date(movie.releaseDate).getFullYear().toString()
  const matchGenre = activeFilters.genre
    ? movie.genre?.toLowerCase().includes(activeFilters.genre.toLowerCase())
    : true
  const matchYear = activeFilters.year ? year === activeFilters.year : true
  const matchDirector = activeFilters.director
    ? movie.director?.toLowerCase().includes(activeFilters.director.toLowerCase())
    : true
  const matchSearch = finalSearchQuery
    ? movie.title?.toLowerCase().includes(finalSearchQuery.toLowerCase()) ||
      movie.director?.toLowerCase().includes(finalSearchQuery.toLowerCase())
    : true

  return matchGenre && matchYear && matchDirector && matchSearch
})

  return (
    <main className="max-w-7xl mx-auto px-6 mt-12 space-y-8">

      <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {finalSearchQuery ? `Résultats pour "${finalSearchQuery}"` : "Tous les Films"}
          </h2>
          {(activeFilters.genre || activeFilters.year || activeFilters.director || finalSearchQuery) && (
            <div className="flex flex-wrap gap-2 mt-2">
              {finalSearchQuery && (
                <span className="bg-orange-950 text-orange-400 border border-orange-900 px-2 py-0.5 rounded text-xs font-medium">
                 {finalSearchQuery}
                </span>
              )}
              {activeFilters.genre && (
                <span className="bg-red-950 text-red-400 border border-red-900 px-2 py-0.5 rounded text-xs font-medium">
                  {activeFilters.genre}
                </span>
              )}
              {activeFilters.year && (
                <span className="bg-amber-950 text-amber-400 border border-amber-900 px-2 py-0.5 rounded text-xs font-medium">
                  {activeFilters.year}
                </span>
              )}
              {activeFilters.director && (
                <span className="bg-zinc-800 text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded text-xs font-medium">
                  Par: {activeFilters.director}
                </span>
              )}
            </div>
          )}
        </div>
        <button
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-sm font-medium transition-all text-zinc-300 hover:text-white cursor-pointer"
        >
          <SlidersHorizontal size={16} />
          Filtrer
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : filteredMovies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMovies.map((movie) => (
            <Link
              href={`/movies/${movie.id}`}
              key={movie.id}
              className="group bg-zinc-900/40 border border-zinc-900 rounded-2xl overflow-hidden hover:border-zinc-800 transition-all duration-300 flex flex-col shadow-md cursor-pointer block"
            >
              <div className="relative aspect-[3/4] w-full bg-zinc-800 overflow-hidden">
                <img
                  src={movie.poster || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500"}
                  alt={movie.title || "Affiche non disponible"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-zinc-100 group-hover:text-red-500 transition-colors line-clamp-1">
                    {movie.title}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    {movie.genre} • {new Date(movie.releaseDate).getFullYear()}
                  </p>
                  <p className="text-xs italic text-zinc-500 line-clamp-1">
                    Réal : {movie.director}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-amber-500 text-xs font-bold pt-2 border-t border-zinc-900">
                  <Star size={14} fill="currentColor" />
                  <span>
                    {getAverageRating(movie.ratings)
                      ? `${getAverageRating(movie.ratings)} / 5`
                      : "Pas encore noté"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10">
          Aucun film ne correspond à votre recherche.
          <button
            onClick={handleResetFilters}
            className="text-amber-500 hover:underline font-semibold ml-1 cursor-pointer"
          >
            Réinitialiser
          </button>
        </div>
      )}

      {totalPages > 1 && !activeFilters.genre && !activeFilters.year && !activeFilters.director && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setCurrentPage(p => p - 1)}
            disabled={currentPage === 1}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 text-zinc-300 hover:border-orange-500 hover:text-orange-400 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
          >
            <ChevronLeft size={16} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`h-9 w-9 rounded-lg text-sm font-semibold transition cursor-pointer ${
                page === currentPage
                  ? "bg-orange-500 text-white border border-orange-500"
                  : "border border-zinc-700 text-zinc-300 hover:border-orange-500 hover:text-orange-400"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={currentPage === totalPages}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 text-zinc-300 hover:border-orange-500 hover:text-orange-400 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApplyFilters={handleApplyFilters}
      />
    </main>
  )
}