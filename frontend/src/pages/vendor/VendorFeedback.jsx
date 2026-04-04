import { useState, useEffect } from "react";
import { feedbackService } from "../../services/feedbackService";
import { Star, Loader2, MessageCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function VendorFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    if (user?._id) {
      fetchFeedbacks();
    }
  }, [user]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await feedbackService.getShopFeedback(user._id);
      setFeedbacks(res.data || []);
    } catch (err) {
      setError("Failed to load customer feedback.");
    } finally {
      setLoading(false);
    }
  };

  const getAverageRating = () => {
    if (feedbacks.length === 0) return 0;
    const sum = feedbacks.reduce((acc, f) => acc + (f.rating || 0), 0);
    return (sum / feedbacks.length).toFixed(1);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Feedback</h1>
          <p className="text-gray-500">View what customers are saying about your shop and products.</p>
        </div>
        <div className="bg-blue-50 text-sky-700 px-4 py-2 rounded-lg flex items-center gap-2 font-medium">
          <Star className="w-5 h-5 fill-current" />
          <span>{getAverageRating()} / 5.0 Rating</span>
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
            Loading reviews...
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center text-gray-500">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No Feedback Yet</h3>
            <p>Customer reviews and ratings will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {feedbacks.map((feedback) => (
              <div key={feedback._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900">{feedback.userId?.name || "Anonymous User"}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < feedback.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(feedback.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 mt-3 whitespace-pre-wrap">
                  {feedback.comment || "No detailed comment provided."}
                </p>
                {feedback.sentiment && (
                  <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    Sentiment: <span className="capitalize">{feedback.sentiment}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
