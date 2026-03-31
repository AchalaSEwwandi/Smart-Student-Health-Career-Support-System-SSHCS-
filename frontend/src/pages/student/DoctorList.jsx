import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const StarRating = ({ rating, count }) => {
    const filled = Math.round(rating);
    return (
        <div className="flex items-center gap-1 mt-1">
            {[1,2,3,4,5].map(i => (
                <span key={i} className={`text-base ${i <= filled ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
            ))}
            <span className="text-xs text-gray-500 ml-1">{rating > 0 ? `${rating}/5` : 'No ratings'} {count > 0 ? `(${count})` : ''}</span>
        </div>
    );
};

const SPECIALIZATIONS = ['All', 'General Medicine', 'Cardiology', 'Dermatology', 'Orthopedics',
    'Pediatrics', 'Psychiatry', 'Neurology', 'Gynecology', 'ENT', 'Ophthalmology', 'Other'];

const DoctorList = () => {
    const [doctors, setDoctors] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedSpec, setSelectedSpec] = useState('All');
    const [loading, setLoading] = useState(true);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:5000/api/hospital/doctors')
            .then(res => { setDoctors(res.data); setLoading(false); })
            .catch(err => { console.error(err); setLoading(false); });
    }, []);

    const filtered = doctors.filter(doc => {
        const matchSearch = doc.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
            doc.specialization?.toLowerCase().includes(search.toLowerCase());
        const matchSpec = selectedSpec === 'All' || doc.specialization === selectedSpec;
        return matchSearch && matchSpec;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Top Bar */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-blue-900">Find a Doctor</h1>
                        <p className="text-sm text-gray-500">Welcome, {user?.name} · Student Portal</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/student/appointments"
                            className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-medium text-sm hover:bg-blue-100 transition border border-blue-200">
                            📋 My Appointments
                        </Link>
                        <button onClick={logout}
                            className="text-sm text-red-500 hover:text-red-700 font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition">
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                    <div className="relative flex-1">
                        <span className="absolute left-4 top-3.5 text-gray-400 text-sm">🔍</span>
                        <input
                            type="text"
                            placeholder="Search by doctor name or specialization..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-[180px]"
                        value={selectedSpec}
                        onChange={e => setSelectedSpec(e.target.value)}
                    >
                        {SPECIALIZATIONS.map(s => <option key={s}>{s}</option>)}
                    </select>
                </div>

                {/* Stats bar */}
                <p className="text-sm text-gray-500 mb-5">
                    Showing <strong>{filtered.length}</strong> registered doctor{filtered.length !== 1 ? 's' : ''}
                </p>

                {/* Loading */}
                {loading && (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                )}

                {/* Doctor Cards */}
                {!loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map(doc => (
                            <div key={doc._id}
                                className="bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden">
                                {/* Card Header */}
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold shadow">
                                        {doc.userId?.name?.charAt(0) || 'D'}
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white">Dr. {doc.userId?.name}</h2>
                                        <p className="text-blue-100 text-sm">{doc.specialization}</p>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-5">
                                    <StarRating rating={doc.rating || 0} count={doc.reviewCount || 0} />

                                    <div className="mt-3 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-500">Consultation Fee</p>
                                            <p className="text-indigo-700 font-bold text-lg">Rs. {doc.consultationFee}</p>
                                        </div>
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">✓ Available</span>
                                    </div>

                                    <p className="text-xs text-gray-400 mt-2 mb-4">📧 {doc.userId?.email}</p>

                                    <Link
                                        to={`/student/book/${doc._id}`}
                                        className="block text-center w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition font-semibold text-sm shadow">
                                        Book Appointment
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && filtered.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-5xl mb-4">🩺</div>
                        <p className="text-gray-600 font-medium">No doctors found matching your criteria.</p>
                        <p className="text-sm text-gray-400 mt-2">Try adjusting your search or filter.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorList;
