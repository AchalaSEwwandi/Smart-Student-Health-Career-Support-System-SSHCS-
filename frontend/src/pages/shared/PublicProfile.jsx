import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import useAuth from '../../hooks/useAuth';

const PublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get(`/users/profile/${id}`);
        setProfile(data.data);
      } catch (err) {
        toast.error('Failed to load profile details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h2>
        <p className="text-gray-500 mb-6 text-center max-w-md">The profile you are looking for might have been removed or the URL is incorrect.</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl transition-colors font-medium">
          Back to Home
        </button>
      </div>
    );
  }

  const handleMessage = () => {
    if (!isAuthenticated) {
      toast.info('Please log in to send a message.');
      return navigate('/login');
    }
    if (role !== 'student') {
      return toast.warning('Only students can send direct messages to vendors.');
    }
    
    navigate('/messages/new', { 
      state: { 
        receiverId: profile._id, 
        receiverType: profile.role,
        receiverName: profile.name
      } 
    });
  };

  const isVendor = profile.role === 'doctor' || profile.role === 'shop_owner';

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Dynamic Header Background */}
      <div className="h-64 md:h-80 bg-gradient-to-br from-indigo-900 via-blue-800 to-blue-900 relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#F8FAFC] to-transparent"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-32 relative z-10 pb-20">
        <div className="bg-white rounded-[2rem] shadow-xl border border-white/50 overflow-hidden">
          
          {/* Top Profile Section */}
          <div className="p-8 md:p-12 border-b border-gray-100">
            <div className="flex flex-col md:flex-row gap-10 items-center md:items-start text-center md:text-left">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 md:w-44 md:h-44 rounded-[2.5rem] bg-gradient-to-br from-blue-100 to-indigo-100 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                  {profile.avatar ? (
                    <img src={`http://localhost:5000${profile.avatar}`} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl md:text-7xl font-bold text-blue-800 opacity-80">
                      {profile.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-white shadow-lg flex items-center justify-center" title="Verified Professional">
                   <span className="text-white text-xs">✓</span>
                </div>
              </div>

              {/* Basic Info */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">{profile.name}</h1>
                  <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest w-fit mx-auto md:mx-0">
                    {profile.role?.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-gray-500 font-medium pb-2">
                  <div className="flex items-center gap-1.5 bg-gray-100/50 px-3 py-1.5 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
                    <span className="text-lg">📧</span> {profile.email}
                  </div>
                  {profile.phone && (
                    <div className="flex items-center gap-1.5 bg-gray-100/50 px-3 py-1.5 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
                      <span className="text-lg">📞</span> {profile.phone}
                    </div>
                  )}
                </div>

                {isVendor ? (
                  <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <button 
                      onClick={handleMessage}
                      className="flex-1 bg-blue-700 hover:bg-blue-800 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                      <span>✉️</span> Message Directly
                    </button>
                    <button className="flex-1 bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-100 px-8 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2">
                      <span>★</span> Write a Review
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-400 italic">This is a system member of the CareMate team.</p>
                )}
              </div>
            </div>
          </div>

          {/* Detailed Info Grid */}
          <div className="p-8 md:p-12 bg-gray-50/50 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Professional Details */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 border-b-2 border-blue-600 pb-2 w-fit">Professional Background</h3>
              
              <div className="space-y-4">
                {profile.specialization && (
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-xl shrink-0">🩺</div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Specialization</h4>
                      <p className="text-lg font-semibold text-gray-800 mt-0.5">{profile.specialization}</p>
                    </div>
                  </div>
                )}

                {profile.hospitalName && (
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl shrink-0">🏥</div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Affiliated Hospital</h4>
                      <p className="text-lg font-semibold text-gray-800 mt-0.5">{profile.hospitalName}</p>
                    </div>
                  </div>
                )}

                {profile.shopName && (
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-xl shrink-0">🏪</div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Business Name</h4>
                      <p className="text-lg font-semibold text-gray-800 mt-0.5">{profile.shopName}</p>
                      {profile.businessType && (
                        <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-100 mt-2 inline-block font-bold uppercase tracking-wider">
                          {profile.businessType}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {profile.yearsOfExperience > 0 && (
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-xl shrink-0">⏳</div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Experience</h4>
                      <p className="text-lg font-semibold text-gray-800 mt-0.5">{profile.yearsOfExperience} Years</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Location & Links */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 border-b-2 border-emerald-600 pb-2 w-fit">Location & Access</h3>
              
              <div className="space-y-4">
                {profile.shopAddress && (
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-xl shrink-0">📍</div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Location Address</h4>
                      <p className="text-base font-semibold text-gray-700 mt-1">{profile.shopAddress}</p>
                      <button className="text-sm text-blue-600 font-bold mt-3 hover:underline flex items-center gap-1">
                        View on Map ➔
                      </button>
                    </div>
                  </div>
                )}

                <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-[1.5rem] shadow-lg text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <span className="text-6xl italic">❝</span>
                  </div>
                  <h4 className="text-indigo-400 font-bold uppercase tracking-widest text-xs mb-3">Service Hours</h4>
                  <p className="text-lg font-medium leading-relaxed mb-6">
                    Our professional services are available for students via appointments and order requests.
                  </p>
                  <Link to="/contact" className="text-sm font-bold text-white/80 hover:text-white flex items-center gap-2 transition-colors">
                    General Questions? <span className="bg-white/20 px-2 py-0.5 rounded-lg">Contact Admin</span>
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;