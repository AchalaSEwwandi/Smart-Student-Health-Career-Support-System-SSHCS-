import { useState } from 'react';

/**
 * Interactive star rating component.
 * @param {number} value - current rating (1-5)
 * @param {function} onChange - callback when rating changes
 * @param {boolean} readOnly - if true, stars are not clickable
 * @param {number} size - text size in px (default 28)
 */
const StarRating = ({ value = 0, onChange, readOnly = false, size = 28 }) => {
  const [hovered, setHovered] = useState(0);

  const display = hovered || value;

  return (
    <div className="flex gap-1" aria-label={`Rating: ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && onChange?.(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          className={`transition-transform ${!readOnly ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
          style={{ fontSize: size, lineHeight: 1, background: 'none', border: 'none', padding: 0 }}
          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
        >
          {star <= display ? '⭐' : '☆'}
        </button>
      ))}
    </div>
  );
};

export default StarRating;
