import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const AddUserModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    phone: '',
    // Student specifics
    studentId: '',
    year: '',
    semester: '',
    faculty: '',
    // Doctor specifics
    licenseNumber: '',
    // Shop owner specifics
    shopName: '',
    shopType: 'grocery',
    shopAddress: '',
    // Delivery person specifics
    vehicleType: 'bike',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Clean up formData to only send relevant fields based on role
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
      };

      if (formData.role === 'student') {
        payload.studentId = formData.studentId;
        payload.year = formData.year;
        payload.semester = formData.semester;
        payload.faculty = formData.faculty;
      } else if (formData.role === 'doctor') {
        payload.licenseNumber = formData.licenseNumber;
      } else if (formData.role === 'shop_owner') {
        payload.shopName = formData.shopName;
        payload.shopType = formData.shopType;
        payload.shopAddress = formData.shopAddress;
      } else if (formData.role === 'delivery_person') {
        payload.vehicleType = formData.vehicleType;
      }

      await api.post('/admin/users', payload);
      toast.success('User created successfully.');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl my-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Add New User</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-800" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-800" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <input type="password" name="password" required minLength="6" value={formData.password} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-800" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-800" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
              <select name="role" required value={formData.role} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-800">
                <option value="student">Student</option>
                <option value="doctor">Doctor</option>
                <option value="shop_owner">Shop Owner</option>
                <option value="delivery_person">Delivery Person</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {/* Role-specific fields */}
          {formData.role === 'student' && (
            <div className="bg-gray-50 p-4 rounded-xl mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-100">
              <h3 className="md:col-span-2 text-sm font-semibold text-gray-700 mb-1 border-b pb-2">Student Details</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                <input type="text" name="studentId" value={formData.studentId} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Faculty</label>
                <input type="text" name="faculty" value={formData.faculty} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <input type="number" min="1" max="5" name="year" value={formData.year} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                <input type="number" min="1" max="2" name="semester" value={formData.semester} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-800" />
              </div>
            </div>
          )}

          {formData.role === 'doctor' && (
            <div className="bg-gray-50 p-4 rounded-xl mb-6 grid grid-cols-1 gap-4 border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-1 border-b pb-2">Doctor Details</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                <input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-800" />
              </div>
            </div>
          )}

          {formData.role === 'shop_owner' && (
            <div className="bg-gray-50 p-4 rounded-xl mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-100">
              <h3 className="md:col-span-2 text-sm font-semibold text-gray-700 mb-1 border-b pb-2">Shop Details</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
                <input type="text" name="shopName" value={formData.shopName} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shop Type</label>
                <select name="shopType" value={formData.shopType} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-800">
                  <option value="grocery">Grocery</option>
                  <option value="pharmacy">Pharmacy</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Shop Address</label>
                <input type="text" name="shopAddress" value={formData.shopAddress} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-800" />
              </div>
            </div>
          )}

          {formData.role === 'delivery_person' && (
            <div className="bg-gray-50 p-4 rounded-xl mb-6 grid grid-cols-1 gap-4 border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-1 border-b pb-2">Delivery Details</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-800">
                  <option value="bike">Bike</option>
                  <option value="car">Car</option>
                  <option value="walk">Walk</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl font-medium hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-blue-900 text-white py-2.5 rounded-xl font-medium hover:bg-blue-800 disabled:opacity-70">
              {loading ? 'Adding...' : 'Add User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
