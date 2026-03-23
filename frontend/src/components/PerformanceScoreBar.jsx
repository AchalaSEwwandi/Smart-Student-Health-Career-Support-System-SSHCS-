/**
 * PerformanceScoreBar — progress bar colored by score threshold.
 * Green (>80) | Yellow (>60) | Red (<60)
 * @param {number} score - 0 to 100
 * @param {boolean} showLabel - show numeric label
 */
const PerformanceScoreBar = ({ score = 0, showLabel = true }) => {
  const pct = Math.min(Math.max(score, 0), 100);

  let barColor = 'bg-red-500';
  let textColor = 'text-red-600';
  let label = 'Needs Improvement';

  if (pct > 80) {
    barColor = 'bg-emerald-500';
    textColor = 'text-emerald-600';
    label = 'Excellent';
  } else if (pct > 60) {
    barColor = 'bg-yellow-400';
    textColor = 'text-yellow-600';
    label = 'Good';
  }

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500">Performance Score</span>
          <span className={`text-xs font-bold ${textColor}`}>{pct.toFixed(0)} / 100</span>
        </div>
      )}
      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <p className={`text-xs font-medium mt-1 ${textColor}`}>{label}</p>
      )}
    </div>
  );
};

export default PerformanceScoreBar;
