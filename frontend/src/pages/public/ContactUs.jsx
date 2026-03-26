import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiry_type: 'general',
    message: '',
    shop_name: '',
    shop_type: 'Pharmacy',
    address: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        inquiry_type: formData.inquiry_type,
        message: formData.message
      };

      if (formData.inquiry_type === 'shop_request') {
        payload.shop_name = formData.shop_name;
        payload.shop_type = formData.shop_type;
        payload.address = formData.address;
        payload.description = formData.description;
      }

      await api.post('/public/contact', payload);
      toast.success('Your request has been submitted successfully!');
      setFormData({
        name: '', email: '', phone: '', inquiry_type: 'general',
        message: '', shop_name: '', shop_type: 'Pharmacy', address: '', description: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-10 pb-20">
      <div className="max-w-6xl mx-auto px-6 w-full flex-grow flex flex-col">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Touch</span>
          </h1>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            Whether you have a question, want to partner with us, or need support, our team is ready to help you.
          </p>
        </div>

        {/* Main Content Layout */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col lg:flex-row border border-gray-100 flex-grow">
          
          {/* Left Side: Contact Info & Illustration */}
          <div className="lg:w-2/5 bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6] text-white p-10 lg:p-14 flex flex-col justify-between relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-blue-400 opacity-20 blur-3xl"></div>

            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-2">Reach Out</h2>
              <p className="text-blue-100 mb-10 text-lg">We'd love to hear from you. Here is how you can find us.</p>

              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📞</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-blue-50">Phone</h3>
                    <p className="text-blue-100/80 leading-relaxed">076 345 7892<br/>Mon-Fri from 8am to 5pm</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">✉️</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-blue-50">Email</h3>
                    <p className="text-blue-100/80 leading-relaxed">support@caremate.edu<br/>partners@caremate.edu</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📍</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-blue-50">Headquarters</h3>
                    <p className="text-blue-100/80 leading-relaxed">No 123, Kaduwela Road,<br/>Malabe,<br/>Sri Lanka.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-16 lg:mt-0">
              <p className="text-sm text-blue-200/60 font-medium tracking-wider uppercase mb-4">Connect with us</p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/30 transition flex items-center justify-center text-white">X</a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/30 transition flex items-center justify-center text-white">In</a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/30 transition flex items-center justify-center text-white">Fb</a>
              </div>
            </div>
          </div>

          {/* Right Side: Form Component */}
          <div className="lg:w-3/5 p-10 lg:p-14">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Send us a message</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 shadow-sm"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 shadow-sm"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 shadow-sm"
                    placeholder="+1 234 567 8900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Inquiry Type <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select
                      name="inquiry_type"
                      value={formData.inquiry_type}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 shadow-sm appearance-none pr-10 cursor-pointer font-medium text-gray-700"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="shop_request">Become a Shop Owner</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Shop Owner Fields area with animation wrapper */}
              <div 
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  formData.inquiry_type === 'shop_request' ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-5 mt-2">
                  <div className="flex items-center gap-3 border-b border-blue-100 pb-3 mb-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-bold">🏪</span>
                    <h3 className="font-bold text-blue-900 text-lg">Shop Owner Details</h3>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Shop Name *</label>
                      <input
                        type="text"
                        name="shop_name"
                        value={formData.shop_name}
                        onChange={handleChange}
                        required={formData.inquiry_type === 'shop_request'}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                        placeholder="My Awesome Shop"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Shop Type *</label>
                      <div className="relative">
                        <select
                          name="shop_type"
                          value={formData.shop_type}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm appearance-none bg-white pr-10 cursor-pointer"
                        >
                          <option value="Pharmacy">Pharmacy</option>
                          <option value="Grocery">Grocery</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Address *</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required={formData.inquiry_type === 'shop_request'}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                      placeholder="123 Market St, Tech City, TC 90210"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Description (Optional)</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="2"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none shadow-sm"
                      placeholder="Briefly describe your business and products..."
                    ></textarea>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message <span className="text-red-500">*</span></label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="4"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 resize-none shadow-sm"
                  placeholder={formData.inquiry_type === 'shop_request' ? "Tell us why you would like to join the platform..." : "How can we assist you today?"}
                ></textarea>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-600/40 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:transform-none disabled:shadow-none flex justify-center items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
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

export default ContactUs;
