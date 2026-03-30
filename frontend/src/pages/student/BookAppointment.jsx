import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const BookAppointment = () => {
    const { doctorId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [timeSlot, setTimeSlot] = useState('');
    const [message, setMessage] = useState('');

    const handleBook = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/hospital/appointments', {
                studentId: user.id,
                doctorId: doctorId,
                timeSlot
            });
            setMessage('Appointment booked successfully! Waiting for doctor approval.');
            setTimeout(() => navigate('/student/appointments'), 2000);
        } catch (err) {
            setMessage('Failed to book appointment.');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-16 p-6 bg-white shadow-lg rounded-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Book a Time Slot</h2>
            {message && <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded">{message}</div>}
            
            <form onSubmit={handleBook} className="space-y-4">
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Select Time Slot</label>
                    <select required value={timeSlot} onChange={e => setTimeSlot(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm p-3 border">
                        <option value="">-- Choose Time --</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="11:30 AM">11:30 AM</option>
                        <option value="02:00 PM">02:00 PM</option>
                        <option value="04:00 PM">04:00 PM</option>
                        <option value="06:30 PM">06:30 PM</option>
                    </select>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-semibold p-3 rounded-md hover:bg-blue-700">
                    Confirm Booking
                </button>
            </form>
        </div>
    );
};

export default BookAppointment;
