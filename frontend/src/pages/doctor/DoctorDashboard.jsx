import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const DoctorDashboard = () => {
    const { user, logout } = useAuth();
    const [appointments, setAppointments] = useState([]);

    const fetchAppointments = () => {
        if (user && user.doctorId) {
            axios.get(`http://localhost:5000/api/hospital/appointments/doctor/${user.doctorId}`)
                .then(res => setAppointments(res.data))
                .catch(err => console.error(err));
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [user]);

    const handleAction = async (id, action) => {
        try {
            await axios.put(`http://localhost:5000/api/hospital/appointments/${id}/${action}`);
            fetchAppointments(); // Refresh list
        } catch (err) {
            console.error('Failed to update status', err);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-10 pb-4 border-b">
                <h1 className="text-3xl font-bold text-gray-800">Doctor Dashboard (Dr. {user?.name})</h1>
                <button onClick={logout} className="text-red-500 hover:text-red-700 font-semibold">Logout</button>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg mb-8">
                <h2 className="text-xl font-semibold mb-2">Overview</h2>
                <p>Welcome back! You have <strong>{appointments.filter(a => a.status === 'pending').length}</strong> pending appointments to review today.</p>
                <p className="mt-1">Total Patients: <strong>{appointments.length}</strong></p>
            </div>

            <h3 className="text-2xl font-semibold mb-6">Appointments</h3>
            
            {appointments.length === 0 ? (
                <p className="text-gray-500 italic">No appointments booked yet.</p>
            ) : (
                <div className="space-y-4">
                    {appointments.map(app => (
                        <div key={app._id} className="p-5 bg-white shadow rounded-lg border flex justify-between items-center">
                            <div>
                                <h4 className="text-lg font-medium">Patient: {app.studentId?.name || 'Unknown'}</h4>
                                <p className="text-sm text-gray-600">Email: {app.studentId?.email}</p>
                                <p className="text-md mt-2">Requested Slot: <span className="font-semibold text-blue-800">{app.timeSlot}</span></p>
                                <p className="text-sm mt-1 mb-2">
                                    Status: <span className={`uppercase font-bold text-xs px-2 py-1 rounded 
                                        ${app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                        app.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {app.status}
                                    </span>
                                </p>
                            </div>
                            
                            {app.status === 'pending' && (
                                <div className="space-x-3">
                                    <button onClick={() => handleAction(app._id, 'approve')} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow text-sm font-medium">Approve</button>
                                    <button onClick={() => handleAction(app._id, 'reject')} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow text-sm font-medium">Reject</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DoctorDashboard;
