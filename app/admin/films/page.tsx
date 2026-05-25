"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react"
import { Movie} from '@/types'


export default function AdminMoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deletingId, setDeletingId] = useState<number | null>(null)

const handleDelete = async (id: number) => {
  if (!confirm("Supprimer ce film ?")) return
  setDeletingId(id)
  try {
    const res = await fetch(`/api/movies/${id}`, { method: "DELETE" })
    if (!res.ok) throw new Error()
    setMovies(movies.filter(m => m.id !== id))
  } catch {
    setError("Erreur lors de la suppression")
  } finally {
    setDeletingId(null)
  }
}
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/movies?page=${page}&limit=10`)
        
        if (!res.ok) {
          throw new Error(`Erreur HTTP ${res.status}`)
        }
        
        const data = await res.json()
        if (data.movies && Array.isArray(data.movies)) {
          setMovies(data.movies)
          setTotalPages(data.totalPages || 1)
        } else {
          console.error("Format inattendu:", data)
          setMovies([])
        }
      } catch (error) {
        console.error("Erreur:", error)
        setError("Impossible de charger les films")
        setMovies([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchMovies()
  }, [page])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <p className="text-sm text-zinc-500">Chargement des films...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-400">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
        >
     Réessayer
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Films</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Gérez votre catalogue de films
          </p>
        </div>
        <Link
          href="/admin/films/create"
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter un film
        </Link>
      </div>

      <div className="bg-[#151518] border border-zinc-800/60 rounded-2xl overflow-hidden">
        {movies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-500">Aucun film trouvé</p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-zinc-900/50 border-b border-zinc-800/60">
                <tr>
                  <th className="text-left px-5 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Affiche
                  </th>
                  <th className="text-left px-5 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Titre
                  </th>
                  <th className="text-left px-5 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Réalisateur
                  </th>
                  <th className="text-left px-5 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Genre
                  </th>
                  <th className="text-left px-5 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-right px-5 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {movies.map((movie) => (
                  <tr key={movie.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <img 
                        src={movie.poster} 
                        alt={movie.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                    </td>
                    <td className="px-5 py-4 font-medium text-zinc-200">
                      {movie.title}
                    </td>
                    <td className="px-5 py-4 text-zinc-400">
                      {movie.director}
                    </td>
                    <td className="px-5 py-4 text-zinc-400">
                      {movie.genre}
                    </td>
                    <td className="px-5 py-4 text-zinc-400">
                      {new Date(movie.releaseDate).getFullYear()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleDelete(movie.id)}
                          disabled={deletingId === movie.id}
                          className="p-1 text-zinc-400 hover:text-red-500 transition-colors disabled:opacity-50"
                        >
                          {deletingId === movie.id
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Trash2 className="w-4 h-4" />
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 p-4 border-t border-zinc-800/60">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-700 transition-colors"
                >
                  Précédent
                </button>
                <span className="px-3 py-1 text-zinc-400">
                  Page {page} sur {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-700 transition-colors"
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}