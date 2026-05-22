import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Car, Menu, X, Phone, Shield } from 'lucide-react';
import logoImg from '../assets/logo.png';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' }
  ];

  const isActive = (path) => location.pathname === path;

  // Check if admin is logged in
  const isAdminLoggedIn = !!localStorage.getItem('ayyappa_admin_token');
  const isLoginPage = location.pathname === '/login';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'py-3 bg-white/90 backdrop-blur-md shadow-md border-b border-slate-100' : 'py-5 bg-transparent'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-white p-0.5 rounded-full shadow-md border border-slate-100 group-hover:scale-105 transition-transform duration-300 overflow-hidden shrink-0 flex items-center justify-center">
              <img src={logoImg} alt="Ayyappa Travels" className="h-12 w-12 object-contain" />
            </div>
            <div>
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900 group-hover:text-brand-500 transition-colors block leading-tight">
                AYYAPPA <span className="text-brand-500">TRAVELS</span>
              </span>
              <span className="block text-[10px] font-bold text-brand-600 tracking-widest uppercase -mt-0.5">
                Ayyampatti • Srivilliputtur
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            {!isLoginPage && navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-semibold text-sm transition-all relative py-1.5 ${isActive(link.path)
                    ? 'text-brand-500'
                    : 'text-slate-600 hover:text-brand-500'
                  }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full animate-pulse" />
                )}
              </Link>
            ))}
          </div>

          {/* CTAs */}
          {!isLoginPage && (
            <div className="hidden md:flex items-center space-x-4">
              {isAdminLoggedIn ? (
                <button
                onClick={() => {
                  localStorage.removeItem('ayyappa_admin_token');
                  localStorage.removeItem('ayyappa_admin_user');
                  window.location.href = '/login';
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-2xl transition-colors text-sm"
              >
                Sign Out
              </button>
            ) : (
              <Link
                to="/login"
                className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-5 py-2.5 rounded-2xl transition-colors text-sm"
              >
                Sign In
              </Link>
            )}
            </div>
          )}

          {/* Mobile Menu Button */}
          {!isLoginPage && (
            <div className="md:hidden flex items-center space-x-2">
              {isAdminLoggedIn && (
                <Link
                to="/dashboard"
                className="text-slate-600 hover:text-brand-500 border border-slate-200 p-2 rounded-xl bg-slate-50"
              >
                <Shield className="h-4 w-4 text-emerald-500" />
              </Link>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-700 hover:text-brand-500 focus:outline-none p-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && !isLoginPage && (
        <div className="md:hidden animate-fade-in absolute top-full left-0 right-0 bg-white shadow-xl border-t border-slate-100 px-4 py-6 space-y-4">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-3 rounded-xl font-bold text-base transition-colors ${isActive(link.path)
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-brand-500'
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col space-y-3 px-4">
            {isAdminLoggedIn ? (
              <button
                onClick={() => {
                  localStorage.removeItem('ayyappa_admin_token');
                  localStorage.removeItem('ayyappa_admin_user');
                  window.location.href = '/login';
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors w-full text-center"
              >
                Sign Out
              </button>
            ) : (
              <Link
                to="/login"
                className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl transition-colors w-full text-center"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
