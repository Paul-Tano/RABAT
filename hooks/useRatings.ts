"use client";
import { useState } from "react";

type SubmitRatingParams = {
  filmId: number;
  score: number;
};

export function useRatings() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitRating({ filmId, score }: SubmitRatingParams) {
    try {
      setLoading(true);
      setError(null);

      if (score < 1 || score > 5) {
        throw new Error("La note doit etre entre 1 et 5");
      }

      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ movieId: filmId, score }),
      });

      if (!response.ok) {
        throw new Error("Impossible d'envoyer la note");
      }

      return await response.json();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Une erreur est survenue";

      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function getStats() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/stats");

      if (!response.ok) {
        throw new Error("Impossible de recuperer les statistiques");
      }

      return await response.json();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Une erreur est survenue";

      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }

  return {
    submitRating,
    getStats,
    loading,
    error,
  };
}
