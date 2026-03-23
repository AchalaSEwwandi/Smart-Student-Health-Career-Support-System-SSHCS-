/**
 * SentimentBadge — displays colored emoji badge for sentiment label.
 * @param {string} label - "positive" | "neutral" | "negative"
 */
const SentimentBadge = ({ label }) => {
  const config = {
    positive: { emoji: '🟢', text: 'Positive', classes: 'bg-green-50 text-green-700 border-green-200' },
    neutral:  { emoji: '🟡', text: 'Neutral',  classes: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    negative: { emoji: '🔴', text: 'Negative', classes: 'bg-red-50 text-red-700 border-red-200' },
  };

  const { emoji, text, classes } = config[label] || config.neutral;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${classes}`}>
      {emoji} {text}
    </span>
  );
};

export default SentimentBadge;
