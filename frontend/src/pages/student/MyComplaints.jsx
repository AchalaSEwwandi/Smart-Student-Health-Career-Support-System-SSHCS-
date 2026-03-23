import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const STATUS_CONFIG = {
  pending:      { label: 'Pending',      color: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-400', step: 0 },
  under_review: { label: 'Under Review', color: 'bg-blue-100 text-blue-700 border-blue-200',       dot: 'bg-blue-500',   step: 1 },
  resolved:     { label: 'Resolved',     color: 'bg-green-100 text-green-700 border-green-200',    dot: 'bg-green-500',  step: 2 },
  dismissed:    { label: 'Dismissed',    color: 'bg-gray-100 text-gray-600 border-gray-200',       dot: 'bg-gray-400',   step: 2 },
};

const PRIORITY_CONFIG = {
  high:   { label: '🔴 High',   classes: 'bg-red-50 text-red-600' },
  medium: { label: '🟡 Medium', classes: 'bg-yellow-50 text-yellow-600' },
  low:    { label: '🟢 Low',    classes: 'bg-green-50 text-green-600' },
};

const ComplaintTimeline = ({ status }) => {
  const steps = ['Pending', 'Under Review', 'Resolved'];
  const current = STATUS_CONFIG[status]?.step ?? 0;
  const isDismissed = status === 'dismissed';

  return (
    <div className="flex items-center gap-0 mt-3">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center flex-1 last:flex-none">
          <div className={`flex flex-col items-center`}>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs
              ${isDismissed && i === 2 ? 'border-gray-400 bg-gray-400' :
                i <= current ? 'border-blue-900 bg-blue-900' : 'border-gray-300 bg-white'}`}>
              {i <= current || isDismissed ? <span className="text-white text-xs">✓</span> : null}
            </div>
            <span className={`text-xs mt-1 font-medium ${i <= current ? 'text-blue-800' : 'text-gray-400'}`}>
              {isDismissed && i === 2 ? 'Dismissed' : s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1 ${i < current ? 'bg-blue-900' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
};

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/complaints/my')
      .then(({ data }) => setComplaints(data.data.complaints || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? complaints : complaints.filter(c => c.status === filter);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">📋 My Complaints</h1>
            <p className="text-gray-500 text-sm">{complaints.length} complaint{complaints.length !== 1 ? 's' : ''} total</p>
          </div>
          <div className="flex gap-2">
            {['all', 'pending', 'under_review', 'resolved', 'dismissed'].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${filter === s ? 'bg-blue-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
              >
                {s === 'all' ? 'All' : s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-40 bg-white rounded-xl animate-pulse border border-gray-100" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-500">No complaints found.</p>
            <Link to="/student/complaint" className="mt-3 inline-block text-blue-700 font-medium hover:underline text-sm">+ File a Complaint</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(c => {
              const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.pending;
              const pCfg = PRIORITY_CONFIG[c.priority] || PRIORITY_CONFIG.medium;
              return (
                <div key={c._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-gray-800">{c.subject}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pCfg.classes}`}>{pCfg.label}</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">
                        {c.category} · Against: {c.againstUser?.name || c.againstUser} · {new Date(c.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600 line-clamp-2">{c.description}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs rounded-full font-semibold border ${cfg.color} whitespace-nowrap`}>{cfg.label}</span>
                  </div>

                  <ComplaintTimeline status={c.status} />

                  {c.adminNote && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                      <p className="text-xs font-semibold text-blue-800 mb-1">Admin Note:</p>
                      <p className="text-sm text-blue-700">{c.adminNote}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 text-center">
          <Link to="/student/complaint" className="inline-block bg-blue-900 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-800 transition-colors">
            + File New Complaint
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MyComplaints;
