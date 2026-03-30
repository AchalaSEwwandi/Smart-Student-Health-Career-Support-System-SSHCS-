import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

import DoctorList from './pages/student/DoctorList';
import BookAppointment from './pages/student/BookAppointment';
import MyAppointments from './pages/student/MyAppointments';
import UploadPrescription from './pages/student/UploadPrescription';

import DoctorDashboard from './pages/doctor/DoctorDashboard';
import PharmacyDashboard from './pages/pharmacy/PharmacyDashboard';

function App() {
    return (
        <>
            <Navbar />
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Student Routes */}
                <Route path="/student/doctors" element={<DoctorList />} />
                <Route path="/student/book/:doctorId" element={<BookAppointment />} />
                <Route path="/student/appointments" element={<MyAppointments />} />
                <Route path="/student/upload-prescription/:appointmentId" element={<UploadPrescription />} />

                {/* Doctor Routes */}
                <Route path="/doctor/dashboard" element={<DoctorDashboard />} />

                {/* Pharmacy Routes */}
                <Route path="/pharmacy/dashboard" element={<PharmacyDashboard />} />
            </Routes>
        </>
    );
}

export default App;
