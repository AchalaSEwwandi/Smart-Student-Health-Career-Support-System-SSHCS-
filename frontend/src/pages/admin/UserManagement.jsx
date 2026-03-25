import { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import PerformanceScoreBar from '../../components/PerformanceScoreBar';
import AddUserModal from '../../components/AddUserModal';

const ROLE_COLORS = {
  student: 'bg-purple-100 text-purple-700',
  doctor: 'bg-teal-100 text-teal-700',
  shop_owner: 'bg-emerald-100 text-emerald-700',
  delivery_person: 'bg-blue-100 text-blue-700',
  admin: 'bg-red-100 text-red-700',
};

const UserManagement = () => {
  const [data, setData] = useState({ users: [], pagination: {} });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [deleteModal, setDeleteModal] = useState(null);
  const [statusModal, setStatusModal] = useState(null);
  const [addUserModal, setAddUserModal] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, ...(search && { search }), ...(roleFilter && { role: roleFilter }) };
      const { data } = await api.get('/admin/users', { params });
      setData(data.data);
    } catch {
      toast.error('Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleStatusToggle = async (user) => {
    try {
      await api.put(`/admin/users/${user._id}/status`, { isActive: !user.isActive });
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}.`);
      setStatusModal(null);
      fetchUsers();
    } catch {
      toast.error('Status update failed.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted.');
      setDeleteModal(null);
      fetchUsers();
    } catch {
      toast.error('Delete failed.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">👥 User Management</h1>
          <p className="text-gray-500 text-sm">{data.pagination?.total || 0} users total</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search name or email..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-800 flex-1 min-w-48"
          />
          <select
            value={roleFilter}
            onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-800"
          >
            <option value="">All Roles</option>
            <option value="student">Student</option>
            <option value="doctor">Doctor</option>
            <option value="shop_owner">Shop Owner</option>
            <option value="delivery_person">Delivery Person</option>
            <option value="admin">Admin</option>
          </select>
          <button
            onClick={() => setAddUserModal(true)}
            className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 ml-auto flex items-center gap-2"
          >
            + Add User
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['User', 'Role', 'Status', 'Performance', 'Registered', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}><td colSpan={6} className="px-4 py-4"><div className="h-8 bg-gray-100 rounded animate-pulse" /></td></tr>
                  ))
                ) : data.users.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-xs shrink-0">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-600'}`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {user.isActive ? '✅ Active' : '❌ Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 w-32">
                      <PerformanceScoreBar score={user.performanceScore} showLabel={false} />
                      <p className="text-xs text-gray-500 mt-0.5">{user.performanceScore?.toFixed(1) || 0}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setStatusModal(user)}
                          className={`text-xs px-2 py-1 rounded-lg font-medium ${user.isActive ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => setDeleteModal(user)}
                          className="text-xs px-2 py-1 rounded-lg font-medium bg-red-50 text-red-600 hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Page {data.pagination?.page || 1} of {data.pagination?.pages || 1}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">← Prev</button>
              <button onClick={() => setPage(p => Math.min(data.pagination?.pages || 1, p + 1))} disabled={page === data.pagination?.pages} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Next →</button>
            </div>
          </div>
        </div>
      </div>

      {/* Status confirmation modal */}
      {statusModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-gray-800 mb-2">{statusModal.isActive ? 'Deactivate' : 'Activate'} User</h3>
            <p className="text-gray-600 text-sm">Are you sure you want to {statusModal.isActive ? 'deactivate' : 'activate'} <strong>{statusModal.name}</strong>?</p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setStatusModal(null)} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleStatusToggle(statusModal)} className="flex-1 bg-blue-900 text-white py-2.5 rounded-xl font-medium hover:bg-blue-800">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-red-600 mb-2">⚠️ Delete User</h3>
            <p className="text-gray-600 text-sm">This will permanently delete <strong>{deleteModal.name}</strong>. This action cannot be undone.</p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setDeleteModal(null)} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDelete(deleteModal._id)} className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-medium hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Add user modal */}
      {addUserModal && (
        <AddUserModal
          onClose={() => setAddUserModal(false)}
          onSuccess={() => {
            setPage(1);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
};

export default UserManagement;
