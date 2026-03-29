import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';

const MessageForm = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // The receiver details passed through router state
    const receiverId = location.state?.receiverId;
    const receiverType = location.state?.receiverType; // 'doctor' or 'shop_owner'
    const receiverName = location.state?.receiverName || (receiverType === 'doctor' ? 'Doctor' : 'Shop');

    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    if (!receiverId || !receiverType) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-8 text-center max-w-md w-full">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                        ⚠️
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">No Recipient Selected</h2>
                    <p className="text-gray-500 mb-6">
                        You cannot manually start a message here. Please initiate contact from your Orders or Appointments page.
                    </p>
                    <button 
                        onClick={() => navigate('/profile')} 
                        className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2.5 rounded-xl transition-colors font-medium">
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (subject.length < 5) return toast.error("Subject must be at least 5 characters.");
        if (message.length < 10) return toast.error("Message must be at least 10 characters.");

        setLoading(true);
        try {
            await api.post('/messages', {
                receiverId,
                receiverType,
                subject,
                message
            });
            toast.success('Message sent successfully! ✉️');
            setSubmitted(true);
            setSubject('');
            setMessage('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send message.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-2xl mx-auto">
                <button 
                    onClick={() => navigate(-1)} 
                    className="mb-6 text-gray-500 hover:text-gray-800 flex items-center gap-2 font-medium transition-colors">
                    ← Back
                </button>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-800 to-indigo-900 p-6 text-white text-center">
                        <h1 className="text-2xl font-bold">Contact {receiverName}</h1>
                        <p className="text-blue-100 mt-1 text-sm">Send a message directly regarding your order or appointment</p>
                    </div>

                    <div className="p-8">
                        {submitted ? (
                            <div className="text-center py-8">
                                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                                    ✓
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Message Sent!</h2>
                                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                                    We've delivered your message to the {receiverType === 'doctor' ? 'doctor' : 'shop'}. You can track their reply in your dashboard.
                                </p>
                                <button 
                                    onClick={() => navigate('/messages/my')} 
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl transition-colors font-semibold shadow-md inline-block">
                                    View My Messages
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Subject <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        placeholder="Brief summary of your inquiry (min 5 chars)" 
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        disabled={loading}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Message <span className="text-red-500">*</span>
                                    </label>
                                    <textarea 
                                        rows="6"
                                        placeholder="Type your message here... (min 10 chars)" 
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-y"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        disabled={loading}
                                        required
                                    ></textarea>
                                </div>

                                <div className="pt-2">
                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-blue-300 text-white px-6 py-3.5 rounded-xl font-semibold shadow-md transition-all active:scale-[0.98] flex justify-center items-center gap-2"
                                    >
                                        {loading ? (
                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        ) : 'Send Message ✈️'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageForm;
