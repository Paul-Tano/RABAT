"use client"
import { useEffect, useState } from "react"

type Favorite = {
  id: number
  movieId: number
  movie: {
    id: number
    title: string
    poster: string
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function addFavorite(filmId: number) {
    try {
      setError(null)

      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId: filmId })
      })

      if (!response.ok) {
        throw new Error("Impossible d'ajouter le favori")
      }

      const newFavorite = await response.json()

      setFavorites((current) => {
        if (current.some((f) => f.movieId === filmId)) return current
        return [...current, newFavorite]
      })

    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    }
  }

  async function removeFavorite(filmId: number) {
    try {
      setError(null)

      const response = await fetch("/api/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId: filmId }) 
      })

      if (!response.ok) {
        throw new Error("Impossible de retirer le favori")
      }
      setFavorites((current) =>
        current.filter((f) => f.movieId !== filmId)
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    }
  }
  function isFavorite(filmId: number) {
    return favorites.some((f) => f.movieId === filmId)
  }

  useEffect(() => {
    let shouldUpdate = true

    async function loadFavorites() {
      try {
        const response = await fetch("/api/favorites")

        if (!response.ok) {
          throw new Error("Impossible de récupérer les favoris")
        }

        const data = await response.json()

        if (shouldUpdate) {
          setFavorites(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        if (shouldUpdate) {
          setError(err instanceof Error ? err.message : "Une erreur est survenue")
        }
      } finally {
        if (shouldUpdate) setLoading(false)
      }
    }
    loadFavorites()
    return () => { shouldUpdate = false }
  }, [])

  return { favorites, loading, error, addFavorite, removeFavorite, isFavorite }
}