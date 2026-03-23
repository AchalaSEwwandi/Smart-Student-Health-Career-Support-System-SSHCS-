/**
 * RatingBreakdownBar — visual 5★ to 1★ breakdown progress bars.
 * @param {{ 1: number, 2: number, 3: number, 4: number, 5: number }} breakdown - counts per star level
 * @param {number} totalReviews
 */
const RatingBreakdownBar = ({ breakdown = {}, totalReviews = 0 }) => {
  const stars = [5, 4, 3, 2, 1];

  return (
    <div className="space-y-2">
      {stars.map((star) => {
        const count = breakdown[star] || 0;
        const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;

        return (
          <div key={star} className="flex items-center gap-3">
            <div className="flex items-center gap-1 w-20 shrink-0">
              {'⭐'.repeat(star)}
            </div>
            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 w-10 text-right">{pct}%</span>
          </div>
        );
      })}
    </div>
  );
};

export default RatingBreakdownBar;
