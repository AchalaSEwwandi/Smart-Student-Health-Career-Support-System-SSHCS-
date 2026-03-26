import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuth from '../../hooks/useAuth';

const schema = yup.object({
  name: yup.string().required('Full name is required').min(2, 'Minimum 2 characters'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  phone: yup.string().matches(/^\d{10}$/, 'Phone number must be exactly 10 digits').required('Phone number is required'),
  password: yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords do not match')
    .required('Please confirm your password'),
  studentId: yup.string().required('Student ID is required'),
  year: yup
    .number()
    .typeError('Year must be a number')
    .min(1, 'Min year is 1')
    .max(5, 'Max year is 5')
    .required('Year is required'),
  semester: yup
    .number()
    .typeError('Semester must be a number')
    .min(1, 'Min semester is 1')
    .max(2, 'Max semester is 2')
    .required('Semester is required'),
  faculty: yup.string().required('Faculty is required'),
});

const Field = ({ label, error, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {children}
    {error && <p className="mt-1 text-xs text-red-500">{error.message}</p>}
  </div>
);

const inputClass = (hasError) =>
  `w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
    hasError
      ? 'border-red-400 bg-red-50 focus:ring-red-300'
      : 'border-gray-300 bg-white focus:ring-blue-500'
  }`;

const Register = () => {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authRegister({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        studentId: data.studentId,
        year: Number(data.year),
        semester: Number(data.semester),
        faculty: data.faculty,
        // role is forced to 'student' on the backend
      });
      toast.success('Account created! Welcome to CareMate 🎉');
      navigate('/');
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors?.length > 0) {
        serverErrors.forEach((e) => toast.error(`${e.message}`));
      } else {
        toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-10">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-blue-900 text-2xl font-bold">
            🧩 CareMate
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-3">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Student registration — join CareMate today</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Basic Info */}
            <Field label="Full Name" error={errors.name}>
              <input type="text" placeholder="e.g. Kasun Perera" className={inputClass(errors.name)} {...register('name')} />
            </Field>

            <Field label="Email Address" error={errors.email}>
              <input type="email" placeholder="you@university.edu" className={inputClass(errors.email)} {...register('email')} />
            </Field>

            <Field label="Phone Number" error={errors.phone}>
              <input type="tel" placeholder="0712345678" className={inputClass(errors.phone)} {...register('phone')} />
            </Field>

            {/* Password */}
            <Field label="Password" error={errors.password}>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Minimum 6 characters"
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
            </Field>

            <Field label="Confirm Password" error={errors.confirmPassword}>
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="Repeat your password"
                className={inputClass(errors.confirmPassword)}
                {...register('confirmPassword')}
              />
            </Field>

            {/* Student Details */}
            <div className="border-t border-gray-100 pt-5">
              <p className="text-sm font-semibold text-blue-800 mb-4">🎓 Student Details</p>
              <div className="space-y-4">

                <Field label="Student ID" error={errors.studentId}>
                  <input type="text" placeholder="e.g. IT22222222" className={inputClass(errors.studentId)} {...register('studentId')} />
                </Field>

                <Field label="Faculty" error={errors.faculty}>
                  <select className={inputClass(errors.faculty)} {...register('faculty')}>
                    <option value="">Select your faculty</option>
                    <option value="Faculty of Computing">Faculty of Computing</option>
                    <option value="Faculty of Engineering">Faculty of Engineering</option>
                    <option value="Faculty of Business">Faculty of Business</option>
                    <option value="Faculty of Medicine">Faculty of Medicine</option>
                    <option value="Faculty of Science">Faculty of Science</option>
                    <option value="Faculty of Arts">Faculty of Arts</option>
                    <option value="Faculty of Law">Faculty of Law</option>
                    <option value="Faculty of Education">Faculty of Education</option>
                  </select>
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Year" error={errors.year}>
                    <input type="number" placeholder="e.g. 2" min="1" max="5" className={inputClass(errors.year)} {...register('year')} />
                  </Field>
                  <Field label="Semester" error={errors.semester}>
                    <input type="number" placeholder="1 or 2" min="1" max="2" className={inputClass(errors.semester)} {...register('semester')} />
                  </Field>
                </div>

              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-700 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;