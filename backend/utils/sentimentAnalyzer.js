const Sentiment = require('sentiment');
const sentiment = new Sentiment();

/**
 * Analyse the sentiment of a text string using the AFINN lexicon.
 * @param {string} text - the text to analyse
 * @returns {{ score: number, label: string, emoji: string }}
 *   score  — AFINN comparative score (roughly -1 to 1)
 *   label  — "positive" | "neutral" | "negative"
 *   emoji  — "🟢" | "🟡" | "🔴"
 */
const analyzeSentiment = (text) => {
  const result = sentiment.analyze(text);
  const score = result.comparative; // normalised per-word score

  let label = 'neutral';
  let emoji = '🟡';

  if (score > 0.05) {
    label = 'positive';
    emoji = '🟢';
  } else if (score < -0.05) {
    label = 'negative';
    emoji = '🔴';
  }

  return { score, label, emoji };
};

module.exports = analyzeSentiment;
