import { useState } from 'react';
import { FaStar } from 'react-icons/fa';

const StarRating = ({ rating, setRating }) => {
  const [hover, setHover] = useState(null);

  return (
    <div className="flex space-x-1">
      {[...Array(5)].map((star, index) => {
        const ratingValue = index + 1;
        return (
          <label key={index} className="cursor-pointer">
            <input
              type="radio"
              name="rating"
              className="hidden"
              value={ratingValue}
              onClick={() => setRating(ratingValue)}
            />
            <FaStar
              className="transition-colors duration-200"
              color={ratingValue <= (hover || rating) ? '#ffc107' : '#e4e5e9'}
              size={28}
              onMouseEnter={() => setHover(ratingValue)}
              onMouseLeave={() => setHover(null)}
            />
          </label>
        );
      })}
    </div>
  );
};

export default StarRating;
// Force Vite recompile
