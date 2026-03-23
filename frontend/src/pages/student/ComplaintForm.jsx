import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const schema = yup.object({
  againstUser: yup.string().required('User ID is required'),
  againstRole: yup.string().required('Role is required'),
  category: yup.string().required('Category is required'),
  subject: yup.string().required('Subject is required').max(200),
  description: yup.string().required('Description is required').min(50, 'Minimum 50 characters'),
  priority: yup.string().required(),
});

const ComplaintForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingData, setPendingData] = useState(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({ resolver: yupResolver(schema), defaultValues: { priority: 'medium' } });

  const description = watch('description', '');

  const onSubmit = (data) => {
    setPendingData(data);
    setShowConfirm(true);
  };

  const confirmSubmit = async () => {
    setLoading(true);
    setShowConfirm(false);
    try {
      await api.post('/complaints', pendingData);
      toast.success('Complaint submitted successfully!');
      navigate('/student/complaints');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">📢 File a Complaint</h1>
          <p className="text-gray-500 text-sm mt-1">Submit a complaint and our admin team will review it.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Against User ID</label>
                <input className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-800 ${errors.againstUser ? 'border-red-400' : 'border-gray-300'}`} placeholder="User ID" {...register('againstUser')} />
                {errors.againstUser && <p className="text-xs text-red-500 mt-1">{errors.againstUser.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Their Role</label>
                <select className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-800 ${errors.againstRole ? 'border-red-400' : 'border-gray-300'}`} {...register('againstRole')}>
                  <option value="">Select role</option>
                  <option value="delivery_person">🚴 Delivery Person</option>
                  <option value="shop_owner">🏪 Shop Owner</option>
                  <option value="doctor">👨‍⚕️ Doctor</option>
                </select>
                {errors.againstRole && <p className="text-xs text-red-500 mt-1">{errors.againstRole.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-800 ${errors.category ? 'border-red-400' : 'border-gray-300'}`} {...register('category')}>
                  <option value="">Select category</option>
                  <option value="delivery">🚴 Delivery</option>
                  <option value="shop">🏪 Shop</option>
                  <option value="doctor">👨‍⚕️ Doctor</option>
                  <option value="platform">💻 Platform</option>
                </select>
                {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-800" {...register('priority')}>
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-800 ${errors.subject ? 'border-red-400' : 'border-gray-300'}`} placeholder="Brief subject of complaint" {...register('subject')} />
              {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <span className={`text-xs ${description.length < 50 ? 'text-red-400' : 'text-green-600'}`}>{description.length} / 50 min</span>
              </div>
              <textarea
                rows={5}
                placeholder="Describe your complaint in detail (minimum 50 characters)..."
                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-800 resize-none ${errors.description ? 'border-red-400' : 'border-gray-300'}`}
                {...register('description')}
              />
              {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="w-full bg-blue-900 text-white py-3 rounded-xl font-semibold hover:bg-blue-800 transition-colors disabled:opacity-60">
              {loading ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </form>
        </div>
      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="font-bold text-gray-800 text-lg mb-2">Confirm Submission</h3>
            <p className="text-gray-600 text-sm">Are you sure you want to submit this complaint? This action cannot be undone.</p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowConfirm(false)} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={confirmSubmit} className="flex-1 bg-blue-900 text-white py-2.5 rounded-xl font-medium hover:bg-blue-800">Yes, Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintForm;
