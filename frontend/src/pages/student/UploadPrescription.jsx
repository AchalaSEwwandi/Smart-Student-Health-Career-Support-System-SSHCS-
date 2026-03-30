import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const UploadPrescription = () => {
    const { appointmentId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [pharmacies, setPharmacies] = useState([]);
    const [selectedPharmacy, setSelectedPharmacy] = useState('');
    const [fileUrl, setFileUrl] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        axios.get('http://localhost:5000/api/hospital/pharmacies')
            .then(res => setPharmacies(res.data))
            .catch(err => console.error(err));
    }, []);

    const handleUpload = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/hospital/prescriptions', {
                appointmentId,
                studentId: user.id,
                pharmacyId: selectedPharmacy,
                fileUrl
            });
            setMessage('Prescription sent to pharmacy successfully!');
            setTimeout(() => navigate('/student/appointments'), 2000);
        } catch (err) {
            setMessage('Failed to upload. Please try again.');
        }
    };

    return (
        <div className="max-w-lg mx-auto mt-12 p-8 bg-white shadow-xl rounded-lg border border-gray-100">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Forward Prescription to Pharmacy</h2>
            {message && <div className="mb-4 p-3 bg-teal-100 text-teal-800 rounded">{message}</div>}

            <form onSubmit={handleUpload} className="space-y-5">
                <div>
                    <label className="block text-gray-700 mb-1">Select Pharmacy</label>
                    <select required value={selectedPharmacy} onChange={e => setSelectedPharmacy(e.target.value)} className="w-full border p-3 rounded-md border-gray-300">
                        <option value="">-- Choose a Pharmacy --</option>
                        {pharmacies.map(p => (
                            <option key={p._id} value={p._id}>{p.name} ({p.email})</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-gray-700 mb-1">Prescription File URL</label>
                    <input type="text" placeholder="https://link-to-prescription.png" required value={fileUrl} onChange={e => setFileUrl(e.target.value)} className="w-full border p-3 rounded-md border-gray-300" />
                    <p className="text-xs text-gray-500 mt-1">For demo purposes, just provide a valid image/document link.</p>
                </div>
                
                <button type="submit" className="w-full bg-teal-600 text-white font-semibold py-3 rounded-md hover:bg-teal-700">
                    Send to Pharmacy
                </button>
            </form>
        </div>
    );
};

export default UploadPrescription;
