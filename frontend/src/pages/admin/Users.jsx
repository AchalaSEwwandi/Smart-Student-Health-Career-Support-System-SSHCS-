import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';

const ROLE_BADGE = {
  student:         { label: 'Student',    cls: 'bg-indigo-100 text-indigo-700' },
  doctor:          { label: 'Doctor',     cls: 'bg-emerald-100 text-emerald-700' },
  shop_owner:      { label: 'Vendor',     cls: 'bg-orange-100 text-orange-700' },
  delivery_person: { label: 'Delivery',   cls: 'bg-purple-100 text-purple-700' },
  admin:           { label: 'Admin',      cls: 'bg-blue-100 text-blue-700' },
};

const STATUS_BADGE = {
  approved: 'bg-green-100 text-green-700',
  pending:  'bg-amber-100 text-amber-700',
};

const Badge = ({ cls, label }) => (
  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>{label}</span>
);

const AdminUsers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [actionId, setActionId] = useState(null); // loading state per row

  const filterStatus = searchParams.get('status') || '';
  const filterRole   = searchParams.get('role')   || '';

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterRole)   params.role   = filterRole;
      const { data } = await api.get('/admin/users', { params });
      setUsers(data.data || []);
    } catch {
      toast.error('Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterRole]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const approve = async (id, name) => {
    setActionId(id);
    try {
      await api.patch(`/admin/users/${id}/approve`);
      toast.success(`✅ ${name}'s account approved! Notification email sent.`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval failed.');
    } finally {
      setActionId(null);
    }
  };

  const reject = async (id, name) => {
    if (!window.confirm(`Reject and deactivate ${name}'s account?`)) return;
    setActionId(id);
    try {
      await api.patch(`/admin/users/${id}/reject`);
      toast.info(`${name}'s account has been rejected.`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rejection failed.');
    } finally {
      setActionId(null);
    }
  };

  const setFilter = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set(key, val); else next.delete(key);
    setSearchParams(next);
  };

  const pendingCount = users.filter((u) => u.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-8 py-10">
        <h1 className="text-3xl font-bold text-white">User Management</h1>
        <p className="text-blue-200 mt-1 text-sm">Approve or reject pending doctor &amp; vendor accounts</p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* Pending banner */}
        {pendingCount > 0 && !loading && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-2xl">⏳</span>
            <div>
              <p className="font-semibold text-amber-800">
                {pendingCount} account{pendingCount > 1 ? 's' : ''} waiting for approval
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                Review and approve doctor or vendor registrations below.
              </p>
            </div>
            {filterStatus !== 'pending' && (
              <button onClick={() => setFilter('status', 'pending')}
                className="ml-auto bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition">
                Show Pending
              </button>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-wrap gap-3 items-center">
          <span className="text-sm font-medium text-gray-600 mr-1">Filter:</span>

          {/* Status */}
          {['', 'pending', 'approved'].map((s) => (
            <button key={s} onClick={() => setFilter('status', s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
                filterStatus === s
                  ? 'bg-blue-700 text-white border-blue-700'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}>
              {s === '' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}

          <div className="h-5 w-px bg-gray-200 mx-1" />

          {/* Role */}
          {[
            { val: '', label: 'All Roles' },
            { val: 'student', label: '🎓 Students' },
            { val: 'doctor',  label: '🩺 Doctors' },
            { val: 'shop_owner', label: '🏪 Vendors' },
          ].map(({ val, label }) => (
            <button key={val} onClick={() => setFilter('role', val)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
                filterRole === val
                  ? 'bg-blue-700 text-white border-blue-700'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}>
              {label}
            </button>
          ))}

          <button onClick={() => { setSearchParams({}); }}
            className="ml-auto text-xs text-gray-400 hover:text-gray-600 underline">
            Clear filters
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-blue-700 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-5xl mb-3">🔍</p>
              <p className="text-lg font-medium">No users found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Name', 'Email', 'Phone', 'Role', 'Details', 'Status', 'Joined', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((u) => (
                    <tr key={u._id} className={`hover:bg-gray-50 transition ${u.status === 'pending' ? 'bg-amber-50/40' : ''}`}>
                      {/* Name */}
                      <td className="px-5 py-4 font-medium text-gray-800 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          {u.name}
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-4 text-gray-600">{u.email}</td>

                      {/* Phone */}
                      <td className="px-5 py-4 text-gray-500">{u.phone || '—'}</td>

                      {/* Role */}
                      <td className="px-5 py-4">
                        <Badge {...(ROLE_BADGE[u.role] || { label: u.role, cls: 'bg-gray-100 text-gray-600' })} />
                      </td>

                      {/* Role-specific detail */}
                      <td className="px-5 py-4 text-gray-500 text-xs max-w-[160px]">
                        {u.role === 'student' && u.faculty && (
                          <span>{u.faculty} · Yr {u.year} Sem {u.semester}</span>
                        )}
                        {u.role === 'doctor' && (
                          <span>{u.specialization || '—'}{u.hospitalName ? ` · ${u.hospitalName}` : ''}</span>
                        )}
                        {u.role === 'shop_owner' && (
                          <span>{u.shopName || '—'}{u.businessType ? ` (${u.businessType})` : ''}</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <Badge cls={STATUS_BADGE[u.status] || 'bg-gray-100 text-gray-600'}
                          label={u.status === 'pending' ? '⏳ Pending' : '✅ Approved'} />
                      </td>

                      {/* Joined */}
                      <td className="px-5 py-4 text-gray-400 whitespace-nowrap">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {u.status === 'pending' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => approve(u._id, u.name)}
                              disabled={actionId === u._id}
                              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50">
                              {actionId === u._id ? '…' : '✓ Approve'}
                            </button>
                            <button
                              onClick={() => reject(u._id, u.name)}
                              disabled={actionId === u._id}
                              className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold rounded-lg transition disabled:opacity-50">
                              ✕ Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No action needed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400 text-right">{users.length} user{users.length !== 1 ? 's' : ''} shown</p>
      </div>
    </div>
  );
};

export default AdminUsers;
