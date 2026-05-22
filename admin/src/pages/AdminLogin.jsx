import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';
import API from '../utils/api';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await API.post('/auth/login', { email, password });
      if (response.data && response.data.success) {
        localStorage.setItem('ayyappa_admin_token', response.data.token);
        localStorage.setItem('ayyappa_admin_user', JSON.stringify(response.data.user));
        
        // Redirect to dashboard and trigger hard reload to refresh navbar state
        navigate('/dashboard');
        window.location.reload();
      } else {
        setError(response.data.message || 'Invalid administrator credentials');
      }
    } catch (err) {
      console.error(err);
      setError('Connection refused or invalid credentials. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-xl text-left">
        {/* Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-brand-50 text-brand-500 rounded-2xl">
            <Lock className="h-6 w-6 animate-pulse" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight font-sans">Admin Portal</h1>
          <p className="text-slate-400 text-xs">Manage vehicles, check live booking quotes, and view analytics dashboards.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center space-x-3 text-red-700 text-xs font-semibold leading-relaxed">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ayyappatravels.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-slate-400 text-white font-extrabold py-3.5 rounded-xl shadow-lg shadow-brand-500/10 flex items-center justify-center space-x-2 transition-transform duration-300 hover:-translate-y-0.5"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        {/* Info Helper Banner */}
        <div className="bg-orange-50 border border-brand-100 p-4 rounded-2xl flex items-start space-x-3 text-left">
          <Sparkles className="h-5 w-5 text-brand-500 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed text-slate-600">
            <strong>Testing Portal Account:</strong><br />
            Email: <span className="font-bold text-slate-900">admin@ayyappatravels.com</span><br />
            Password: <span className="font-bold text-slate-900">ayyappa_travels_admin_2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}
