import { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const STATUS_CONFIG = {
  pending:      { label: 'Pending',      color: 'bg-yellow-100 text-yellow-700' },
  under_review: { label: 'Under Review', color: 'bg-blue-100 text-blue-700' },
  resolved:     { label: 'Resolved',     color: 'bg-green-100 text-green-700' },
  dismissed:    { label: 'Dismissed',    color: 'bg-gray-100 text-gray-600' },
};

const PRIORITY_CONFIG = {
  high:   { label: '🔴 High',   color: 'bg-red-50 text-red-600' },
  medium: { label: '🟡 Medium', color: 'bg-yellow-50 text-yellow-600' },
  low:    { label: '🟢 Low',    color: 'bg-green-50 text-green-600' },
};

const ComplaintManagement = () => {
  const [data, setData] = useState({ complaints: [], pagination: {} });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ status: '', category: '', priority: '' });
  const [modal, setModal] = useState(null); // { complaint }
  const [updating, setUpdating] = useState(false);
  const [editForm, setEditForm] = useState({ status: '', adminNote: '', priority: '' });

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
      const { data } = await api.get('/admin/complaints', { params });
      setData(data.data);
    } catch {
      toast.error('Failed to load complaints.');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  const openModal = (c) => {
    setModal(c);
    setEditForm({ status: c.status, adminNote: c.adminNote || '', priority: c.priority });
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await api.put(`/admin/complaints/${modal._id}`, editForm);
      toast.success('Complaint updated.');
      setModal(null);
      fetchComplaints();
    } catch {
      toast.error('Update failed.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">📋 Complaint Management</h1>
          <p className="text-gray-500 text-sm">{data.pagination?.total || 0} complaints total</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-wrap gap-3">
          {[
            { key: 'status', options: [{ value: '', label: 'All Status' }, { value: 'pending', label: 'Pending' }, { value: 'under_review', label: 'Under Review' }, { value: 'resolved', label: 'Resolved' }, { value: 'dismissed', label: 'Dismissed' }] },
            { key: 'category', options: [{ value: '', label: 'All Categories' }, { value: 'delivery', label: 'Delivery' }, { value: 'shop', label: 'Shop' }, { value: 'doctor', label: 'Doctor' }, { value: 'platform', label: 'Platform' }] },
            { key: 'priority', options: [{ value: '', label: 'All Priority' }, { value: 'high', label: '🔴 High' }, { value: 'medium', label: '🟡 Medium' }, { value: 'low', label: '🟢 Low' }] },
          ].map(({ key, options }) => (
            <select
              key={key}
              value={filters[key]}
              onChange={e => { setFilters(f => ({ ...f, [key]: e.target.value })); setPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-800"
            >
              {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Submitted By', 'Against', 'Category', 'Subject', 'Priority', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}><td colSpan={8}><div className="h-8 bg-gray-100 rounded animate-pulse m-4" /></td></tr>
                  ))
                ) : data.complaints.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-400">No complaints found</td></tr>
                ) : data.complaints.map(c => {
                  const sc = STATUS_CONFIG[c.status] || STATUS_CONFIG.pending;
                  const pc = PRIORITY_CONFIG[c.priority] || PRIORITY_CONFIG.medium;
                  return (
                    <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm">{c.submittedBy?.name || '?'}</td>
                      <td className="px-4 py-3 text-sm">{c.againstUser?.name || '?'}</td>
                      <td className="px-4 py-3 text-xs capitalize">{c.category}</td>
                      <td className="px-4 py-3 text-sm max-w-36 truncate">{c.subject}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${pc.color}`}>{pc.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${sc.color}`}>{sc.label}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => openModal(c)} className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium">Manage</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">Page {data.pagination?.page || 1} of {data.pagination?.pages || 1}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40">← Prev</button>
              <button onClick={() => setPage(p => Math.min(data.pagination?.pages || 1, p + 1))} disabled={page === data.pagination?.pages} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40">Next →</button>
            </div>
          </div>
        </div>
      </div>

      {/* Detail / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-gray-800 text-lg mb-1">{modal.subject}</h3>
            <p className="text-xs text-gray-500 mb-4">{modal.category} · {modal.submittedBy?.name} → {modal.againstUser?.name}</p>
            <p className="text-sm text-gray-700 mb-5 bg-gray-50 p-3 rounded-lg">{modal.description}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-800">
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="resolved">Resolved</option>
                  <option value="dismissed">Dismissed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select value={editForm.priority} onChange={e => setEditForm(f => ({ ...f, priority: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-800">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Note</label>
                <textarea value={editForm.adminNote} onChange={e => setEditForm(f => ({ ...f, adminNote: e.target.value }))} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-800 resize-none" placeholder="Add a note visible to the student..." />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(null)} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={handleUpdate} disabled={updating} className="flex-1 bg-blue-900 text-white py-2.5 rounded-xl font-medium hover:bg-blue-800 disabled:opacity-60">
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintManagement;
