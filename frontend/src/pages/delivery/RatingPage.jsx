import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const starLabels  = ['', 'Poor',   'Fair', 'Good', 'Very Good', 'Excellent'];
const starColors  = ['', '#EF4444','#F97316','#F59E0B','#84CC16','#10B981'];

export default function RatingPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [stars, setStars] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!stars || stars < 1) e.stars = 'Please select a rating (1–5 stars) before submitting';
    if (comment.length > 500) e.comment = 'Feedback must be under 500 characters';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    try { await axios.post('http://localhost:5000/api/orders/rate', { orderId, stars, comment }); } catch (_) {}
    setSubmitted(true);
    setLoading(false);
  };

  const activeStars = hovered || stars;

  const darkCard = { background: '#1E293B', border: '1px solid rgba(96,165,250,0.12)', boxShadow: '0 8px 40px rgba(0,0,0,0.5)' };

  return (
    <div className="min-h-screen flex items-center justify-center py-10 px-4" style={{ background: '#0F172A' }}>
      <div className="max-w-md w-full">
        {!submitted ? (
          <div className="rounded-3xl overflow-hidden" style={darkCard}>
            {/* Banner */}
            <div className="p-8 text-center" style={{ background: 'linear-gradient(135deg, #1E3A8A, #2563EB)' }}>
              <div className="text-5xl mb-3">⭐</div>
              <h1 className="text-2xl font-extrabold mb-1" style={{ color: '#F8FAFC' }}>Rate Your Experience</h1>
              <p className="text-sm" style={{ color: 'rgba(219,234,254,0.8)' }}>How was your delivery?</p>
            </div>

            <div className="p-8">
              <form onSubmit={handleSubmit} noValidate id="rating-form" className="space-y-6">
                {/* Stars */}
                <div className="text-center">
                  <label className="block text-sm font-medium mb-4" style={{ color: '#CBD5E1' }}>
                    Your Rating <span style={{ color: '#F87171' }}>*</span>
                  </label>
                  <div className="flex justify-center gap-2 mb-3">
                    {[1,2,3,4,5].map((s) => (
                      <button
                        key={s} type="button" id={`star-${s}`}
                        onClick={() => { setStars(s); setErrors((e) => { const n={...e}; delete n.stars; return n; }); }}
                        onMouseEnter={() => setHovered(s)}
                        onMouseLeave={() => setHovered(0)}
                        className="text-4xl transition-all duration-150 focus:outline-none hover:scale-125"
                      >
                        {s <= activeStars ? '⭐' : '☆'}
                      </button>
                    ))}
                  </div>
                  {activeStars > 0 && (
                    <p className="text-base font-bold" style={{ color: starColors[activeStars] }}>
                      {starLabels[activeStars]}
                    </p>
                  )}
                  {errors.stars && (
                    <p className="text-xs mt-2 flex items-center justify-center gap-1" style={{ color: '#FCA5A5' }}>
                      <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                      {errors.stars}
                    </p>
                  )}
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#CBD5E1' }}>
                    Feedback <span className="text-xs font-normal" style={{ color: '#64748B' }}>(Optional)</span>
                  </label>
                  <textarea
                    id="feedback-comment"
                    value={comment}
                    onChange={(e) => {
                      setComment(e.target.value);
                      if (e.target.value.length <= 500) setErrors((err) => { const n={...err}; delete n.comment; return n; });
                    }}
                    placeholder="Share your experience — quality, speed, delivery person..."
                    rows={4} maxLength={500}
                    className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all resize-none placeholder-slate-600"
                    style={{
                      background: errors.comment ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.04)',
                      border: errors.comment ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(96,165,250,0.2)',
                      color: '#F8FAFC',
                    }}
                  />
                  <div className="flex justify-between mt-1">
                    {errors.comment
                      ? <p className="text-xs flex items-center gap-1" style={{ color: '#FCA5A5' }}>
                          <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                          {errors.comment}
                        </p>
                      : <span />
                    }
                    <span className="text-xs" style={{ color: comment.length > 450 ? '#F87171' : '#475569' }}>
                      {comment.length}/500
                    </span>
                  </div>
                </div>

                <button
                  id="submit-rating-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 font-bold rounded-2xl text-base transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: '#2563EB', color: '#F8FAFC', boxShadow: '0 4px 20px rgba(37,99,235,0.45)' }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#1D4ED8'; }}
                  onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#2563EB'; }}
                >
                  {loading
                    ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Submitting...</>
                    : '⭐ Submit Rating'
                  }
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl overflow-hidden" style={{ background: '#1E293B', border: '1px solid rgba(16,185,129,0.2)', boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}>
            <div className="p-8 text-center" style={{ background: 'linear-gradient(135deg, #065F46, #10B981)' }}>
              <div className="text-6xl mb-3">🙏</div>
              <h1 className="text-2xl font-extrabold mb-1" style={{ color: '#F8FAFC' }}>Thank You!</h1>
              <p className="text-sm" style={{ color: 'rgba(209,250,229,0.85)' }}>Your feedback means a lot to us</p>
            </div>
            <div className="p-8 text-center">
              <div className="flex justify-center gap-1 text-3xl mb-3">
                {Array.from({ length: stars }, (_, i) => <span key={i}>⭐</span>)}
              </div>
              <p className="font-bold text-lg mb-1" style={{ color: starColors[stars] }}>{starLabels[stars]}</p>
              <p className="text-sm mb-6 leading-relaxed" style={{ color: '#CBD5E1' }}>
                Your rating helps us improve our campus delivery service. We appreciate your time!
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/delivery')}
                  className="w-full py-4 font-bold rounded-2xl transition-all duration-200 hover:-translate-y-0.5"
                  style={{ background: '#2563EB', color: '#F8FAFC', boxShadow: '0 4px 20px rgba(37,99,235,0.45)' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#1D4ED8'}
                  onMouseLeave={e => e.currentTarget.style.background = '#2563EB'}
                >
                  Back to Dashboard
                </button>
                <button
                  onClick={() => navigate('/delivery/history')}
                  className="w-full py-3 rounded-2xl transition-all duration-200 text-sm font-medium"
                  style={{ background: 'transparent', border: '1px solid rgba(96,165,250,0.25)', color: '#60A5FA' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(37,99,235,0.1)'; e.currentTarget.style.color = '#93C5FD'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#60A5FA'; }}
                >
                  View Order History
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
