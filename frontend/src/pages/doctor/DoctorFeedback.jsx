import { useState, useEffect } from 'react';
import { healthService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import RatingStars from '../../components/common/RatingStars';
import { Star, User, MessageSquare } from 'lucide-react';

const DoctorFeedback = () => {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && (user._id || user.id)) {
      fetchFeedback(user._id || user.id);
    }
  }, [user]);

  const fetchFeedback = async (doctorId) => {
    try {
      const result = await healthService.getDoctorFeedback(doctorId);
      setFeedback(result.data || []);
      setStats(result.stats || null);
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Patient Feedback</h1>
        <p className="text-gray-600 mt-2">Reviews and ratings from your patients</p>
      </div>

      {/* Stats Summary */}
      {stats && stats.total > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reviews</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Rating</p>
                <p className="text-3xl font-bold text-gray-900">
                  {(stats.total > 0 ? (stats.positive - stats.negative) / stats.total : 0).toFixed(1)}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <p className="text-sm text-gray-600 mb-2">Sentiment Distribution</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-accent-dark">Positive:</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-accent h-full"
                    style={{ width: `${(stats.positive / stats.total) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{stats.positive}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-purple-600">Neutral:</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-purple-500 h-full"
                    style={{ width: `${(stats.neutral / stats.total) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{stats.neutral}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-red-600">Negative:</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-red-500 h-full"
                    style={{ width: `${(stats.negative / stats.total) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{stats.negative}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback List */}
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Recent Reviews
          </h3>
        </div>
        <div className="card-body">
          {feedback.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No feedback received yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {feedback.map((item) => (
                <div key={item._id} className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{item.userId?.name}</span>
                        <RatingStars rating={item.rating} size="sm" />
                        <span
                          className={`badge ${
                            item.sentiment === 'positive'
                              ? 'badge-success'
                              : item.sentiment === 'negative'
                              ? 'badge-danger'
                              : 'badge-info'
                          }`}
                        >
                          {item.sentiment}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{item.comment}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorFeedback;
