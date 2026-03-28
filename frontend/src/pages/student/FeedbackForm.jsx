import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import StarRating from '../../components/StarRating';

const FeedbackForm = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // State from navigation:
  // e.g., { orderId: '123', shopId: 'abc', driverId: 'xyz' }
  // OR { appointmentId: '456', doctorId: 'def' }
  const stateData = location.state || {};
  const { orderId, shopId, driverId, appointmentId, doctorId } = stateData;

  const [loading, setLoading] = useState(false);

  // Form states
  const [shopRating, setShopRating] = useState(0);
  const [shopComment, setShopComment] = useState('');
  
  const [driverRating, setDriverRating] = useState(0);
  const [driverComment, setDriverComment] = useState('');
  
  const [doctorRating, setDoctorRating] = useState(0);
  const [doctorComment, setDoctorComment] = useState('');

  useEffect(() => {
    if (!orderId && !appointmentId) {
      toast.error('No target specified for feedback.');
      navigate('/');
    }
  }, [orderId, appointmentId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validations
    if (orderId) {
      if (shopId && (!shopRating || !shopComment.trim())) {
         return toast.error('Please provide both rating and comment for the Shop.');
      }
      if (driverId && (!driverRating || !driverComment.trim())) {
         return toast.error('Please provide both rating and comment for the Driver.');
      }
    }
    if (appointmentId) {
      if (!doctorRating || !doctorComment.trim()) {
         return toast.error('Please provide both rating and comment for the Doctor.');
      }
    }

    setLoading(true);
    try {
      const payload = {
        orderId, shopId, shopRating, shopComment,
        driverId, driverRating, driverComment,
        appointmentId, doctorId, doctorRating, doctorComment
      };

      const res = await axios.post('http://localhost:5000/api/feedback', payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      
      if (res.data.success) {
        toast.success(res.data.message || 'Feedback submitted successfully!');
        navigate('/'); // Take back to dashboard or home
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error submitting feedback.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-10 px-4">
      <div className="w-full max-w-lg bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Leave Feedback</h2>
        <p className="text-center text-gray-500 mb-8">We value your opinion!</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Appointment / Doctor Feedback */}
          {appointmentId && doctorId && (
            <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
              <h3 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
                <span className="mr-2">👨‍⚕️</span> Rate your Doctor
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <StarRating rating={doctorRating} setRating={setDoctorRating} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                <textarea
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3"
                  rows="3"
                  placeholder="How was your consultation?"
                  value={doctorComment}
                  onChange={(e) => setDoctorComment(e.target.value)}
                ></textarea>
              </div>
            </div>
          )}

          {/* Order / Shop Feedback */}
          {orderId && shopId && (
            <div className="bg-green-50/50 p-6 rounded-xl border border-green-100">
              <h3 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
                <span className="mr-2">🛒</span> Rate the Shop
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <StarRating rating={shopRating} setRating={setShopRating} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                <textarea
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 p-3"
                  rows="2"
                  placeholder="How were the items?"
                  value={shopComment}
                  onChange={(e) => setShopComment(e.target.value)}
                ></textarea>
              </div>
            </div>
          )}

          {/* Order / Driver Feedback */}
          {orderId && driverId && (
            <div className="bg-orange-50/50 p-6 rounded-xl border border-orange-100">
              <h3 className="text-xl font-semibold text-orange-800 mb-4 flex items-center">
                <span className="mr-2">🚚</span> Rate the Driver
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <StarRating rating={driverRating} setRating={setDriverRating} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                <textarea
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 p-3"
                  rows="2"
                  placeholder="How was the delivery?"
                  value={driverComment}
                  onChange={(e) => setDriverComment(e.target.value)}
                ></textarea>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 shrink-0 rounded-lg text-white font-medium text-lg tracking-wide shadow-md transition-all duration-300 ${
              loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5'
            }`}
          >
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackForm;
