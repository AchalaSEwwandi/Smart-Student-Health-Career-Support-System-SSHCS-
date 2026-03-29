import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading]   = useState(true);
  
  // State for the reply modal/drawer
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText]   = useState('');
  const [sending, setSending]       = useState(false);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/contacts');
      setMessages(data.data || []);
    } catch {
      toast.error('Failed to load messages.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return toast.error('Reply text cannot be empty.');
    
    setSending(true);
    try {
      await api.patch(`/admin/contacts/${replyingTo._id}/reply`, { replyText });
      toast.success('Reply sent successfully! Email dispatched.');
      setReplyingTo(null);
      setReplyText('');
      fetchMessages(); // refresh list
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reply.');
    } finally {
      setSending(false);
    }
  };

  const openReply = (msg) => {
    setReplyingTo(msg);
    setReplyText('');
  };

  const unreadCount = messages.filter(m => m.status === 'unread').length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-800 px-8 py-10 text-white shrink-0">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          Inbox &amp; Inquiries
          {unreadCount > 0 && (
            <span className="bg-amber-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-sm">
              {unreadCount} New
            </span>
          )}
        </h1>
        <p className="text-blue-200 mt-2 text-sm max-w-2xl">
          Manage contact form submissions. Replying here automatically sends a branded email to the user.
        </p>
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 relative">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <div className="text-6xl mb-4 opacity-50">📬</div>
            <h3 className="text-xl font-bold text-gray-800">No Messages Yet</h3>
            <p className="text-gray-500 mt-1">When users send a message via the contact form, it will appear here.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100 overflow-hidden">
            {messages.map((msg) => (
              <div 
                key={msg._id} 
                className={`p-6 transition-colors ${msg.status === 'unread' ? 'bg-blue-50/30' : 'bg-white'}`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  
                  {/* Avatar & Info */}
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${
                      msg.status === 'unread' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {msg.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        {msg.subject}
                        {msg.status === 'unread' && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 block"></span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500 font-medium mt-0.5">
                        <span className="text-gray-900">{msg.name}</span> &lt;<a href={`mailto:${msg.email}`} className="text-blue-600 hover:underline">{msg.email}</a>&gt;
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(msg.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Reply Button / Status Badge */}
                  <div className="shrink-0">
                    {msg.status === 'unread' ? (
                      <button 
                        onClick={() => openReply(msg)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium shadow-sm hover:shadow transition-all text-sm flex items-center gap-2"
                      >
                        <span>↵</span> Reply
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold border border-green-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        Replied
                      </span>
                    )}
                  </div>
                </div>

                {/* The actual message content */}
                <div className="mt-5 pl-0 md:pl-16">
                  <div className="bg-gray-50 rounded-xl p-4 text-gray-700 text-sm leading-relaxed border border-gray-100 whitespace-pre-wrap">
                    {msg.message}
                  </div>
                </div>

                {/* The admin's reply history */}
                {msg.status === 'replied' && msg.replyMessage && (
                  <div className="mt-4 pl-0 md:pl-16">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-gray-400">↳</div>
                      <div className="flex-1 bg-blue-50/50 rounded-xl p-4 border border-blue-100/50">
                        <p className="text-xs font-semibold text-blue-800 mb-1 flex items-center justify-between">
                          <span>Admin Reply</span>
                          <span className="text-blue-400/70 font-normal">
                            {msg.repliedAt ? new Date(msg.repliedAt).toLocaleString() : ''}
                          </span>
                        </p>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{msg.replyMessage}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {replyingTo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-800">Replying to {replyingTo.name}</h2>
              <button 
                onClick={() => setReplyingTo(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4 bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-600 line-clamp-3">
                <strong>{replyingTo.subject}</strong><br/>
                {replyingTo.message}
              </div>

              <form onSubmit={handleReplySubmit}>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Reply (sent via email)</label>
                <textarea
                  rows="6"
                  autoFocus
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your response here..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow resize-y"
                ></textarea>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sending}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-md transition disabled:opacity-70 flex items-center gap-2"
                  >
                    {sending ? 'Sending Server...' : (
                      <>
                        <span>✉️</span> Send Email Reply
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminMessages;
