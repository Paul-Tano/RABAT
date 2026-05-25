"use client";
type RatingStarsProps = {
  rating: number;
  readonly?: boolean;
  onRate?: (value: number) => void;
};

export default function RatingStars({
  rating,
  readonly = true,
  onRate,
}: RatingStarsProps) {
  const stars = [1, 2, 3, 4, 5];
  const safeRating = Math.max(0, Math.min(5, rating));

  return (
    <div className="flex items-center gap-1">
      {stars.map((star) => {
        const isActive = star <= safeRating;
        const className = isActive ? "text-yellow-400" : "text-gray-300";

        if (readonly) {
          return (
            <span key={star} className={`text-2xl ${className}`}>
              ★
            </span>
          );
        }
        return (
          <button
            key={star}
            type="button"
            onClick={() => onRate?.(star)}
            className={`text-2xl transition hover:text-yellow-500 ${className}`}
            aria-label={`Donner la note ${star} sur 5`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
