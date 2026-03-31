import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const STATUS_STYLES = {
    pending:  'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
};

const DoctorDashboard = () => {
    const { user, logout } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);
    const [doctorInfo, setDoctorInfo] = useState(null);
    const [activeTab, setActiveTab] = useState('appointments');
    const [loading, setLoading] = useState(true);

    const fetchAll = () => {
        if (user && user.doctorId) {
            Promise.all([
                axios.get(`http://localhost:5000/api/hospital/appointments/doctor/${user.doctorId}`),
                axios.get(`http://localhost:5000/api/hospital/feedback/doctor/${user.doctorId}`),
                axios.get('http://localhost:5000/api/hospital/doctors')
            ]).then(([appRes, fbRes, drRes]) => {
                setAppointments(appRes.data);
                setFeedbacks(fbRes.data);
                const me = drRes.data.find(d => d._id === user.doctorId);
                setDoctorInfo(me);
                setLoading(false);
            }).catch(err => { console.error(err); setLoading(false); });
        }
    };

    useEffect(() => { fetchAll(); }, [user]);

    const handleAction = async (id, action) => {
        try {
            await axios.put(`http://localhost:5000/api/hospital/appointments/${id}/${action}`);
            fetchAll();
        } catch (err) {
            console.error('Failed to update status', err);
        }
    };

    const pending  = appointments.filter(a => a.status === 'pending');
    const approved = appointments.filter(a => a.status === 'approved');
    const rejected = appointments.filter(a => a.status === 'rejected');

    const avgRating = doctorInfo?.rating || 0;
    const reviewCount = doctorInfo?.reviewCount || 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Top Bar */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow">
                            {user?.name?.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-blue-900">Dr. {user?.name}</h1>
                            <p className="text-xs text-gray-500">{doctorInfo?.specialization} · Consultation Fee: Rs. {doctorInfo?.consultationFee}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {avgRating > 0 && (
                            <div className="text-sm bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-1">
                                <span className="text-yellow-500">{'★'.repeat(Math.round(avgRating))}</span>
                                <span className="text-gray-500 ml-1">{avgRating}/5 ({reviewCount} reviews)</span>
                            </div>
                        )}
                        <button onClick={logout} className="text-sm text-red-500 hover:text-red-700 font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition">Logout</button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total', count: appointments.length, icon: '📋', color: 'blue' },
                        { label: 'Pending', count: pending.length, icon: '⏳', color: 'yellow' },
                        { label: 'Approved', count: approved.length, icon: '✅', color: 'green' },
                        { label: 'Avg Rating', count: avgRating > 0 ? `${avgRating}★` : 'N/A', icon: '⭐', color: 'orange' },
                    ].map(s => (
                        <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
                            <p className="text-2xl mb-1">{s.icon}</p>
                            <p className="text-2xl font-bold text-gray-800">{s.count}</p>
                            <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-6 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 w-fit">
                    {[
                        { key: 'appointments', label: '📋 Appointments' },
                        { key: 'history', label: '📁 History' },
                        { key: 'ratings', label: `⭐ Ratings (${feedbacks.length})` },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-5 py-2 rounded-xl text-sm font-semibold transition
                                ${activeTab === tab.key
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow'
                                    : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {loading && (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                )}

                {/* Appointments Tab */}
                {!loading && activeTab === 'appointments' && (
                    <div>
                        <h2 className="text-lg font-bold text-gray-700 mb-4">⏳ Pending Appointments ({pending.length})</h2>
                        {pending.length === 0 ? (
                            <div className="bg-white rounded-2xl p-10 text-center text-gray-400 border border-gray-100">
                                No pending appointments at the moment.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {pending.map(app => (
                                    <AppointmentCard key={app._id} app={app} onAction={handleAction} showActions={true} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* History Tab */}
                {!loading && activeTab === 'history' && (
                    <div>
                        <h2 className="text-lg font-bold text-gray-700 mb-4">📁 All Appointments ({appointments.length})</h2>
                        {appointments.length === 0 ? (
                            <div className="bg-white rounded-2xl p-10 text-center text-gray-400 border border-gray-100">
                                No appointment history yet.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {appointments.map(app => (
                                    <AppointmentCard key={app._id} app={app} onAction={handleAction} showActions={app.status === 'pending'} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Ratings Tab */}
                {!loading && activeTab === 'ratings' && (
                    <div>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 flex items-center gap-6">
                            <div className="text-center">
                                <p className="text-5xl font-bold text-yellow-500">{avgRating || '—'}</p>
                                <p className="text-xs text-gray-500 mt-1">Average Rating</p>
                            </div>
                            <div>
                                <div className="flex gap-1 mb-1">
                                    {[1,2,3,4,5].map(s => (
                                        <span key={s} className={`text-2xl ${s <= Math.round(avgRating) ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                                    ))}
                                </div>
                                <p className="text-sm text-gray-500">Based on {reviewCount} patient review{reviewCount !== 1 ? 's' : ''}</p>
                            </div>
                        </div>
                        {feedbacks.length === 0 ? (
                            <div className="bg-white rounded-2xl p-10 text-center text-gray-400 border border-gray-100">No ratings received yet.</div>
                        ) : (
                            <div className="space-y-3">
                                {feedbacks.map(fb => (
                                    <div key={fb._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-semibold text-gray-800">{fb.studentId?.name || 'Anonymous'}</p>
                                                <p className="text-xs text-gray-400">{new Date(fb.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex gap-0.5">
                                                {[1,2,3,4,5].map(s => (
                                                    <span key={s} className={s <= fb.rating ? 'text-yellow-400 text-lg' : 'text-gray-200 text-lg'}>★</span>
                                                ))}
                                            </div>
                                        </div>
                                        {fb.comment && <p className="text-sm text-gray-600 italic">"{fb.comment}"</p>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// ── Appointment Card Sub-component ─────────────────────────────────────────
const AppointmentCard = ({ app, onAction, showActions }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
        <div className="flex justify-between items-start mb-3">
            <div>
                <h3 className="font-bold text-gray-800 text-base">🧑‍⚕️ {app.studentId?.name || 'Unknown Patient'}</h3>
                <p className="text-xs text-gray-400">{app.studentId?.email}</p>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border uppercase ${STATUS_STYLES[app.status]}`}>
                {app.status}
            </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm bg-gray-50 rounded-xl p-3 mb-3">
            <div><span className="text-gray-400 text-xs block">Patient Name</span><span className="font-medium">{app.patientName}</span></div>
            <div><span className="text-gray-400 text-xs block">Date & Time</span><span className="font-medium">{app.date} · {app.timeSlot}</span></div>
            <div className="col-span-2"><span className="text-gray-400 text-xs block">Symptoms</span><span className="font-medium">{app.symptoms}</span></div>
            {app.additionalNotes && (
                <div className="col-span-2"><span className="text-gray-400 text-xs block">Additional Notes</span><span className="font-medium text-gray-600">{app.additionalNotes}</span></div>
            )}
        </div>

        {/* Feedback from student */}
        {app.feedback && (
            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 mb-3 text-sm">
                <p className="text-xs font-semibold text-yellow-700 mb-1">Patient Rating</p>
                <div className="flex gap-0.5 mb-1">
                    {[1,2,3,4,5].map(s => (
                        <span key={s} className={s <= app.feedback.rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                    ))}
                    <span className="text-xs text-gray-500 ml-1">{app.feedback.rating}/5</span>
                </div>
                {app.feedback.comment && <p className="text-gray-500 text-xs italic">"{app.feedback.comment}"</p>}
            </div>
        )}

        {showActions && (
            <div className="flex gap-3">
                <button
                    onClick={() => onAction(app._id, 'approve')}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 rounded-xl text-sm font-semibold hover:from-green-600 hover:to-emerald-700 transition shadow-sm">
                    ✓ Approve
                </button>
                <button
                    onClick={() => onAction(app._id, 'reject')}
                    className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 text-white py-2 rounded-xl text-sm font-semibold hover:from-red-600 hover:to-rose-600 transition shadow-sm">
                    ✕ Reject
                </button>
            </div>
        )}
    </div>
);

export default DoctorDashboard;
