import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import StarRating from '../../components/StarRating';

const schema = yup.object({
  toUser: yup.string().required('Please select who to rate'),
  targetType: yup.string().required('Please select target type'),
  rating: yup.number().min(1, 'Please select a rating').max(5).required(),
  comment: yup.string().min(10, 'Comment must be at least 10 characters').required('Comment is required'),
});

const FeedbackForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      toUser: searchParams.get('toUser') || '',
      targetType: searchParams.get('targetType') || '',
    },
  });

  const onSubmit = async (data) => {
    if (!rating) return toast.error('Please select a star rating.');
    setLoading(true);
    try {
      await api.post('/feedback', { ...data, rating });
      toast.success('Feedback submitted! Thank you 🙏');
      navigate(-1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">⭐ Submit Feedback</h1>
          <p className="text-gray-500 text-sm mt-1">Share your experience to help others</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User ID (to rate)</label>
              <input className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-800 ${errors.toUser ? 'border-red-400' : 'border-gray-300'}`} placeholder="User ID" {...register('toUser')} />
              {errors.toUser && <p className="text-xs text-red-500 mt-1">{errors.toUser.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-800 ${errors.targetType ? 'border-red-400' : 'border-gray-300'}`} {...register('targetType')}>
                <option value="">Select type</option>
                <option value="delivery_person">🚴 Delivery Person</option>
                <option value="shop_owner">🏪 Shop Owner</option>
              </select>
              {errors.targetType && <p className="text-xs text-red-500 mt-1">{errors.targetType.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
              <StarRating value={rating} onChange={(val) => { setRating(val); setValue('rating', val); }} size={36} />
              {errors.rating && <p className="text-xs text-red-500 mt-1">{errors.rating.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comment <span className="text-gray-400 text-xs">(min 10 chars)</span>
              </label>
              <textarea
                rows={4}
                placeholder="Tell us about your experience..."
                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-800 resize-none ${errors.comment ? 'border-red-400' : 'border-gray-300'}`}
                {...register('comment')}
              />
              {errors.comment && <p className="text-xs text-red-500 mt-1">{errors.comment.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-900 text-white py-3 rounded-xl font-semibold hover:bg-blue-800 transition-colors disabled:opacity-60"
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;
