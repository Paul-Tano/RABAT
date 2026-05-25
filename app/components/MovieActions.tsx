"use client"
import { useState } from "react"
import RatingStars from "./RatingStars"
import FavoriteButton from "./FavoriteButton"
import { useRatings } from "@/hooks/useRatings"
import { Loader2 } from "lucide-react"

interface MovieActionsProps {
  movieId: number
  initialRating: number
  userRating: number | null
  initialIsFavorite: boolean
  isConnected: boolean
}

export default function MovieActions({movieId, initialRating, userRating, initialIsFavorite, isConnected }: MovieActionsProps) {
  const { submitRating, loading } = useRatings()
  const [currentRating, setCurrentRating] = useState(initialRating)
  const [myRating, setMyRating] = useState(userRating || 0)
  const [ratingMessage, setRatingMessage] = useState("")

  const handleRate = async (score: number) => {
    if (!isConnected) {
      setRatingMessage("Connectez-vous pour noter ce film")
      return
    }
    const result = await submitRating({ filmId: movieId, score })
    if (result) {
      setMyRating(score)
      setCurrentRating(result.averageRating)
      setRatingMessage("Note enregistrée ✓")
      setTimeout(() => setRatingMessage(""), 3000)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-5 space-y-3">
        <h3 className="font-bold text-sm text-zinc-400 uppercase tracking-wider">
          Note moyenne
        </h3>
        <div className="flex items-center gap-3">
          <RatingStars rating={currentRating} readonly={true} />
          <span className="text-zinc-300 text-sm font-semibold">
            {currentRating > 0 ? `${currentRating}/5` : "Pas encore noté"}
          </span>
        </div>
      </div>
      <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-5 space-y-3">
        <h3 className="font-bold text-sm text-zinc-400 uppercase tracking-wider">
          {myRating > 0 ? "Votre note" : "Noter ce film"}
        </h3>
        {isConnected ? (
          <>
            <RatingStars
              rating={myRating}
              readonly={false}
              onRate={handleRate}
            />
            {loading && (
              <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
            )}
            {ratingMessage && (
              <p className="text-xs text-green-400">{ratingMessage}</p>
            )}
          </>
        ) : (
          <p className="text-xs text-zinc-500">
            Connectez-vous pour noter ce film
          </p>
        )}
      </div>
      {isConnected && (
        <FavoriteButton
          movieId={movieId}
          initialIsFavorite={initialIsFavorite}
        />
      )}

    </div>
  )
}