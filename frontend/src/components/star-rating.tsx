"use client";
import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
  rating: number;
  setRating: (rating: number) => void;
  label?: string;
}

export default function StarRating({
  rating,
  setRating,
  label,
}: StarRatingProps) {
  const [hover, setHover] = useState(0);

  return (
    <div className="space-y-2">
      {label && (
        <p className="text-xs font-bold text-slate-500 uppercase">{label}</p>
      )}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              className={`h-6 w-6 ${
                star <= (hover || rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-slate-300"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
