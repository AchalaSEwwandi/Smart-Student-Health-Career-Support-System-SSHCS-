import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';

const EXPIRY_SECONDS = 10 * 60; // 10 minutes
const RESEND_COOLDOWN = 60;     // 60 seconds before resend is allowed

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(EXPIRY_SECONDS);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);

  // Redirect if navigated here without email
  useEffect(() => {
    if (!email) navigate('/forgot-password');
  }, [email, navigate]);

  // Main countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  // Resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) { setCanResend(true); return; }
    const t = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Handle individual box input
  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);
    // Auto-focus next box
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
    // Auto submit when all 6 filled
    if (updated.every((d) => d !== '') && value) {
      handleVerify(updated.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      handleVerify(pasted);
    }
  };

  const handleVerify = async (code) => {
    const finalCode = code || otp.join('');
    if (finalCode.length !== 6) return toast.error('Please enter the full 6-digit OTP.');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp: finalCode });
      toast.success('OTP verified! Create your new password.');
      navigate('/reset-password', { state: { resetToken: data.data.resetToken } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP. Try again.');
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('New OTP sent to your email!');
      setTimeLeft(EXPIRY_SECONDS);
      setResendCooldown(RESEND_COOLDOWN);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
    } catch {
      toast.error('Failed to resend OTP. Try again.');
    }
  };

  const isExpired = timeLeft <= 0;
  const otpString = otp.join('');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-blue-900 text-2xl font-bold">
            🧩 CareMate
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-3">Enter OTP</h1>
          <p className="text-gray-500 text-sm mt-1">
            We sent a 6-digit code to{' '}
            <span className="font-semibold text-blue-700">{email}</span>
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">

          {/* Timer */}
          <div className="text-center mb-6">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Code expires in</p>
            <p className={`text-4xl font-bold tabular-nums ${isExpired ? 'text-red-500' : timeLeft <= 60 ? 'text-orange-500' : 'text-blue-700'}`}>
              {formatTime(timeLeft)}
            </p>
            {isExpired && (
              <p className="text-sm text-red-500 mt-2">Your OTP has expired. Please request a new one.</p>
            )}
          </div>

          {/* 6-box OTP input */}
          <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                disabled={loading || isExpired}
                className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-xl focus:outline-none transition-all
                  ${digit ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}
                  ${loading || isExpired ? 'opacity-50 cursor-not-allowed' : 'focus:border-blue-600 focus:ring-2 focus:ring-blue-200'}`}
              />
            ))}
          </div>

          {/* Verify button */}
          <button
            type="button"
            onClick={() => handleVerify(null)}
            disabled={loading || otpString.length !== 6 || isExpired}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

          {/* Resend */}
          <div className="text-center mt-5">
            {canResend ? (
              <button
                onClick={handleResend}
                className="text-sm text-blue-700 font-semibold hover:underline"
              >
                Resend OTP
              </button>
            ) : (
              <p className="text-sm text-gray-400">
                Resend available in{' '}
                <span className="font-mono font-semibold text-gray-600">{resendCooldown}s</span>
              </p>
            )}
          </div>

          <p className="text-center text-sm text-gray-400 mt-4">
            <Link to="/forgot-password" className="hover:underline text-blue-600">
              ← Use a different email
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
