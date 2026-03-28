import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuth from '../../hooks/useAuth';

const schema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

const inputClass = (hasError) =>
  `w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
    hasError
      ? 'border-red-400 bg-red-50 focus:ring-red-300'
      : 'border-gray-300 bg-white focus:ring-blue-500'
  }`;

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [pendingUser, setPendingUser] = useState(null); // { name, role }

  const from = location.state?.from?.pathname || null;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async ({ email, password }) => {
    setLoading(true);
    setPendingUser(null);
    try {
      const { redirectPath, user } = await login(email, password);

      if (user?.status === 'pending') {
        setPendingUser({ name: user.name, role: user.role });
        return; // Stay on page, show banner
      }

      toast.success('Welcome back! 👋');
      navigate(from || redirectPath);
    } catch (err) {
      if (err.response?.status === 429) {
        toast.error('Too many attempts. Please wait a minute and try again.');
      } else if (err.response?.status === 403) {
        toast.error('Your account has been deactivated. Contact the admin.');
      } else {
        toast.error(err.response?.data?.message || 'Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const roleLabel = {
    doctor: 'Doctor',
    shop_owner: 'Vendor (Shop Owner)',
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-blue-900 text-2xl font-bold">
            🩺 CareMate
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-3">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to continue to CareMate</p>
        </div>

        {/* Pending Approval Banner */}
        {pendingUser && (
          <div className="mb-6 bg-amber-50 border border-amber-300 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">⏳</span>
              <div>
                <h3 className="font-semibold text-amber-800 text-base">Account Pending Approval</h3>
                <p className="text-amber-700 text-sm mt-1 leading-relaxed">
                  Hi <strong>{pendingUser.name}</strong>, your{' '}
                  <strong>{roleLabel[pendingUser.role] || pendingUser.role}</strong> account is currently
                  under review. Our admin team will approve it shortly.
                </p>
                <p className="text-amber-600 text-xs mt-2">
                  📧 You will receive an email notification once your account is approved.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="you@university.edu"
                className={inputClass(errors.email)}
                {...register('email')}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <Link to="/forgot-password" className="text-xs text-blue-700 hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={inputClass(errors.password) + ' pr-12'}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 text-lg"
                >
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-blue-700 font-semibold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;