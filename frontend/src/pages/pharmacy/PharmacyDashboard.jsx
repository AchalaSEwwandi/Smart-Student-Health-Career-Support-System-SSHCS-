import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const STATUS_STYLES = {
    pending:  'bg-yellow-100 text-yellow-800 border-yellow-200',
    accepted: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
};
const STATUS_ICONS = { pending: '⏳', accepted: '✅', rejected: '❌' };

const PharmacyDashboard = () => {
    const { user, logout } = useAuth();
    const [prescriptions, setPrescriptions] = useState([]);
    const [activeTab, setActiveTab] = useState('pending');
    const [loading, setLoading] = useState(true);
    const [previewModal, setPreviewModal] = useState(null);

    const fetchPrescriptions = () => {
        if (user) {
            axios.get(`http://localhost:5000/api/hospital/prescriptions/pharmacy/${user.id}`)
                .then(res => { setPrescriptions(res.data); setLoading(false); })
                .catch(err => { console.error(err); setLoading(false); });
        }
    };

    useEffect(() => { fetchPrescriptions(); }, [user]);

    const handleAction = async (id, action) => {
        try {
            await axios.put(`http://localhost:5000/api/hospital/prescriptions/${id}/${action}`);
            fetchPrescriptions();
        } catch (err) {
            console.error('Failed to update prescription status', err);
        }
    };

    const filtered = {
        pending:  prescriptions.filter(p => p.status === 'pending'),
        accepted: prescriptions.filter(p => p.status === 'accepted'),
        rejected: prescriptions.filter(p => p.status === 'rejected'),
    };

    const PrescriptionCard = ({ pres }) => {
        const isImage = pres.fileType === 'image' || (pres.fileUrl && !pres.fileUrl.endsWith('.pdf'));
        const doctorName = pres.appointmentId?.doctorId?.userId?.name;

        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h3 className="font-bold text-gray-800 text-base">🧑 {pres.studentId?.name || 'Unknown Patient'}</h3>
                        <p className="text-xs text-gray-400">{pres.studentId?.email}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border uppercase ${STATUS_STYLES[pres.status]}`}>
                        {STATUS_ICONS[pres.status]} {pres.status}
                    </span>
                </div>

                {/* Info grid */}
                <div className="bg-gray-50 rounded-xl p-3 mb-3 text-sm">
                    {doctorName && (
                        <div className="mb-1">
                            <span className="text-gray-400 text-xs">Prescribed by</span>
                            <p className="font-medium">Dr. {doctorName}</p>
                        </div>
                    )}
                    {pres.appointmentId?.date && (
                        <div>
                            <span className="text-gray-400 text-xs">Appointment Date</span>
                            <p className="font-medium">{pres.appointmentId.date} · {pres.appointmentId.timeSlot}</p>
                        </div>
                    )}
                    <div className="mt-1">
                        <span className="text-gray-400 text-xs">Received on</span>
                        <p className="font-medium">{new Date(pres.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Prescription Preview */}
                <div
                    className="border border-gray-200 rounded-xl overflow-hidden mb-3 cursor-pointer hover:border-teal-400 transition"
                    onClick={() => setPreviewModal(pres)}
                >
                    {isImage ? (
                        <img
                            src={pres.fileUrl}
                            alt="Prescription"
                            className="w-full h-40 object-cover"
                            onError={e => { e.target.style.display='none'; }}
                        />
                    ) : (
                        <div className="h-24 flex items-center justify-center bg-red-50 gap-3">
                            <span className="text-4xl">📄</span>
                            <div>
                                <p className="text-sm font-semibold text-red-700">PDF Prescription</p>
                                <p className="text-xs text-gray-400">Click to view</p>
                            </div>
                        </div>
                    )}
                    <p className="text-xs text-center text-gray-400 py-1.5 bg-gray-50 border-t border-gray-100">
                        🔍 Click to preview
                    </p>
                </div>

                {/* Actions */}
                {pres.status === 'pending' && (
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleAction(pres._id, 'approve')}
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:from-green-600 hover:to-emerald-700 transition shadow-sm">
                            ✓ Accept Order
                        </button>
                        <button
                            onClick={() => handleAction(pres._id, 'reject')}
                            className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:from-red-600 hover:to-rose-600 transition shadow-sm">
                            ✕ Reject
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50">
            {/* Top Bar */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-xl font-bold shadow">
                            {user?.name?.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-teal-900">🏥 {user?.name}</h1>
                            <p className="text-xs text-gray-500">Pharmacy Dashboard</p>
                        </div>
                    </div>
                    <button onClick={logout} className="text-sm text-red-500 hover:text-red-700 font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition">Logout</button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                        { label: 'Pending', count: filtered.pending.length, icon: '⏳', color: 'yellow' },
                        { label: 'Accepted', count: filtered.accepted.length, icon: '✅', color: 'green' },
                        { label: 'Rejected', count: filtered.rejected.length, icon: '❌', color: 'red' },
                    ].map(s => (
                        <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center">
                            <p className="text-2xl mb-1">{s.icon}</p>
                            <p className="text-3xl font-bold text-gray-800">{s.count}</p>
                            <p className="text-sm text-gray-500 font-medium">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-6 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 w-fit">
                    {[
                        { key: 'pending', label: `⏳ Pending (${filtered.pending.length})` },
                        { key: 'accepted', label: `✅ Accepted (${filtered.accepted.length})` },
                        { key: 'rejected', label: `❌ Rejected (${filtered.rejected.length})` },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition
                                ${activeTab === tab.key
                                    ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow'
                                    : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {loading && (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
                    </div>
                )}

                {!loading && filtered[activeTab]?.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                        <div className="text-5xl mb-3">📭</div>
                        <p className="text-gray-500">No {activeTab} prescriptions.</p>
                    </div>
                )}

                {!loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered[activeTab]?.map(pres => (
                            <PrescriptionCard key={pres._id} pres={pres} />
                        ))}
                    </div>
                )}
            </div>

            {/* Preview Modal */}
            {previewModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
                    onClick={() => setPreviewModal(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-800 text-lg">Prescription Preview</h3>
                            <button onClick={() => setPreviewModal(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                        </div>
                        <p className="text-sm text-gray-500 mb-3">Patient: <strong>{previewModal.studentId?.name}</strong></p>

                        {previewModal.fileType === 'image' || !previewModal.fileUrl?.endsWith('.pdf') ? (
                            <img src={previewModal.fileUrl} alt="Prescription" className="w-full rounded-xl max-h-[60vh] object-contain border border-gray-100" />
                        ) : (
                            <div className="text-center py-10">
                                <div className="text-6xl mb-4">📄</div>
                                <p className="text-gray-600 mb-4">PDF Prescription Document</p>
                                <a href={previewModal.fileUrl} target="_blank" rel="noopener noreferrer"
                                    className="bg-teal-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-teal-700 transition inline-block">
                                    Open PDF ↗
                                </a>
                            </div>
                        )}

                        <div className="mt-4 flex justify-between items-center">
                            <a href={previewModal.fileUrl} target="_blank" rel="noopener noreferrer"
                                className="text-sm text-teal-600 hover:underline">
                                Open in new tab ↗
                            </a>
                            <button onClick={() => setPreviewModal(null)}
                                className="border border-gray-300 text-gray-600 px-4 py-2 rounded-xl text-sm hover:bg-gray-50 transition">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PharmacyDashboard;
