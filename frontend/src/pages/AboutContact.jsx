import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, Star, ShieldCheck } from 'lucide-react';
import API from '../utils/api';

export default function AboutContact() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const response = await API.post('/enquiries', {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        message: formData.message,
      });
      if (response.data.success) {
        setSuccessMsg(response.data.message || 'Thank you! Your enquiry has been received.');
        setFormData({
          name: '',
          phone: '',
          email: '',
          message: '',
        });
      } else {
        setErrorMsg(response.data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Submit enquiry error:', err);
      setErrorMsg(err.response?.data?.message || 'Server error submitting enquiry. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 py-6">
      {/* 1. Header Banner */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-500">Get In Touch</span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-none">
          Contact Ayyappa Travels Agency
        </h1>
        <p className="text-slate-500 text-lg leading-relaxed">
          Have an outstation wedding, corporate trip, or weekend pilgrimage planned? Contact our Tirupur booking desk directly for instant support.
        </p>
      </section>

      {/* 2. Content Section Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start text-left">
        {/* Info Column */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900">About Ayyappa Travels</h2>
            <p className="text-slate-500 text-sm mt-3 leading-relaxed">
              Based in the heart of Tirupur Bazaar, Ayyappa Travels Agency is the premier specialized transportation rental hub in the region. Unlike generic travel agents, we own and manage an elite fleet specializing ONLY in premium cars (4, 5, 7-seater sedans/SUVs) and spacious Force Tempo Travellers (9, 12, 15, 17-seaters). We do not operate buses or standard package tours, ensuring 100% focused customer service.
            </p>
          </div>

          <div className="space-y-4 font-medium text-slate-600 text-sm">
            {/* Address */}
            <div className="flex items-start space-x-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
              <div className="bg-brand-50 p-3 rounded-xl text-brand-500 shrink-0">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">Our Office Hub</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Ayyampatty Pilliyar Kovil, Srivilliputtur, Virudhunagar, Tamil Nadu - 626125.
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start space-x-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
              <div className="bg-brand-50 p-3 rounded-xl text-brand-500 shrink-0">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">Call / WhatsApp</h4>
                <p className="text-xs mt-1">
                  <a href="tel:+919688431040" className="text-brand-500 font-extrabold text-sm hover:underline">
                    +91-9150549150
                  </a>
                </p>
              </div>
            </div>

            {/* Timing */}
            <div className="flex items-start space-x-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
              <div className="bg-brand-50 p-3 rounded-xl text-brand-500 shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">Business Timings</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Open 24 Hours / 7 Days a Week for bookings and travels
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <a
              href="https://wa.me/919688431040?text=Hi%20Appa%20Travels,%20I%20would%20like%20to%20know%20more%20about%20vehicle%20pricing."
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold px-6 py-3 rounded-xl shadow-md shadow-emerald-500/10 flex items-center space-x-2 transition-all hover:-translate-y-0.5"
            >
              <span>Chat via WhatsApp</span>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-slate-200 hover:border-brand-500 bg-white hover:text-brand-500 text-slate-600 font-bold px-6 py-3 rounded-xl flex items-center space-x-2 transition-colors"
            >
              <svg className="h-5 w-5 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
              <span>Instagram Page</span>
            </a>
          </div>

        </div>

        {/* Contact Form Column */}
        <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-xl space-y-6">
          <div>
            <h3 className="text-xl font-extrabold text-slate-950">Quick Message Enquiry</h3>
            <p className="text-slate-400 text-xs mt-1">Send a message and our support desk will contact you within 30 minutes.</p>
          </div>

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-medium">
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-sm font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Ramesh"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Your Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="e.g. ramesh@gmail.com"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Your Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="4"
                placeholder="Details of your trip, expected dates, vehicle type..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 text-white font-extrabold py-3.5 rounded-xl shadow-lg shadow-brand-500/10 flex items-center justify-center space-x-2 transition-all duration-200"
            >
              <span>{loading ? 'Sending Message...' : 'Send Message'}</span>
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </section>

      {/* 3. Google Maps Embed Section */}
      <section className="space-y-6 text-left">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Locate Us in Tirupur</h2>
          <p className="text-slate-500 text-xs mt-1">Visit our office hub near the Pilliyar Koil inside Tirupur Bazaar.</p>
        </div>

        <div className="w-full h-96 rounded-3xl overflow-hidden border border-slate-100 shadow-xl">
          {/* Real responsive Google Map iframe pointing near Pilliyar Koil, Tirupur Bazaar */}
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3914.8622835900223!2d77.34005137583803!3d11.10860538906109!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba907caa207b55f%3A0x64cf517e4cf4e22a!2sTiruppur%20Bazaar%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1715494000000!5m2!1sen!2sin"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Appa Travels Google Maps Location"
          />
        </div>
      </section>

      {/* 4. Vouched Quality indicators */}
      <section className="bg-slate-50 p-10 rounded-3xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
        <div className="flex space-x-4">
          <div className="p-3 bg-brand-50 rounded-2xl text-brand-500 shrink-0 h-12 w-12 flex items-center justify-center">
            <Star className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-950 text-base">Direct Customer Focus</h4>
            <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
              We own all our vehicles outright. That means you get unmatched maintenance oversight and a guaranteed spotless cabin every single time you board an Appa Travels vehicle.
            </p>
          </div>
        </div>

        <div className="flex space-x-4">
          <div className="p-3 bg-brand-50 rounded-2xl text-brand-500 shrink-0 h-12 w-12 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-950 text-base">Elite Safe Travels Guarantee</h4>
            <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
              Every vehicle in our fleet is fully backed with a comprehensive passenger safety insurance policy and active GPS tracking tags. Your group's security is our utmost priority.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
