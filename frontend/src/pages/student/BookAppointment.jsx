import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const TIME_SLOTS = ['09:00 AM', '10:00 AM', '11:00 AM', '11:30 AM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:30 PM'];

const BookAppointment = () => {
    const { doctorId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [doctor, setDoctor] = useState(null);
    const [form, setForm] = useState({
        patientName: '',
        symptoms: '',
        date: '',
        timeSlot: '',
        additionalNotes: ''
    });
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        axios.get('http://localhost:5000/api/hospital/doctors')
            .then(res => {
                const found = res.data.find(d => d._id === doctorId);
                setDoctor(found);
                if (user?.name) setForm(f => ({ ...f, patientName: user.name }));
            })
            .catch(err => console.error(err));
    }, [doctorId, user]);

    // Get today's date string for min date input
    const today = new Date().toISOString().split('T')[0];

    const validate = () => {
        const errs = {};
        const lettersOnly = /^[A-Za-z\s]+$/;

        if (!form.patientName.trim()) errs.patientName = 'Patient name is required.';
        else if (!lettersOnly.test(form.patientName)) errs.patientName = 'Name must contain letters only.';

        if (!form.symptoms.trim()) errs.symptoms = 'Symptoms are required.';

        if (!form.date) errs.date = 'Please select a date.';

        if (!form.timeSlot) errs.timeSlot = 'Please select a time slot.';

        return errs;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        // Clear error on change
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleBook = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/hospital/appointments', {
                studentId: user.id,
                doctorId,
                ...form
            });
            setMessage({ text: 'Appointment booked! Awaiting doctor approval.', type: 'success' });
            setTimeout(() => navigate('/student/appointments'), 2000);
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Failed to book appointment.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-10 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Doctor Card Header */}
                {doctor && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 flex items-center gap-5 border border-blue-100">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                            {doctor.userId?.name?.charAt(0) || 'D'}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-blue-900">Dr. {doctor.userId?.name}</h2>
                            <p className="text-gray-500 text-sm">{doctor.specialization}</p>
                            <p className="text-sm text-indigo-600 font-semibold mt-1">Consultation Fee: Rs. {doctor.consultationFee}</p>
                            {doctor.rating > 0 && (
                                <p className="text-sm text-yellow-600 mt-0.5">
                                    {'★'.repeat(Math.round(doctor.rating))}{'☆'.repeat(5 - Math.round(doctor.rating))} ({doctor.rating}/5 · {doctor.reviewCount} reviews)
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Booking Form */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Book an Appointment</h1>
                    <p className="text-gray-500 text-sm mb-6">Fill in the details below to request your appointment</p>

                    {message.text && (
                        <div className={`mb-5 p-4 rounded-xl text-sm font-medium flex items-center gap-2
                            ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            <span>{message.type === 'success' ? '✅' : '❌'}</span> {message.text}
                        </div>
                    )}

                    <form onSubmit={handleBook} className="space-y-5" noValidate>
                        {/* Patient Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Patient Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="patientName"
                                value={form.patientName}
                                onChange={handleChange}
                                placeholder="e.g. Kasun Perera"
                                className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition
                                    ${errors.patientName ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                            />
                            {errors.patientName && <p className="text-red-500 text-xs mt-1">⚠ {errors.patientName}</p>}
                        </div>

                        {/* Symptoms */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Symptoms <span className="text-red-500">*</span></label>
                            <textarea
                                name="symptoms"
                                value={form.symptoms}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Describe your symptoms in detail..."
                                className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition resize-none
                                    ${errors.symptoms ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                            />
                            {errors.symptoms && <p className="text-red-500 text-xs mt-1">⚠ {errors.symptoms}</p>}
                        </div>

                        {/* Date & Time */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Preferred Date <span className="text-red-500">*</span></label>
                                <input
                                    type="date"
                                    name="date"
                                    value={form.date}
                                    min={today}
                                    onChange={handleChange}
                                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition
                                        ${errors.date ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                                />
                                {errors.date && <p className="text-red-500 text-xs mt-1">⚠ {errors.date}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Time Slot <span className="text-red-500">*</span></label>
                                <select
                                    name="timeSlot"
                                    value={form.timeSlot}
                                    onChange={handleChange}
                                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-white
                                        ${errors.timeSlot ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                                >
                                    <option value="">-- Select Time --</option>
                                    {TIME_SLOTS.map(slot => (
                                        <option key={slot} value={slot}>{slot}</option>
                                    ))}
                                </select>
                                {errors.timeSlot && <p className="text-red-500 text-xs mt-1">⚠ {errors.timeSlot}</p>}
                            </div>
                        </div>

                        {/* Additional Notes */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Additional Notes <span className="text-gray-400 font-normal">(optional)</span></label>
                            <textarea
                                name="additionalNotes"
                                value={form.additionalNotes}
                                onChange={handleChange}
                                rows={2}
                                placeholder="Any allergies, previous conditions, or extra information..."
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition resize-none"
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => navigate('/student/doctors')}
                                className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold text-sm hover:from-blue-700 hover:to-indigo-700 transition shadow-md disabled:opacity-60"
                            >
                                {loading ? 'Booking...' : 'Confirm Appointment'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BookAppointment;
