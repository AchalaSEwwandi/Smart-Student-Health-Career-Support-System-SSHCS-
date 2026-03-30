import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const MyAppointments = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        if (user) {
            axios.get(`http://localhost:5000/api/hospital/appointments/student/${user.id}`)
                .then(res => setAppointments(res.data))
                .catch(err => console.error(err));
        }
    }, [user]);

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 border-b pb-4">My Appointments</h1>
            {appointments.length === 0 ? (
                <p className="text-gray-500">You have no appointments yet. <Link to="/student/doctors" className="text-blue-600 underline">Book one here.</Link></p>
            ) : (
                <div className="space-y-4">
                    {appointments.map(app => (
                        <div key={app._id} className="p-5 bg-white border border-gray-200 shadow rounded-lg flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold text-lg text-blue-900">Dr. {app.doctorId?.userId?.name || 'Unknown'}</h3>
                                <p className="text-gray-600">Time Slot: {app.timeSlot}</p>
                                <p className="text-sm mt-1">Status: 
                                    <span className={`ml-2 px-2 py-1 rounded text-xs font-bold uppercase 
                                        ${app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                          app.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {app.status}
                                    </span>
                                </p>
                            </div>
                            
                            {app.status === 'approved' && (
                                <div className="text-right flex flex-col items-end gap-2">
                                    <Link to={`/student/upload-prescription/${app._id}`} className="inline-block bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 text-sm">
                                        Upload Prescription
                                    </Link>
                                    <button onClick={() => alert('Contact Doctor feature initiated!')} className="inline-block border border-blue-600 outline-blue-600 text-blue-600 bg-white px-4 py-2 rounded-md hover:bg-blue-50 text-sm">
                                        ✉ Contact Doctor
                                    </button>
                                    <button onClick={() => alert('Feedback submitted successfully!')} className="inline-block text-gray-500 hover:text-yellow-600 text-sm font-medium mt-1">
                                        ★ Rate Doctor
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
            <div className="mt-8 text-center">
                <Link to="/student/doctors" className="text-blue-600 hover:text-blue-800 underline">← Back to Doctors List</Link>
            </div>
        </div>
    );
};

export default MyAppointments;
