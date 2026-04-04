import { useState, useEffect } from 'react';
import { healthService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Calendar, Clock, User, CheckCircle, XCircle } from 'lucide-react';

const DoctorAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchAppointments = async () => {
      const doctorId = user?._id || user?.id;
      if (!doctorId) {
        setLoading(false);
        return;
      }
      try {
        const result = await healthService.getDoctorAppointments(doctorId);
        setAppointments(result.data || []);
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    const doctorId = user?._id || user?.id;
    if (!doctorId) return;
    try {
      const result = await healthService.getDoctorAppointments(doctorId);
      setAppointments(result.data || []);
    } catch (error) {
      console.error('Failed to update appointments:', error);
    }
  };

  const handleApprove = async (appointmentId) => {
    try {
      await healthService.approveAppointment(appointmentId);
      fetchAppointments();
    } catch (error) {
      alert('Failed to approve appointment');
    }
  };

  const handleReject = async (appointmentId) => {
    try {
      await healthService.rejectAppointment(appointmentId);
      fetchAppointments();
    } catch (error) {
      alert('Failed to reject appointment');
    }
  };

  const filteredAppointments = filter === 'all'
    ? appointments
    : appointments.filter((a) => a.status === filter);

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'badge-warning',
      approved: 'badge-success',
      rejected: 'badge-danger',
    };
    return statusClasses[status] || 'badge-info';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600 mt-2">Manage patient appointments</p>
        </div>

        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="card card-body p-12 text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold mb-2">No Appointments</h3>
          <p className="text-gray-600">
            {filter === 'all' ? 'No appointments scheduled yet.' : `No ${filter} appointments.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <div key={appointment._id} className="card p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{appointment.patientName}</h3>
                    <p className="text-sm text-gray-600">
                      {appointment.studentId?.studentId || 'N/A'} • {appointment.studentId?.year || 'N/A'}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {appointment.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {appointment.timeSlot}
                      </span>
                    </div>
                    <p className="text-sm mt-2">
                      <span className="font-medium">Symptoms:</span> {appointment.symptoms}
                    </p>
                    {appointment.additionalNotes && (
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Notes:</span> {appointment.additionalNotes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`badge ${getStatusBadge(appointment.status)}`}>
                    {appointment.status}
                  </span>

                  {appointment.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(appointment._id)}
                        className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(appointment._id)}
                        className="btn-danger text-sm py-2 px-4 flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>

              {appointment.feedback && (
                <div className="mt-4 pt-4 border-t border-gray-200 bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium mb-1">Patient Feedback:</p>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500">{'★'.repeat(appointment.feedback.rating)}</span>
                    <span className="text-sm">{appointment.feedback.comment}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
