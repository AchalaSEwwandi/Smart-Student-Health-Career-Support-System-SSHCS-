import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';

const MyMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data } = await api.get('/messages/my');
      setMessages(data.data);
    } catch (err) {
      toast.error('Failed to load messages.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
                <button 
                  onClick={() => navigate('/profile')} 
                  className="bg-white border border-gray-200 p-2 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors">
                  ← Back to Profile
                </button>
                <h1 className="text-2xl font-bold text-gray-800">My Messages</h1>
            </div>
            
            <button 
                onClick={() => fetchMessages()}
                disabled={loading}
                className="text-sm font-medium text-blue-700 hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-xl transition-colors">
                Refresh ↻
            </button>
        </div>

        {loading ? (
            <div className="text-center py-20">
                <div className="w-10 h-10 border-4 border-blue-800 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500">Loading messages...</p>
            </div>
        ) : messages.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
                <div className="text-4xl mb-4">📭</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Messages Found</h3>
                <p>You haven't sent any messages yet.</p>
            </div>
        ) : (
            <div className="space-y-6">
                {messages.map((msg) => (
                    <div key={msg._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex justify-between items-start gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-1">{msg.subject}</h3>
                                <p className="text-sm text-gray-500">
                                    To: <span className="font-semibold text-gray-700">{msg.receiverId ? msg.receiverId.name : 'Unknown User'}</span> 
                                    <span className="text-gray-400 text-xs ml-2 uppercase tracking-wide bg-gray-100 px-2 py-0.5 rounded-full">
                                        {msg.receiverType === 'shop_owner' ? 'Shop' : msg.receiverType}
                                    </span>
                                </p>
                            </div>
                            <div>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${msg.status === 'replied' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                    {msg.status === 'replied' ? '✓ Replied' : '⏳ Pending'}
                                </span>
                            </div>
                        </div>
                        
                        <div className="p-6 bg-slate-50 border-b border-gray-100">
                            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Your Message</p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.message}</p>
                            <p className="text-xs text-gray-400 mt-3">{new Date(msg.createdAt).toLocaleString()}</p>
                        </div>
                        
                        {msg.reply && (
                            <div className="p-6 bg-[#EFF6FF]">
                                <p className="text-xs text-blue-500 uppercase tracking-wider font-semibold mb-2">Reply from {msg.receiverId ? msg.receiverId.name : 'Vendor'}</p>
                                <p className="text-sm text-blue-900 whitespace-pre-wrap font-medium">{msg.reply}</p>
                                <p className="text-xs text-blue-400 mt-3">{new Date(msg.updatedAt).toLocaleString()}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        )}

      </div>
    </div>
  );
};

export default MyMessages;
