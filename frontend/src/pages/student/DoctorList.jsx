import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const DoctorList = () => {
    const [doctors, setDoctors] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        axios.get('http://localhost:5000/api/hospital/doctors')
            .then(res => setDoctors(res.data))
            .catch(err => console.error(err));
    }, []);

    const filtered = doctors.filter(doc => 
        doc.userId?.name.toLowerCase().includes(search.toLowerCase()) ||
        doc.specialization.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Available Doctors</h1>
                <Link to="/student/appointments" className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200">My Appointments</Link>
            </div>
            
            <input 
                type="text" 
                placeholder="Search by name or specialization..." 
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm mb-6"
                value={search}
                onChange={e => setSearch(e.target.value)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(doc => (
                    <div key={doc._id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h2 className="text-xl font-semibold text-blue-900 border-b pb-2 mb-2">Dr. {doc.userId?.name}</h2>
                        <p className="text-gray-600 mb-1"><strong>Specialization:</strong> {doc.specialization}</p>
                        <p className="text-gray-600 mb-4"><strong>Fee:</strong> Rs{doc.consultationFee}</p>
                        <Link to={`/student/book/${doc._id}`} className="block text-center w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition">
                            Book Appointment
                        </Link>
                    </div>
                ))}
            </div>
            {filtered.length === 0 && <p className="text-gray-500 mt-4 text-center">No doctors found matching your criteria.</p>}
        </div>
    );
};

export default DoctorList;
