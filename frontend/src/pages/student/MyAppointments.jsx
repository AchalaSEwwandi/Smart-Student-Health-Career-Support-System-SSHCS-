import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const STATUS_STYLES = {
    pending:  'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
};
const STATUS_ICONS = { pending: '⏳', approved: '✅', rejected: '❌' };

// ── Feedback Modal ──────────────────────────────────────────────────────────
const FeedbackModal = ({ appointment, onClose, onSubmitted }) => {
    const { user } = useAuth();
    const [rating, setRating] = useState(0);
    const [hovered, setHovered] = useState(0);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) { setError('Please select a star rating.'); return; }
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/hospital/feedback', {
                appointmentId: appointment._id,
                studentId: user.id,
                doctorId: appointment.doctorId?._id,
                rating,
                comment
            });
            onSubmitted();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit feedback.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-fadeIn">
                <h3 className="text-xl font-bold text-gray-800 mb-1">Rate Your Experience</h3>
                <p className="text-sm text-gray-500 mb-5">with Dr. {appointment.doctorId?.userId?.name}</p>

                {/* Star picker */}
                <div className="flex gap-2 mb-4">
                    {[1,2,3,4,5].map(s => (
                        <button
                            key={s}
                            onClick={() => setRating(s)}
                            onMouseEnter={() => setHovered(s)}
                            onMouseLeave={() => setHovered(0)}
                            className={`text-4xl transition ${(hovered || rating) >= s ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                            ★
                        </button>
                    ))}
                </div>
                {rating > 0 && (
                    <p className="text-sm text-gray-600 mb-3">
                        {['','Poor','Fair','Good','Very Good','Excellent'][rating]} — {rating}/5 stars
                    </p>
                )}

                <textarea
                    rows={3}
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Share your experience (optional)..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 mb-3"
                />
                {error && <p className="text-red-500 text-xs mb-3">⚠ {error}</p>}

                <div className="flex gap-3">
                    <button onClick={onClose}
                        className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={loading}
                        className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white py-2.5 rounded-xl text-sm font-semibold hover:from-yellow-500 hover:to-orange-500 transition shadow disabled:opacity-60">
                        {loading ? 'Submitting...' : 'Submit Rating'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Main Component ──────────────────────────────────────────────────────────
const MyAppointments = () => {
    const { user, logout } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [feedbackModal, setFeedbackModal] = useState(null); // holds appointment obj

    const fetchAppointments = () => {
        if (user) {
            axios.get(`http://localhost:5000/api/hospital/appointments/student/${user.id}`)
                .then(res => { setAppointments(res.data); setLoading(false); })
                .catch(err => { console.error(err); setLoading(false); });
        }
    };

    useEffect(() => { fetchAppointments(); }, [user]);

    const grouped = {
        pending:  appointments.filter(a => a.status === 'pending'),
        approved: appointments.filter(a => a.status === 'approved'),
        rejected: appointments.filter(a => a.status === 'rejected'),
    };

    const AppointmentCard = ({ app }) => {
        const hasFeedback = !!app.feedback;
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h3 className="font-bold text-blue-900 text-base">Dr. {app.doctorId?.userId?.name || 'Unknown'}</h3>
                        <p className="text-xs text-gray-400">{app.doctorId?.specialization}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border uppercase ${STATUS_STYLES[app.status]}`}>
                        {STATUS_ICONS[app.status]} {app.status}
                    </span>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm bg-gray-50 rounded-xl p-3 mb-3">
                    <div><span className="text-gray-400 text-xs">Patient</span><p className="font-medium text-gray-700">{app.patientName}</p></div>
                    <div><span className="text-gray-400 text-xs">Date & Time</span><p className="font-medium text-gray-700">{app.date} · {app.timeSlot}</p></div>
                    <div className="col-span-2"><span className="text-gray-400 text-xs">Symptoms</span><p className="font-medium text-gray-700">{app.symptoms}</p></div>
                    {app.additionalNotes && (
                        <div className="col-span-2"><span className="text-gray-400 text-xs">Notes</span><p className="font-medium text-gray-700">{app.additionalNotes}</p></div>
                    )}
                    <div><span className="text-gray-400 text-xs">Consultation Fee</span><p className="font-medium text-indigo-700">Rs. {app.doctorId?.consultationFee}</p></div>
                </div>

                {/* Feedback display */}
                {hasFeedback && (
                    <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 mb-3 text-sm">
                        <p className="font-semibold text-yellow-700 mb-1">Your Rating</p>
                        <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(s => (
                                <span key={s} className={s <= app.feedback.rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                            ))}
                            <span className="text-xs text-gray-500 ml-2">{app.feedback.rating}/5</span>
                        </div>
                        {app.feedback.comment && <p className="text-gray-600 mt-1 text-xs italic">"{app.feedback.comment}"</p>}
                    </div>
                )}

                {/* Actions for approved */}
                {app.status === 'approved' && (
                    <div className="flex flex-wrap gap-2">
                        <Link to={`/student/upload-prescription/${app._id}`}
                            className="flex-1 text-center bg-teal-600 text-white px-3 py-2 rounded-xl text-sm font-semibold hover:bg-teal-700 transition shadow-sm">
                            📄 Upload Prescription
                        </Link>
                        {!hasFeedback && (
                            <button
                                onClick={() => setFeedbackModal(app)}
                                className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-2 rounded-xl text-sm font-semibold hover:from-yellow-500 hover:to-orange-500 transition shadow-sm">
                                ★ Rate Doctor
                            </button>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Top Bar */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-blue-900">My Appointments</h1>
                        <p className="text-sm text-gray-500">Track all your appointment requests</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/student/doctors"
                            className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-100 transition border border-blue-200">
                            + Book New
                        </Link>
                        <button onClick={logout} className="text-sm text-red-500 hover:text-red-700 font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition">Logout</button>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-8">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                        { label: 'Pending', count: grouped.pending.length, color: 'yellow' },
                        { label: 'Approved', count: grouped.approved.length, color: 'green' },
                        { label: 'Rejected', count: grouped.rejected.length, color: 'red' },
                    ].map(s => (
                        <div key={s.label} className={`bg-${s.color}-50 border border-${s.color}-100 rounded-2xl p-4 text-center`}>
                            <p className={`text-3xl font-bold text-${s.color}-600`}>{s.count}</p>
                            <p className={`text-sm text-${s.color}-700 font-medium`}>{s.label}</p>
                        </div>
                    ))}
                </div>

                {loading && (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                )}

                {!loading && appointments.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-5xl mb-4">📋</div>
                        <p className="text-gray-600 font-medium">No appointments yet.</p>
                        <Link to="/student/doctors" className="mt-3 inline-block text-blue-600 hover:underline text-sm">Browse doctors to book one →</Link>
                    </div>
                )}

                {/* Approved */}
                {!loading && grouped.approved.length > 0 && (
                    <section className="mb-8">
                        <h2 className="text-lg font-bold text-green-700 mb-3 flex items-center gap-2">✅ Approved Appointments</h2>
                        <div className="space-y-4">{grouped.approved.map(a => <AppointmentCard key={a._id} app={a} />)}</div>
                    </section>
                )}

                {/* Pending */}
                {!loading && grouped.pending.length > 0 && (
                    <section className="mb-8">
                        <h2 className="text-lg font-bold text-yellow-700 mb-3 flex items-center gap-2">⏳ Pending Approval</h2>
                        <div className="space-y-4">{grouped.pending.map(a => <AppointmentCard key={a._id} app={a} />)}</div>
                    </section>
                )}

                {/* Rejected */}
                {!loading && grouped.rejected.length > 0 && (
                    <section className="mb-8">
                        <h2 className="text-lg font-bold text-red-600 mb-3 flex items-center gap-2">❌ Rejected</h2>
                        <div className="space-y-4">{grouped.rejected.map(a => <AppointmentCard key={a._id} app={a} />)}</div>
                    </section>
                )}
            </div>

            {/* Feedback Modal */}
            {feedbackModal && (
                <FeedbackModal
                    appointment={feedbackModal}
                    onClose={() => setFeedbackModal(null)}
                    onSubmitted={fetchAppointments}
                />
            )}
        </div>
    );
};

export default MyAppointments;
