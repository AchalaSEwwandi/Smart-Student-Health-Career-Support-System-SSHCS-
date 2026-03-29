import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';

const VendorMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data } = await api.get('/messages/received');
      setMessages(data.data);
    } catch (err) {
      toast.error('Failed to load received messages.');
    } finally {
      setLoading(false);
    }
  };

  const submitReply = async (msgId) => {
    if (!replyText.trim()) {
      return toast.error("Reply cannot be empty.");
    }
    setReplyLoading(true);
    try {
      const { data } = await api.put(`/messages/${msgId}/reply`, { reply: replyText });
      toast.success('Reply sent successfully!');
      
      // Update local state instantly
      setMessages(prev => prev.map(m => m._id === msgId ? { ...m, reply: data.data.reply, status: 'replied' } : m));
      
      setReplyingTo(null);
      setReplyText('');
    } catch (err) {
      toast.error('Failed to send reply.');
    } finally {
      setReplyLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
                <button 
                  onClick={() => navigate('/profile')} 
                  className="bg-white border border-gray-200 p-2 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors">
                  ← Back to Dashboard
                </button>
                <h1 className="text-2xl font-bold text-gray-800">My Inbox</h1>
            </div>
            
            <button 
                onClick={() => fetchMessages()}
                disabled={loading}
                className="text-sm font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-4 py-2 rounded-xl transition-colors">
                Refresh ↻
            </button>
        </div>

        {loading ? (
            <div className="text-center py-20">
                <div className="w-10 h-10 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500">Loading inbox...</p>
            </div>
        ) : messages.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
                <div className="text-5xl mb-4">📭</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Your Inbox is Empty</h3>
                <p>You haven't received any messages from students yet.</p>
            </div>
        ) : (
            <div className="space-y-6">
                {messages.map((msg) => (
                    <div key={msg._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        
                        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-1">{msg.subject}</h3>
                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                    <span className="font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">{msg.senderId?.studentId || 'N/A'}</span>
                                    From: <span className="font-semibold text-gray-700">{msg.senderId?.name || 'Unknown Student'}</span> 
                                    <span>({msg.senderId?.email})</span>
                                </p>
                            </div>
                            <div>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${msg.status === 'replied' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                    {msg.status === 'replied' ? '✓ Replied' : '⚠️ Action Needed'}
                                </span>
                            </div>
                        </div>
                        
                        <div className="p-6 bg-slate-50 border-b border-gray-100">
                            <p className="text-sm text-gray-800 whitespace-pre-wrap">{msg.message}</p>
                            <p className="text-xs text-gray-400 mt-4">{new Date(msg.createdAt).toLocaleString()}</p>
                        </div>
                        
                        {msg.status === 'replied' ? (
                            <div className="p-6 bg-emerald-50/30">
                                <p className="text-xs text-emerald-600 uppercase tracking-wider font-semibold mb-2">Your Reply:</p>
                                <p className="text-sm text-gray-800 whitespace-pre-wrap font-medium">{msg.reply}</p>
                            </div>
                        ) : (
                            <div className="p-6 bg-white">
                                {replyingTo === msg._id ? (
                                    <div className="space-y-4">
                                        <textarea 
                                            autoFocus
                                            rows="4"
                                            placeholder="Write your reply here. This will be emailed directly to the student." 
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-y text-sm"
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            disabled={replyLoading}
                                        ></textarea>
                                        <div className="flex justify-end gap-3">
                                            <button 
                                                onClick={() => { setReplyingTo(null); setReplyText(''); }}
                                                className="px-4 py-2 hover:bg-gray-100 text-gray-600 rounded-xl font-medium transition-colors text-sm"
                                                disabled={replyLoading}>
                                                Cancel
                                            </button>
                                            <button 
                                                onClick={() => submitReply(msg._id)}
                                                disabled={replyLoading || !replyText.trim()}
                                                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white px-6 py-2 rounded-xl font-medium shadow-sm transition-colors text-sm flex items-center gap-2">
                                                {replyLoading ? 'Sending...' : 'Send Reply'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => { setReplyingTo(msg._id); setReplyText(''); }}
                                        className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-4 py-2 rounded-xl font-semibold transition-colors text-sm border border-emerald-200">
                                        ↩ Write a Reply
                                    </button>
                                )}
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

export default VendorMessages;
