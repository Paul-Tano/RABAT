"use client"

import { useState } from "react"
import { Heart, Loader2 } from "lucide-react"

interface FavoriteButtonProps {
  movieId: number
  initialIsFavorite: boolean
}

export default function FavoriteButton({
  movieId,
  initialIsFavorite
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)

    try {
      const res = await fetch("/api/favorites", {
        method: isFavorite ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId })
      })

      if (res.ok) {
        setIsFavorite(!isFavorite)
      }
    } catch (error) {
      console.error("Erreur favoris")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition cursor-pointer ${
        isFavorite
          ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
          : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-red-500/30 hover:text-red-400"
      }`}
    >
      {loading
        ? <Loader2 className="w-4 h-4 animate-spin" />
        : <Heart className={`w-4 h-4 ${isFavorite ? "fill-red-400" : ""}`} />
      }
      {isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
    </button>
  )
}