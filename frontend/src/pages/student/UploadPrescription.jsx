import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
const MAX_SIZE_MB = 5;

const UploadPrescription = () => {
    const { appointmentId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [pharmacies, setPharmacies] = useState([]);
    const [selectedPharmacy, setSelectedPharmacy] = useState('');
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);
    const [alreadyUploaded, setAlreadyUploaded] = useState(false);
    const fileInputRef = useRef();

    useEffect(() => {
        axios.get('http://localhost:5000/api/hospital/pharmacies')
            .then(res => setPharmacies(res.data))
            .catch(err => console.error(err));

        // Check if prescription already uploaded for this appointment
        if (user) {
            axios.get(`http://localhost:5000/api/hospital/prescriptions/student/${user.id}`)
                .then(res => {
                    const found = res.data.find(p => p.appointmentId?._id === appointmentId || p.appointmentId === appointmentId);
                    if (found) setAlreadyUploaded(true);
                })
                .catch(err => console.error(err));
        }
    }, [appointmentId, user]);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (!selected) return;

        const errs = { ...errors };
        if (!ALLOWED_TYPES.includes(selected.type)) {
            errs.file = 'Only JPG, PNG, or PDF files are allowed.';
            setErrors(errs);
            setFile(null);
            setPreviewUrl(null);
            return;
        }
        if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
            errs.file = `File must be under ${MAX_SIZE_MB}MB. Selected: ${(selected.size / 1024 / 1024).toFixed(2)}MB`;
            setErrors(errs);
            setFile(null);
            setPreviewUrl(null);
            return;
        }

        errs.file = '';
        setErrors(errs);
        setFile(selected);

        if (selected.type.startsWith('image/')) {
            setPreviewUrl(URL.createObjectURL(selected));
        } else {
            setPreviewUrl('pdf');
        }
    };

    const validate = () => {
        const errs = {};
        if (!selectedPharmacy) errs.pharmacy = 'Please select a pharmacy.';
        if (!file) errs.file = 'Please select a prescription file.';
        return errs;
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('appointmentId', appointmentId);
            formData.append('studentId', user.id);
            formData.append('pharmacyId', selectedPharmacy);

            await axios.post('http://localhost:5000/api/hospital/prescriptions', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setMessage({ text: 'Prescription sent to pharmacy successfully! 🎉', type: 'success' });
            setTimeout(() => navigate('/student/appointments'), 2500);
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Upload failed. Please try again.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (alreadyUploaded) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
                    <div className="text-5xl mb-4">📄</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Prescription Already Submitted</h2>
                    <p className="text-gray-500 text-sm mb-6">You have already uploaded a prescription for this appointment. Check your appointment status.</p>
                    <button onClick={() => navigate('/student/appointments')}
                        className="bg-teal-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-teal-700 transition">
                        View My Appointments
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 py-10 px-4">
            <div className="max-w-lg mx-auto">
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Upload Prescription</h1>
                        <p className="text-sm text-gray-500 mt-1">Forward your prescription to a pharmacy for processing</p>
                    </div>

                    {message.text && (
                        <div className={`mb-5 p-4 rounded-xl text-sm font-medium flex items-center gap-2
                            ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            <span>{message.type === 'success' ? '✅' : '❌'}</span> {message.text}
                        </div>
                    )}

                    <form onSubmit={handleUpload} className="space-y-5" noValidate>
                        {/* Pharmacy Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Select Pharmacy <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={selectedPharmacy}
                                onChange={e => { setSelectedPharmacy(e.target.value); setErrors(p => ({...p, pharmacy: ''})); }}
                                className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white transition
                                    ${errors.pharmacy ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                            >
                                <option value="">-- Choose a Pharmacy --</option>
                                {pharmacies.map(p => (
                                    <option key={p._id} value={p._id}>🏥 {p.name} ({p.email})</option>
                                ))}
                            </select>
                            {errors.pharmacy && <p className="text-red-500 text-xs mt-1">⚠ {errors.pharmacy}</p>}
                        </div>

                        {/* File Upload Area */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Prescription File <span className="text-red-500">*</span>
                            </label>

                            <div
                                onClick={() => fileInputRef.current.click()}
                                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition
                                    ${errors.file ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-teal-400 hover:bg-teal-50'}`}
                            >
                                {!file ? (
                                    <div>
                                        <div className="text-4xl mb-2">📎</div>
                                        <p className="text-sm font-medium text-gray-600">Click to upload or drag & drop</p>
                                        <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG · Max 5MB</p>
                                    </div>
                                ) : previewUrl === 'pdf' ? (
                                    <div>
                                        <div className="text-4xl mb-2">📄</div>
                                        <p className="text-sm font-semibold text-teal-700">{file.name}</p>
                                        <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB · PDF</p>
                                    </div>
                                ) : (
                                    <div>
                                        <img src={previewUrl} alt="Preview" className="max-h-40 mx-auto rounded-lg object-contain mb-2" />
                                        <p className="text-xs text-gray-500">{file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".jpg,.jpeg,.png,.pdf"
                                className="hidden"
                            />
                            {errors.file && <p className="text-red-500 text-xs mt-1">⚠ {errors.file}</p>}
                            {file && (
                                <button type="button" onClick={() => { setFile(null); setPreviewUrl(null); fileInputRef.current.value = ''; }}
                                    className="text-xs text-gray-400 hover:text-red-500 mt-1">✕ Remove file</button>
                            )}
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => navigate('/student/appointments')}
                                className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition">
                                Cancel
                            </button>
                            <button type="submit" disabled={loading}
                                className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 text-white py-3 rounded-xl font-semibold text-sm hover:from-teal-700 hover:to-emerald-700 transition shadow-md disabled:opacity-60">
                                {loading ? 'Uploading...' : '📤 Send to Pharmacy'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UploadPrescription;
