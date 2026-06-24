import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating, setRating, readOnly = false, size = 24 }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        return (
          <button
            type="button"
            key={index}
            className={`${
              readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            } transition-transform duration-200 focus:outline-none`}
            onClick={() => !readOnly && setRating(starValue)}
            onMouseEnter={() => !readOnly && setHover(starValue)}
            onMouseLeave={() => !readOnly && setHover(0)}
            disabled={readOnly}
          >
            <Star
              size={size}
              className={`transition-colors duration-200 ${
                starValue <= (hover || rating)
                  ? 'fill-primary text-primary drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]'
                  : 'fill-transparent text-gray-600'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
