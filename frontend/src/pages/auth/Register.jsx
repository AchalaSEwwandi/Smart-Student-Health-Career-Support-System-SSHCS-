import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuth from '../../hooks/useAuth';

// ── Helpers ──────────────────────────────────────────────────────────────────
const inputCls = (err) =>
  `w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
    err ? 'border-red-400 bg-red-50 focus:ring-red-300' : 'border-gray-300 bg-white focus:ring-blue-500'
  }`;

const Field = ({ label, error, required, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

const FACULTIES = [
  'Faculty of Computing',
  'Faculty of Engineering',
  'Faculty of Business',
  'Faculty of Medicine',
  'Faculty of Science',
  'Faculty of Arts',
  'Faculty of Law',
  'Faculty of Education',
];

const SPECIALIZATIONS = [
  'General Medicine',
  'Cardiology',
  'Dermatology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Neurology',
  'Gynecology',
  'ENT',
  'Ophthalmology',
  'Other',
];

// ── Main Component ────────────────────────────────────────────────────────────
const Register = () => {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});

  // Controlled fields
  const [fields, setFields] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    // student
    studentId: '', faculty: '', year: '', semester: '',
    // doctor
    nic: '', medicalRegNumber: '', specialization: '', yearsOfExperience: '', hospitalName: '',
    // vendor
    shopName: '', businessType: '', shopAddress: '',
  });
  const [medicalLicenseFile, setMedicalLicenseFile] = useState(null);
  const [businessLicenseFile, setBusinessLicenseFile] = useState(null);

  const set = useCallback((key) => (e) => {
    setFields((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  }, []);

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!fields.name.trim()) errs.name = 'Full name is required';
    if (!fields.email.match(/^\S+@\S+\.\S+$/)) errs.email = 'Valid email is required';
    if (!fields.phone.match(/^\d{10}$/)) errs.phone = 'Phone must be exactly 10 digits';
    if (fields.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (fields.password !== fields.confirmPassword) errs.confirmPassword = 'Passwords do not match';

    if (role === 'student') {
      if (!fields.studentId.trim()) errs.studentId = 'Student ID is required';
      if (!fields.faculty) errs.faculty = 'Faculty is required';
      if (!fields.year || fields.year < 1 || fields.year > 4) errs.year = 'Year must be 1–4';
      if (!fields.semester || fields.semester < 1 || fields.semester > 2) errs.semester = 'Semester must be 1 or 2';
    }

    if (role === 'doctor') {
      if (!fields.nic.trim()) errs.nic = 'NIC is required';
      if (!fields.medicalRegNumber.trim()) errs.medicalRegNumber = 'Medical registration number is required';
      if (!fields.specialization) errs.specialization = 'Specialization is required';
      if (!fields.yearsOfExperience || fields.yearsOfExperience < 0) errs.yearsOfExperience = 'Years of experience is required';
      if (!fields.hospitalName.trim()) errs.hospitalName = 'Hospital/Clinic name is required';
      if (!medicalLicenseFile) errs.medicalLicenseFile = 'Medical license PDF is required';
    }

    if (role === 'shop_owner') {
      if (!fields.nic.trim()) errs.nic = 'NIC is required';
      if (!fields.shopName.trim()) errs.shopName = 'Shop name is required';
      if (!fields.businessType) errs.businessType = 'Business type is required';
      if (!fields.shopAddress.trim()) errs.shopAddress = 'Shop address is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('role', role);
      fd.append('name', fields.name);
      fd.append('email', fields.email);
      fd.append('phone', fields.phone);
      fd.append('password', fields.password);

      if (role === 'student') {
        fd.append('studentId', fields.studentId);
        fd.append('faculty', fields.faculty);
        fd.append('year', fields.year);
        fd.append('semester', fields.semester);
      }
      if (role === 'doctor') {
        fd.append('nic', fields.nic);
        fd.append('medicalRegNumber', fields.medicalRegNumber);
        fd.append('specialization', fields.specialization);
        fd.append('yearsOfExperience', fields.yearsOfExperience);
        fd.append('hospitalName', fields.hospitalName);
        if (medicalLicenseFile) fd.append('medicalLicenseFile', medicalLicenseFile);
      }
      if (role === 'shop_owner') {
        fd.append('nic', fields.nic);
        fd.append('shopName', fields.shopName);
        fd.append('businessType', fields.businessType);
        fd.append('shopAddress', fields.shopAddress);
        if (businessLicenseFile) fd.append('businessLicenseFile', businessLicenseFile);
      }

      const result = await authRegister(fd);

      if (result?.pending) {
        toast.info('Registration submitted! You will be notified by email once approved. 📧', { autoClose: 6000 });
        navigate('/login');
      } else {
        toast.success('Account created! Welcome to CareMate 🎉');
        navigate('/');
      }
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors?.length > 0) {
        serverErrors.forEach((e) => toast.error(e.message));
      } else {
        toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── UI ──────────────────────────────────────────────────────────────────────
  const roleColors = {
    student: 'from-blue-600 to-indigo-600',
    doctor: 'from-emerald-600 to-teal-600',
    shop_owner: 'from-orange-500 to-amber-500',
  };
  const roleLabels = { student: '🎓 Student', doctor: '🩺 Doctor', shop_owner: '🏪 Vendor (Shop Owner)' };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-10">
      <div className="w-full max-w-xl">

        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-blue-900 text-2xl font-bold">
            🩺 CareMate
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-3">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Join CareMate — select your role to get started</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

          {/* Role Selector Tabs */}
          <div className="grid grid-cols-3 border-b border-gray-100">
            {['student', 'doctor', 'shop_owner'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => { setRole(r); setErrors({}); }}
                className={`py-4 px-2 text-xs font-semibold transition-all ${
                  role === r
                    ? `bg-gradient-to-r ${roleColors[r]} text-white`
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
              >
                {roleLabels[r]}
              </button>
            ))}
          </div>



          <form onSubmit={onSubmit} className="p-8 space-y-5" encType="multipart/form-data">

            {/* ── Common Fields ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" error={errors.name} required>
                <input type="text" placeholder="e.g. Kasun Perera" className={inputCls(errors.name)}
                  value={fields.name} onChange={set('name')} />
              </Field>
              <Field label="Email Address" error={errors.email} required>
                <input type="email" placeholder="you@example.com" className={inputCls(errors.email)}
                  value={fields.email} onChange={set('email')} />
              </Field>
            </div>

            <Field label="Phone Number" error={errors.phone} required>
              <input type="tel" placeholder="0712345678 (10 digits)" className={inputCls(errors.phone)}
                value={fields.phone} onChange={set('phone')} />
            </Field>

            {/* ── Password ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Password" error={errors.password} required>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} placeholder="Min. 6 characters"
                    className={inputCls(errors.password) + ' pr-10'} value={fields.password} onChange={set('password')} />
                  <button type="button" onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 text-base">
                    {showPw ? '🙈' : '👁️'}
                  </button>
                </div>
              </Field>
              <Field label="Confirm Password" error={errors.confirmPassword} required>
                <input type={showPw ? 'text' : 'password'} placeholder="Repeat password"
                  className={inputCls(errors.confirmPassword)} value={fields.confirmPassword} onChange={set('confirmPassword')} />
              </Field>
            </div>

            <hr className="border-gray-100" />

            {/* ── Student Fields ── */}
            {role === 'student' && (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-blue-700">🎓 Student Details</p>
                <Field label="Student ID" error={errors.studentId} required>
                  <input type="text" placeholder="e.g. IT22222222" className={inputCls(errors.studentId)}
                    value={fields.studentId} onChange={set('studentId')} />
                </Field>
                <Field label="Faculty" error={errors.faculty} required>
                  <select className={inputCls(errors.faculty)} value={fields.faculty} onChange={set('faculty')}>
                    <option value="">Select your faculty</option>
                    {FACULTIES.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Year" error={errors.year} required>
                    <input type="number" placeholder="1–4" min="1" max="4" className={inputCls(errors.year)}
                      value={fields.year} onChange={set('year')} />
                  </Field>
                  <Field label="Semester" error={errors.semester} required>
                    <input type="number" placeholder="1 or 2" min="1" max="2" className={inputCls(errors.semester)}
                      value={fields.semester} onChange={set('semester')} />
                  </Field>
                </div>
              </div>
            )}

            {/* ── Doctor Fields ── */}
            {role === 'doctor' && (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-emerald-700">🩺 Doctor Details</p>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="NIC / ID Number" error={errors.nic} required>
                    <input type="text" placeholder="e.g. 991234567V" className={inputCls(errors.nic)}
                      value={fields.nic} onChange={set('nic')} />
                  </Field>
                  <Field label="Medical Reg. Number" error={errors.medicalRegNumber} required>
                    <input type="text" placeholder="e.g. SLMC-12345" className={inputCls(errors.medicalRegNumber)}
                      value={fields.medicalRegNumber} onChange={set('medicalRegNumber')} />
                  </Field>
                </div>
                <Field label="Specialization" error={errors.specialization} required>
                  <select className={inputCls(errors.specialization)} value={fields.specialization} onChange={set('specialization')}>
                    <option value="">Select specialization</option>
                    {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Years of Experience" error={errors.yearsOfExperience} required>
                    <input type="number" placeholder="e.g. 5" min="0" className={inputCls(errors.yearsOfExperience)}
                      value={fields.yearsOfExperience} onChange={set('yearsOfExperience')} />
                  </Field>
                  <Field label="Hospital / Clinic Name" error={errors.hospitalName} required>
                    <input type="text" placeholder="e.g. Colombo General" className={inputCls(errors.hospitalName)}
                      value={fields.hospitalName} onChange={set('hospitalName')} />
                  </Field>
                </div>
                <Field label="Upload Medical License (PDF)" error={errors.medicalLicenseFile} required>
                  <input type="file" accept=".pdf"
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer border border-gray-300 rounded-xl p-1"
                    onChange={(e) => { setMedicalLicenseFile(e.target.files[0]); setErrors((p) => ({ ...p, medicalLicenseFile: '' })); }} />
                  <p className="text-xs text-gray-400 mt-1">Max 5 MB · PDF only</p>
                </Field>
              </div>
            )}

            {/* ── Vendor / Shop Owner Fields ── */}
            {role === 'shop_owner' && (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-orange-600">🏪 Shop Owner Details</p>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="NIC" error={errors.nic} required>
                    <input type="text" placeholder="e.g. 991234567V" className={inputCls(errors.nic)}
                      value={fields.nic} onChange={set('nic')} />
                  </Field>
                  <Field label="Shop Name" error={errors.shopName} required>
                    <input type="text" placeholder="e.g. MediPlus Pharmacy" className={inputCls(errors.shopName)}
                      value={fields.shopName} onChange={set('shopName')} />
                  </Field>
                </div>
                <Field label="Business Type" error={errors.businessType} required>
                  <select className={inputCls(errors.businessType)} value={fields.businessType} onChange={set('businessType')}>
                    <option value="">Select business type</option>
                    <option value="pharmacy">Pharmacy</option>
                    <option value="grocery">Grocery</option>
                    <option value="other">Other</option>
                  </select>
                </Field>
                <Field label="Shop Address" error={errors.shopAddress} required>
                  <input type="text" placeholder="e.g. 25 Main Street, Colombo 07" className={inputCls(errors.shopAddress)}
                    value={fields.shopAddress} onChange={set('shopAddress')} />
                </Field>
                <Field label="Upload Business License (PDF, optional)" error={errors.businessLicenseFile}>
                  <input type="file" accept=".pdf"
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer border border-gray-300 rounded-xl p-1"
                    onChange={(e) => setBusinessLicenseFile(e.target.files[0])} />
                  <p className="text-xs text-gray-400 mt-1">Max 5 MB · PDF only · Optional</p>
                </Field>
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              className={`w-full bg-gradient-to-r ${roleColors[role]} text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2 shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]`}>
              {loading ? 'Submitting...' : role === 'student' ? 'Create Account' : 'Submit for Approval'}
            </button>

            <p className="text-center text-sm text-gray-500 mt-2">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-700 font-semibold hover:underline">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;