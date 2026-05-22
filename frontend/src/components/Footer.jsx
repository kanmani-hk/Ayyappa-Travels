import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Phone, Mail, MapPin, CheckCircle } from 'lucide-react';
import logoImg from '../assets/logo.png';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Column 1: About & Info */}
          <div className="space-y-4 md:col-span-1 text-left">
            <Link to="/" className="flex items-center space-x-3">
              <div className="bg-white p-0.5 rounded-full border border-slate-800 shadow-md">
                <img src={logoImg} alt="Ayyappa Travels" className="h-10 w-10 object-contain" />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                AYYAPPA <span className="text-brand-500">TRAVELS</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Srivilliputtur's premier private travel desk. We specialize exclusively in family-owned comfortable sedans, high-roof 10-seater SUVs, and multi-utility pilgrimage vans.
            </p>
            <div className="flex space-x-4 pt-2">
              <a
                href="https://wa.me/919150549150"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-800 hover:bg-brand-500 hover:text-white px-4 py-2 rounded-xl transition-all duration-300 text-slate-300 flex items-center justify-center font-bold text-xs"
              >
                WhatsApp Inquiry
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="text-left">
            <h3 className="font-extrabold text-sm text-white tracking-wider uppercase mb-5 border-l-2 border-brand-500 pl-3">
              Explore Services
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/" className="hover:text-brand-500 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/fleet" className="hover:text-brand-500 transition-colors">
                  Our Fleet
                </Link>
              </li>
              <li>
                <Link to="/booking" className="hover:text-brand-500 transition-colors">
                  Calculate Quote
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-brand-500 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Specialties */}
          <div className="text-left">
            <h3 className="font-extrabold text-sm text-white tracking-wider uppercase mb-5 border-l-2 border-brand-500 pl-3">
              Specialized Fleet
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-brand-500 shrink-0" />
                <span>Suzuki Swift Dzire (5 Seats)</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-brand-500 shrink-0" />
                <span>Chevrolet Tavera Neo (10 Seats)</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-brand-500 shrink-0" />
                <span>Mahindra Supro Van (8 Seats)</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-brand-500 shrink-0" />
                <span>Pilgrimages & Outstation Cabs</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact details */}
          <div className="text-left">
            <h3 className="font-extrabold text-sm text-white tracking-wider uppercase mb-5 border-l-2 border-brand-500 pl-3">
              Official Hub
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-brand-500 shrink-0 mt-0.5" />
                <span>54 D, Ayyampatti Sekkadi Street,<br />Near PRC Tippo, Ayyampatti,<br />Srivilliputtur-626125, Tamil Nadu</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-brand-500 shrink-0" />
                <a href="tel:+919150549150" className="hover:text-brand-500 transition-colors font-bold text-white">
                  +91-9150549150
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-brand-500 shrink-0" />
                <span className="truncate text-white font-semibold">sk9549150@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 text-center md:flex md:justify-between md:items-center text-xs text-slate-500">
          <p>© {currentYear} Ayyappa Travels Srivilliputtur. All rights reserved.</p>
          <p className="mt-2 md:mt-0">
            Designed with ❤️ for premium customer satisfaction. Specialist in private Car & Van Rentals.
          </p>
        </div>
      </div>
    </footer>
  );
}
