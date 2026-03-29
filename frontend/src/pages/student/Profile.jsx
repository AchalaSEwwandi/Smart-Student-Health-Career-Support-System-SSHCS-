import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [pwData, setPwData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    if (user) setFormData({ ...user });
  }, [user]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    // Upload immediately
    const fd = new FormData();
    fd.append('avatar', file);
    api.post('/users/profile/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(({ data }) => {
        updateUser({ ...user, avatar: data.data.avatar });
        toast.success('Avatar updated!');
      })
      .catch(() => toast.error('Avatar upload failed.'));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put('/users/profile', formData);
      updateUser(data.data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwData.newPassword !== pwData.confirmPassword) return toast.error('Passwords do not match.');
    if (pwData.newPassword.length < 6) return toast.error('Password must be at least 6 characters.');
    setPwLoading(true);
    try {
      await api.put('/users/profile/password', { currentPassword: pwData.currentPassword, newPassword: pwData.newPassword });
      toast.success('Password changed successfully!');
      setPwData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed.');
    } finally {
      setPwLoading(false);
    }
  };

  const avatar = avatarPreview || (user?.avatar ? `http://localhost:5000${user.avatar}` : null);

  const Input = ({ label, name, type = 'text', ...props }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input name={name} type={type} value={formData[name] || ''} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-800 transition-all" {...props} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>

        <div className="space-y-6">
          {/* Avatar + status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-6">
            <div className="relative">
              {avatar ? (
                <img src={avatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-blue-100" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-blue-900 flex items-center justify-center text-white text-4xl font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <button onClick={() => fileRef.current?.click()} className="absolute bottom-0 right-0 bg-blue-900 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm hover:bg-blue-800 shadow">
                ✏️
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
              <p className="text-gray-500">{user?.email}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${user?.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {user?.isActive ? '✅ Active' : '❌ Inactive'}
                </span>
                
                {user?.role === 'student' && (
                  <Link to="/messages/my" className="text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1 rounded-full border border-blue-200 transition-colors">
                    ✉️ My Messages
                  </Link>
                )}
                
                {['doctor', 'shop_owner'].includes(user?.role) && (
                  <Link to="/vendor/messages" className="text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200 transition-colors">
                    📬 Inbox
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Profile form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-800 mb-4">Personal Information</h3>
            <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Full Name" name="name" />
              <Input label="Phone" name="phone" type="tel" />
              {user?.role === 'student' && (
                <>
                  <Input label="Student ID" name="studentId" />
                  <Input label="Degree Program" name="degree" />
                  <Input label="Year" name="year" type="number" />
                  <Input label="Semester" name="semester" type="number" />
                  <Input label="GPA" name="gpa" type="number" step="0.01" />
                  <Input label="Specialization" name="specialization" />
                </>
              )}
              {user?.role === 'doctor' && (
                <>
                  <Input label="Specialization" name="specialization" />
                  <Input label="License Number" name="licenseNumber" />
                </>
              )}
              {user?.role === 'shop_owner' && (
                <>
                  <Input label="Shop Name" name="shopName" />
                  <Input label="Shop Address" name="shopAddress" />
                </>
              )}
              {user?.role === 'delivery_person' && (
                <>
                  <Input label="License Number" name="licenseNumber" />
                  <Input label="Current Location" name="currentLocation" />
                </>
              )}
              <div className="sm:col-span-2">
                <button type="submit" disabled={loading} className="bg-blue-900 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-800 transition-colors disabled:opacity-60">
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Password change */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-800 mb-4">Change Password</h3>
            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
              {[
                { label: 'Current Password', key: 'currentPassword' },
                { label: 'New Password', key: 'newPassword' },
                { label: 'Confirm New Password', key: 'confirmPassword' },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input type="password" value={pwData[key]} onChange={e => setPwData(p => ({ ...p, [key]: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-800" />
                </div>
              ))}
              <button type="submit" disabled={pwLoading} className="bg-gray-800 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-gray-700 transition-colors disabled:opacity-60">
                {pwLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
