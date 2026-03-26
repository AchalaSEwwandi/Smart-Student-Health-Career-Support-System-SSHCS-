import { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
};

const ContactManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState(''); // '' (all), 'general', 'shop_request'
  const [modal, setModal] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [tempPassword, setTempPassword] = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = filterType ? { type: filterType } : {};
      const { data } = await api.get('/admin/contact-requests', { params });
      setRequests(data.data);
    } catch {
      toast.error('Failed to load contact requests.');
    } finally {
      setLoading(false);
    }
  }, [filterType]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleAction = async (id, action) => {
    setUpdating(true);
    setTempPassword(null);
    try {
      const { data } = await api.put(`/admin/contact-requests/${id}/${action}`);
      toast.success(action === 'approve' ? 'Shop Owner approved and created!' : 'Request rejected.');
      
      if (data.tempPassword) {
        setTempPassword(data.tempPassword);
      } else {
        setModal(null);
        fetchRequests();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action} request.`);
    } finally {
      setUpdating(false);
    }
  };

  const closeAndRefresh = () => {
    setModal(null);
    setTempPassword(null);
    fetchRequests();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">✉️ Contact & Shop Requests</h1>
            <p className="text-gray-500 text-sm">{requests.length} total requests</p>
          </div>
          
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-800 bg-white"
          >
            <option value="">All Inquiries</option>
            <option value="general">General Inquiries</option>
            <option value="shop_request">Shop Requests</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Name', 'Email', 'Type', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}><td colSpan={6}><div className="h-8 bg-gray-100 rounded animate-pulse m-4" /></td></tr>
                  ))
                ) : requests.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">No requests found.</td></tr>
                ) : requests.map(r => {
                  const sc = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
                  return (
                    <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-800">{r.name}</td>
                      <td className="px-4 py-3 text-gray-600">{r.email}</td>
                      <td className="px-4 py-3">
                        {r.inquiry_type === 'shop_request' ? 
                          <span className="px-2 py-1 rounded bg-purple-100 text-purple-700 text-xs font-semibold">Shop Request</span> : 
                          <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs">General</span>
                        }
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${sc.color}`}>{sc.label}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => setModal(r)} className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium transition">View Details</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto">
            {tempPassword ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">✓</div>
                <h3 className="font-bold text-xl text-gray-900 mb-2">Shop Owner Created!</h3>
                <p className="text-sm text-gray-600 mb-6">User has been created and assigned the vendor role.</p>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 text-left">
                  <p className="text-sm text-gray-600 mb-1">Email: <strong>{modal.email}</strong></p>
                  <p className="text-sm text-gray-600">Temporary Password: <strong className="text-blue-600 font-mono bg-blue-50 px-2 py-1 rounded">{tempPassword}</strong></p>
                  <p className="text-xs text-gray-500 mt-2">* Please share these credentials securely.</p>
                </div>
                <button onClick={closeAndRefresh} className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-xl hover:bg-blue-700 transition">Complete</button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-gray-800 text-xl">Request Details</h3>
                  <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Name</p>
                      <p className="text-sm font-medium text-gray-900">{modal.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900">{modal.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm font-medium text-gray-900">{modal.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Type</p>
                      <p className="text-sm font-medium text-gray-900 capitalize">{modal.inquiry_type.replace('_', ' ')}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Message</p>
                    <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">{modal.message}</div>
                  </div>

                  {modal.inquiry_type === 'shop_request' && (
                    <div className="pt-4 border-t border-gray-100">
                      <h4 className="font-semibold text-gray-800 mb-3 text-sm">Shop Details</h4>
                      <div className="grid grid-cols-2 gap-4 bg-purple-50 p-4 rounded-xl border border-purple-100">
                        <div className="col-span-2">
                          <p className="text-xs text-purple-600/80 mb-1">Shop Name</p>
                          <p className="text-sm font-medium text-purple-900">{modal.shop_name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-purple-600/80 mb-1">Shop Type</p>
                          <p className="text-sm font-medium text-purple-900">{modal.shop_type}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-purple-600/80 mb-1">Address</p>
                          <p className="text-sm font-medium text-purple-900">{modal.address}</p>
                        </div>
                        {modal.description && (
                          <div className="col-span-2">
                            <p className="text-xs text-purple-600/80 mb-1">Description</p>
                            <p className="text-sm font-medium text-purple-900">{modal.description}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {modal.inquiry_type === 'shop_request' && modal.status === 'pending' ? (
                  <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                    <button 
                      onClick={() => handleAction(modal._id, 'reject')} 
                      disabled={updating} 
                      className="flex-1 border border-red-200 text-red-600 bg-red-50 py-2.5 rounded-xl font-medium hover:bg-red-100 disabled:opacity-60 transition"
                    >
                      Reject
                    </button>
                    <button 
                      onClick={() => handleAction(modal._id, 'approve')} 
                      disabled={updating} 
                      className="flex-1 bg-green-600 text-white py-2.5 rounded-xl font-medium hover:bg-green-700 disabled:opacity-60 transition shadow-md shadow-green-200"
                    >
                      {updating ? 'Processing...' : 'Approve & Create Account'}
                    </button>
                  </div>
                ) : (
                  <div className="mt-6">
                    <button onClick={() => setModal(null)} className="w-full bg-gray-100 text-gray-700 py-2.5 rounded-xl font-medium hover:bg-gray-200 transition">Close</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactManagement;
