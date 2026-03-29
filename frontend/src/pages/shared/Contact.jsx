import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.post('/contact', formData);
      toast.success('✨ Message sent! We will get back to you shortly.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative overflow-hidden">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-[55%] bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-800 clip-diagonal z-0"></div>
      <div className="absolute top-20 left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl mix-blend-overlay z-0"></div>
      <div className="absolute top-40 right-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl mix-blend-overlay z-0"></div>

      <div className="relative z-10 flex-1 max-w-6xl mx-auto px-6 py-12 lg:py-20 w-full flex flex-col items-center">
        
        {/* Header Title */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight shadow-sm drop-shadow-md">
            Get in touch with us
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto font-medium">
            Whether you have a question, feedback, or want to partner with CareMate, our team is ready to listen and help.
          </p>
        </div>

        {/* Floating Split Card */}
        <div className="w-full bg-white rounded-3xl shadow-2xl flex flex-col lg:flex-row overflow-hidden border border-gray-100/50 backdrop-blur-sm">
          
          {/* Left Side: Contact Info (Dark/Gradient Panel) */}
          <div className="lg:w-[40%] bg-gradient-to-b from-blue-800 to-indigo-900 p-10 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Soft decorative ring */}
            <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full border-[30px] border-white/5"></div>
            <div className="absolute top-10 flex right-10 opacity-10">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
            </div>

            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-2">Contact Information</h2>
              <p className="text-blue-200 mb-10 text-sm md:text-base pr-4">
                Fill up the form and our team will get back to you within 24 hours.
              </p>

              <div className="space-y-8">
                {/* Phone */}
                <div className="flex items-center gap-5 group">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-xl shrink-0 group-hover:bg-white/20 transition-all duration-300">
                     📞
                  </div>
                  <div>
                    <p className="text-sm text-blue-200 mb-0.5 font-medium">Call Us Now</p>
                    <a href="tel:+94112345678" className="text-lg font-semibold hover:text-green-300 transition">+94 11 234 5678</a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-5 group">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-xl shrink-0 group-hover:bg-white/20 transition-all duration-300">
                     ✉️
                  </div>
                  <div>
                    <p className="text-sm text-blue-200 mb-0.5 font-medium">Send an Email</p>
                    <a href="mailto:support@caremate.lk" className="text-lg font-semibold hover:text-green-300 transition">support@caremate.lk</a>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-5 group">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-xl shrink-0 group-hover:bg-white/20 transition-all duration-300">
                     📍
                  </div>
                  <div>
                    <p className="text-sm text-blue-200 mb-0.5 font-medium">Our Headquarters</p>
                    <p className="text-lg font-semibold leading-snug">
                      123 Innovation Drive<br />
                      Colombo 07, Sri Lanka
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Icons inside card */}
            <div className="relative z-10 mt-16 flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/30 hover:-translate-y-1 transition-all duration-300">
                 🐦
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/30 hover:-translate-y-1 transition-all duration-300">
                 📸
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/30 hover:-translate-y-1 transition-all duration-300">
                 💼
              </a>
            </div>
          </div>

          {/* Right Side: Contact Form */}
          <div className="lg:w-[60%] p-10 md:p-12 relative">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 tracking-tight">Send us a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative group">
                  <input 
                    type="text" 
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-0 py-3 border-b-2 border-gray-200 focus:border-blue-600 bg-transparent outline-none transition-colors peer text-gray-800 placeholder-transparent"
                    placeholder="Full Name"
                    id="name"
                  />
                  <label htmlFor="name" className="absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-blue-600 font-medium">
                    Full Name
                  </label>
                </div>

                <div className="relative group">
                  <input 
                    type="email" 
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-0 py-3 border-b-2 border-gray-200 focus:border-blue-600 bg-transparent outline-none transition-colors peer text-gray-800 placeholder-transparent"
                    placeholder="Email Address"
                    id="email"
                  />
                  <label htmlFor="email" className="absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-blue-600 font-medium">
                    Email Address
                  </label>
                </div>
              </div>

              <div className="relative group pt-4">
                <input 
                  type="text" 
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-0 py-3 border-b-2 border-gray-200 focus:border-blue-600 bg-transparent outline-none transition-colors peer text-gray-800 placeholder-transparent"
                  placeholder="Subject"
                  id="subject"
                />
                <label htmlFor="subject" className="absolute left-0 top-0.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-7 peer-focus:top-0.5 peer-focus:text-sm peer-focus:text-blue-600 font-medium">
                  Subject
                </label>
              </div>

              <div className="relative group pt-4">
                <textarea 
                  rows={4}
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-0 py-3 border-b-2 border-gray-200 focus:border-blue-600 bg-transparent outline-none transition-colors peer text-gray-800 placeholder-transparent resize-none"
                  placeholder="Write your message"
                  id="message"
                ></textarea>
                <label htmlFor="message" className="absolute left-0 top-0.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-7 peer-focus:top-0.5 peer-focus:text-sm peer-focus:text-blue-600 font-medium">
                  Write your message
                </label>
              </div>

              <div className="pt-6 flex justify-end">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 hover:-translate-y-1 text-white px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl font-bold transition-all duration-300 flex items-center gap-2 group disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {loading ? 'Sending...' : (
                    <>
                      Send Message
                      <span className="group-hover:translate-x-1 transition-transform">➔</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Contact;
