import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const PharmacyDashboard = () => {
    const { user, logout } = useAuth();
    const [prescriptions, setPrescriptions] = useState([]);

    const fetchPrescriptions = () => {
        if (user) {
            axios.get(`http://localhost:5000/api/hospital/prescriptions/pharmacy/${user.id}`)
                .then(res => setPrescriptions(res.data))
                .catch(err => console.error(err));
        }
    };

    useEffect(() => {
        fetchPrescriptions();
    }, [user]);

    const handleAction = async (id, action) => {
        try {
            await axios.put(`http://localhost:5000/api/hospital/prescriptions/${id}/${action}`);
            fetchPrescriptions(); // Refresh list
        } catch (err) {
            console.error('Failed to update status', err);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-10 pb-4 border-b">
                <h1 className="text-3xl font-bold text-gray-800">Pharmacy Dashboard ({user?.name})</h1>
                <button onClick={logout} className="text-red-500 hover:text-red-700 font-semibold">Logout</button>
            </div>

            <div className="bg-teal-50 p-6 rounded-lg mb-8 border border-teal-100">
                <h2 className="text-xl font-semibold text-teal-900 mb-2">Action Required</h2>
                <p className="text-teal-800">You have <strong>{prescriptions.filter(p => p.status === 'pending').length}</strong> pending prescription orders to verify.</p>
            </div>

            <h3 className="text-2xl font-semibold mb-6">Prescription Inbox</h3>
            
            {prescriptions.length === 0 ? (
                <p className="text-gray-500 italic">No prescriptions found.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {prescriptions.map(pres => (
                        <div key={pres._id} className="bg-white p-5 rounded-xl shadow-md border border-gray-200">
                            <div className="mb-4 pb-4 border-b border-gray-100 flex justify-between">
                                <div>
                                    <p className="font-semibold text-lg">Patient: {pres.studentId?.name}</p>
                                    <p className="text-sm text-gray-500">Contact: {pres.studentId?.email}</p>
                                </div>
                                <span className={`self-start uppercase font-bold text-xs px-2 py-1 rounded 
                                    ${pres.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                    pres.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {pres.status}
                                </span>
                            </div>

                            <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-1">Prescribed by: <span className="font-medium text-gray-800">Dr. {pres.appointmentId?.doctorId?.specialization || 'Doctor'}</span></p>
                                <a href={pres.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm font-medium flex items-center mt-2">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                                    View Prescription Document
                                </a>
                            </div>

                            {pres.status === 'pending' && (
                                <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                                    <button onClick={() => handleAction(pres._id, 'approve')} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded font-medium shadow transition">
                                        Accept Order
                                    </button>
                                    <button onClick={() => handleAction(pres._id, 'reject')} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded font-medium shadow transition">
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PharmacyDashboard;
