import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, CalendarRange, CarFront, LogOut, Plus, Edit3, Trash2, Check, X, ShieldAlert, FileSpreadsheet, Users2, DollarSign, MessageSquare } from 'lucide-react';
import API from '../utils/api';
import car1Img from '../assets/car1_new.jpg';
import car4Img from '../assets/car4_new.jpg';

// Safe seed mock indicators for local dashboard simulation
const INITIAL_ANALYTICS = {
  totalBookings: 8,
  estimatedRevenue: 10400,
  pendingCount: 2,
  confirmedCount: 4,
  completedCount: 2,
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'bookings' | 'vehicles'
  const [analytics, setAnalytics] = useState(INITIAL_ANALYTICS);
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create/Edit Vehicle Form states
  const [showAddVehicleForm, setShowAddVehicleForm] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    name: '',
    type: 'car',
    seats: 5,
    ratePerKm: 12,
    features: '',
    image: '',
    description: '',
  });

  const navigate = useNavigate();

  // Load Dashboard Data
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch Bookings
        const bookingsRes = await API.get('/bookings');
        if (bookingsRes.data && bookingsRes.data.success) {
          setBookings(bookingsRes.data.data);
        }

        // Fetch Vehicles
        const vehiclesRes = await API.get('/vehicles');
        if (vehiclesRes.data && vehiclesRes.data.success) {
          setVehicles(vehiclesRes.data.data);
        }

        // Fetch Enquiries
        const enquiriesRes = await API.get('/enquiries');
        if (enquiriesRes.data && enquiriesRes.data.success) {
          setEnquiries(enquiriesRes.data.data);
        }

        // Fetch Analytics Dashboard Groupings
        const analyticsRes = await API.get('/bookings/analytics/dashboard');
        if (analyticsRes.data && analyticsRes.data.success) {
          setAnalytics(analyticsRes.data.data);
        } else {
          recalculateLocalAnalytics(bookingsRes.data.data || []);
        }
      } catch (err) {
        console.warn('Backend server partially connected, running offline mode.', err);
        setError('Working in offline simulation mode. Database changes will update locally on-screen.');
        // Set local dummy state for visual verification
        loadLocalDummyState();
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const loadLocalDummyState = () => {
    setVehicles([
      { _id: 'v_1', name: 'Suzuki Swift Dzire ("Ayyappa")', type: 'car', seats: 5, ratePerKm: 12, isAvailable: true, image: car1Img, features: ['AC', 'Ayyappa Sticker', 'Neat Cabin'], description: 'Comfortable family sedan.' },
      { _id: 'v_2', name: 'Chevrolet Tavera Neo', type: 'car', seats: 10, ratePerKm: 14, isAvailable: true, image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=600&auto=format&fit=crop', features: ['Dual AC', 'Luggage Carrier', '10 Seater'], description: 'Spacious family SUV.' },
      { _id: 'v_4', name: 'Mahindra Supro Van (Vel)', type: 'car', seats: 8, ratePerKm: 13, isAvailable: true, image: car4Img, features: ['Traditional Decals', '8 Seats'], description: 'Sacred pilgrimage van.' },
    ]);
    setBookings([
      { _id: 'b_1', customerName: 'Ramesh Sundar', customerPhone: '+91 9150549150', customerEmail: 'ramesh@gmail.com', pickupLocation: '54 D, Ayyampatti, Srivilliputtur', dropLocation: 'Madurai Meenakshi Temple', pickupDate: '2026-05-15T10:00', returnDate: '2026-05-15T18:00', estimatedDistance: 160, estimatedCost: 1920, status: 'pending', vehicle: { name: 'Suzuki Swift Dzire ("Ayyappa")', seats: 5 } },
      { _id: 'b_2', customerName: 'Priya Mani', customerPhone: '+91 9087654321', customerEmail: 'priya@gmail.com', pickupLocation: 'Ayyampatti Sekkadi Street', dropLocation: 'Courtallam Waterfalls', pickupDate: '2026-05-20T06:00', returnDate: '2026-05-21T20:00', estimatedDistance: 140, estimatedCost: 1960, status: 'confirmed', vehicle: { name: 'Chevrolet Tavera Neo', seats: 10 } },
    ]);
    setEnquiries([
      { _id: 'e_1', name: 'Test Enquiry', phone: '9876543210', email: 'test@example.com', message: 'Hello, looking for a Tavera for 2 days. What is the price?', createdAt: new Date().toISOString() }
    ]);
  };

  const recalculateLocalAnalytics = (bookingsList) => {
    const total = bookingsList.length;
    const rev = bookingsList
      .filter((b) => b.status === 'confirmed' || b.status === 'completed')
      .reduce((sum, b) => sum + (b.estimatedCost || 0), 0);
    const pend = bookingsList.filter((b) => b.status === 'pending').length;
    const conf = bookingsList.filter((b) => b.status === 'confirmed').length;
    const comp = bookingsList.filter((b) => b.status === 'completed').length;

    setAnalytics({
      totalBookings: total,
      estimatedRevenue: rev,
      pendingCount: pend,
      confirmedCount: conf,
      completedCount: comp,
    });
  };

  // Sign out
  const handleSignOut = () => {
    localStorage.removeItem('ayyappa_admin_token');
    localStorage.removeItem('ayyappa_admin_user');
    navigate('/');
    window.location.reload();
  };

  // Update Booking Status
  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      const response = await API.put(`/bookings/${bookingId}/status`, { status: newStatus });
      if (response.data && response.data.success) {
        // Update local list
        const updatedList = bookings.map((b) => (b._id === bookingId ? { ...b, status: newStatus } : b));
        setBookings(updatedList);
        recalculateLocalAnalytics(updatedList);
        alert(`Booking status successfully marked as ${newStatus}`);
      }
    } catch (err) {
      console.warn('Could not update status via server, simulating offline change.', err);
      const updatedList = bookings.map((b) => (b._id === bookingId ? { ...b, status: newStatus } : b));
      setBookings(updatedList);
      recalculateLocalAnalytics(updatedList);
    }
  };

  // Toggle Vehicle Availability
  const handleToggleVehicleAvailability = async (vehicleId, currentAvailable) => {
    try {
      const vObj = vehicles.find((v) => v._id === vehicleId);
      if (!vObj) return;

      const response = await API.put(`/vehicles/${vehicleId}`, {
        ...vObj,
        isAvailable: !currentAvailable,
      });

      if (response.data && response.data.success) {
        setVehicles(vehicles.map((v) => (v._id === vehicleId ? response.data.data : v)));
      }
    } catch (err) {
      console.warn('Could not toggle vehicle on server, simulating locally.', err);
      setVehicles(vehicles.map((v) => (v._id === vehicleId ? { ...v, isAvailable: !currentAvailable } : v)));
    }
  };

  // Update Vehicle Rate
  const handleUpdateVehicleRate = async (vehicleId, newRate) => {
    if (!newRate || Number(newRate) <= 0) return;
    try {
      const vObj = vehicles.find((v) => v._id === vehicleId);
      if (!vObj) return;

      const response = await API.put(`/vehicles/${vehicleId}`, {
        ...vObj,
        ratePerKm: Number(newRate),
      });

      if (response.data && response.data.success) {
        setVehicles(vehicles.map((v) => (v._id === vehicleId ? response.data.data : v)));
        alert('Rental rate updated successfully!');
      }
    } catch (err) {
      console.warn('Could not update rate on server, simulating locally.', err);
      setVehicles(vehicles.map((v) => (v._id === vehicleId ? { ...v, ratePerKm: Number(newRate) } : v)));
      alert('Rental rate updated successfully! (Local state)');
    }
  };

  // Add Vehicle Submit
  const handleAddVehicle = async (e) => {
    e.preventDefault();
    try {
      const featuresArray = newVehicle.features.split(',').map((f) => f.trim()).filter((f) => f.length > 0);
      const payload = {
        ...newVehicle,
        seats: Number(newVehicle.seats),
        ratePerKm: Number(newVehicle.ratePerKm),
        features: featuresArray,
        image: newVehicle.image || '',
      };

      const response = await API.post('/vehicles', payload);
      if (response.data && response.data.success) {
        setVehicles([...vehicles, response.data.data]);
        setShowAddVehicleForm(false);
        // Reset form
        setNewVehicle({ name: '', type: 'car', seats: 5, ratePerKm: 12, features: '', image: '', description: '' });
        alert('New vehicle model added to fleet successfully!');
      }
    } catch (err) {
      console.warn('Could not create vehicle on server, simulating locally.', err);
      const mockNewVehicle = {
        _id: 'mock_' + Date.now(),
        ...newVehicle,
        seats: Number(newVehicle.seats),
        ratePerKm: Number(newVehicle.ratePerKm),
        features: newVehicle.features.split(','),
        isAvailable: true,
      };
      setVehicles([...vehicles, mockNewVehicle]);
      setShowAddVehicleForm(false);
      alert('New vehicle model added to fleet successfully! (Local state)');
    }
  };

  const activeAdminUser = JSON.parse(localStorage.getItem('ayyappa_admin_user') || '{"name": "Ayyappa Travels Desk"}');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 py-6 text-left">
      {/* 1. Header Banner */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900 text-white p-8 rounded-3xl gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-brand-950 pointer-events-none" />
        <div className="relative z-10 space-y-1">
          <h1 className="text-3xl font-black tracking-tight leading-none">Console Room</h1>
          <p className="text-slate-400 text-sm">Welcome back, <strong className="text-brand-400">{activeAdminUser.name}</strong>. Monitor schedules & change travel rates.</p>
        </div>

        <button
          onClick={handleSignOut}
          className="relative z-10 flex items-center space-x-1.5 bg-red-600 hover:bg-red-700 text-white font-extrabold px-5 py-2.5 rounded-2xl shadow-lg shadow-red-600/10 text-sm transition-transform hover:-translate-y-0.5"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out Desk</span>
        </button>
      </section>

      {error && (
        <div className="bg-orange-50 border border-brand-100 p-4 rounded-2xl flex items-center space-x-3 text-brand-700 text-xs font-semibold max-w-2xl">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. Primary Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Sidebar Nav Buttons */}
        <div className="lg:col-span-3 bg-white p-4 rounded-3xl border border-slate-100 shadow-md space-y-1.5">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-sm font-extrabold transition-all ${activeTab === 'overview'
              ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/10'
              : 'text-slate-600 hover:text-brand-500 hover:bg-slate-50'
              }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Overview Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-sm font-extrabold transition-all ${activeTab === 'bookings'
              ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/10'
              : 'text-slate-600 hover:text-brand-500 hover:bg-slate-50'
              }`}
          >
            <CalendarRange className="h-4 w-4" />
            <span>Bookings Register ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('vehicles')}
            className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-sm font-extrabold transition-all ${activeTab === 'vehicles'
              ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/10'
              : 'text-slate-600 hover:text-brand-500 hover:bg-slate-50'
              }`}
          >
            <CarFront className="h-4 w-4" />
            <span>Manage Fleet ({vehicles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('enquiries')}
            className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-sm font-extrabold transition-all ${activeTab === 'enquiries'
              ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/10'
              : 'text-slate-600 hover:text-brand-500 hover:bg-slate-50'
              }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Messages ({enquiries.length})</span>
          </button>
        </div>

        {/* Dynamic Content Columns */}
        <div className="lg:col-span-9 space-y-10 text-left">
          {activeTab === 'overview' && (
            <div className="space-y-10">
              {/* Analytics grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Total Bookings */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium flex items-center space-x-4">
                  <div className="bg-brand-50 text-brand-500 p-4 rounded-2xl">
                    <FileSpreadsheet className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="block text-slate-400 text-xs font-bold uppercase tracking-wider">Total Bookings</span>
                    <span className="block text-3xl font-black text-slate-900 mt-1">{analytics.totalBookings || bookings.length}</span>
                  </div>
                </div>

                {/* Rev */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium flex items-center space-x-4">
                  <div className="bg-emerald-50 text-emerald-500 p-4 rounded-2xl">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="block text-slate-400 text-xs font-bold uppercase tracking-wider">Est. Revenue</span>
                    <span className="block text-3xl font-black text-slate-900 mt-1">₹{analytics.estimatedRevenue || 0}</span>
                  </div>
                </div>

                {/* Active Pending alerts */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium flex items-center space-x-4">
                  <div className="bg-orange-50 text-brand-600 p-4 rounded-2xl">
                    <Users2 className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="block text-slate-400 text-xs font-bold uppercase tracking-wider">Pending Quotes</span>
                    <span className="block text-3xl font-black text-slate-900 mt-1">
                      {bookings.filter(b => b.status === 'pending').length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent bookings list */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg space-y-6 text-left">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-950 font-sans">Recent Schedule Enquiries</h3>
                  <p className="text-slate-400 text-xs mt-1">Review the latest incoming customer requests.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="pb-3">Customer</th>
                        <th className="pb-3">Vehicle</th>
                        <th className="pb-3">Destination</th>
                        <th className="pb-3 text-right">Estimate</th>
                        <th className="pb-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="font-semibold text-slate-600">
                      {bookings.slice(0, 5).map((b) => (
                        <tr key={b._id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-4">
                            <span className="block text-slate-900 font-bold">{b.customerName}</span>
                            <span className="block text-[10px] text-slate-400 mt-0.5">{b.customerPhone}</span>
                          </td>
                          <td className="py-4">{b.vehicle?.name || 'Selected Ride'}</td>
                          <td className="py-4">{b.dropLocation}</td>
                          <td className="py-4 text-right text-slate-900 font-bold">₹{b.estimatedCost}</td>
                          <td className="py-4 text-right">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${b.status === 'pending' ? 'bg-orange-50 text-brand-600' :
                              b.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' :
                                b.status === 'cancelled' ? 'bg-rose-50 text-rose-600' :
                                  'bg-slate-50 text-slate-600'
                              }`}>
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl space-y-6 text-left">
              <div>
                <h3 className="text-xl font-extrabold text-slate-950">Bookings Registrar</h3>
                <p className="text-slate-400 text-xs mt-1">Review itinerary schedules, quote values, customer details, and update active statuses.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[650px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3">Client details</th>
                      <th className="pb-3">Vehicle</th>
                      <th className="pb-3">Travel details</th>
                      <th className="pb-3 text-right">Quote</th>
                      <th className="pb-3 text-center">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="font-semibold text-slate-600">
                    {bookings.map((b) => (
                      <tr key={b._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="py-4">
                          <span className="block text-slate-900 font-bold">{b.customerName}</span>
                          <span className="block text-[10px] text-slate-400 mt-0.5">{b.customerPhone}</span>
                          <span className="block text-[10px] text-slate-400">{b.customerEmail}</span>
                        </td>
                        <td className="py-4">
                          <span className="block font-bold text-slate-900">{b.vehicle?.name || 'Selected Vehicle'}</span>
                        </td>
                        <td className="py-4">
                          <span className="block font-bold text-slate-900">{b.pickupLocation} ➔ {b.dropLocation}</span>
                          <span className="block text-[10px] text-slate-400 mt-0.5">Pickup: {new Date(b.pickupDate).toLocaleString()}</span>
                          <span className="block text-[10px] text-slate-400">Return: {new Date(b.returnDate).toLocaleString()}</span>
                        </td>
                        <td className="py-4 text-right text-slate-900 font-bold">₹{b.estimatedCost}</td>
                        <td className="py-4 text-center">
                          <div className="flex justify-center space-x-1">
                            <button
                              onClick={() => handleUpdateStatus(b._id, 'confirmed')}
                              title="Confirm Booking"
                              className={`p-1.5 rounded-lg border ${b.status === 'confirmed' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-50 hover:bg-emerald-50 text-slate-500 border-slate-200 hover:text-emerald-500'}`}
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(b._id, 'cancelled')}
                              title="Cancel Booking"
                              className={`p-1.5 rounded-lg border ${b.status === 'cancelled' ? 'bg-rose-500 text-white border-rose-500' : 'bg-slate-50 hover:bg-rose-50 text-slate-500 border-slate-200 hover:text-rose-500'}`}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(b._id, 'completed')}
                              title="Complete Ride"
                              className={`p-1.5 rounded-lg border ${b.status === 'completed' ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-slate-50 hover:bg-indigo-50 text-slate-500 border-slate-200 hover:text-indigo-500'}`}
                            >
                              Done
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'vehicles' && (
            <div className="space-y-6 text-left">
              {/* Add Vehicle Button Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-950">Vehicles & Rates Sheet</h3>
                  <p className="text-slate-400 text-xs mt-1">Manage pricing details per KM and models availability.</p>
                </div>
                <button
                  onClick={() => setShowAddVehicleForm(!showAddVehicleForm)}
                  className="bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center space-x-1 transition-transform hover:-translate-y-0.5"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New Model</span>
                </button>
              </div>

              {/* Add Vehicle Form Panel */}
              {showAddVehicleForm && (
                <form onSubmit={handleAddVehicle} className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-4">
                  <h4 className="font-extrabold text-slate-950 text-sm">Add New Model</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Vehicle Name</label>
                      <input
                        type="text"
                        required
                        value={newVehicle.name}
                        onChange={(e) => setNewVehicle({ ...newVehicle, name: e.target.value })}
                        placeholder="e.g. Suzuki Dzire White TN 84"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Type</label>
                      <select
                        value={newVehicle.type}
                        onChange={(e) => setNewVehicle({ ...newVehicle, type: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                      >
                        <option value="car">Car / Sedan</option>
                        <option value="suv">SUV / Van</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Seats Seating</label>
                      <input
                        type="number"
                        required
                        min="4"
                        max="10"
                        value={newVehicle.seats}
                        onChange={(e) => setNewVehicle({ ...newVehicle, seats: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Rate Per KM (₹)</label>
                      <input
                        type="number"
                        required
                        value={newVehicle.ratePerKm}
                        onChange={(e) => setNewVehicle({ ...newVehicle, ratePerKm: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Features (Comma separated)</label>
                      <input
                        type="text"
                        value={newVehicle.features}
                        onChange={(e) => setNewVehicle({ ...newVehicle, features: e.target.value })}
                        placeholder="AC, Luggage carrier, Cushioned Seats"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-3">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Image URL (Unsplash/Direct link)</label>
                      <input
                        type="url"
                        value={newVehicle.image}
                        onChange={(e) => setNewVehicle({ ...newVehicle, image: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddVehicleForm(false)}
                      className="border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl text-xs font-bold"
                    >
                      Save Model
                    </button>
                  </div>
                </form>
              )}

              {/* Vehicles List Table/Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                {vehicles.map((v) => (
                  <div key={v._id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-md flex items-start space-x-4">
                    <img
                      src={v.image || 'E:/UMA-Grocery Shop/admin/src/assets/car1_new.jpg'}
                      alt={v.name}
                      className="w-20 h-20 object-cover rounded-xl shrink-0"
                    />
                    <div className="flex-grow space-y-2 text-left">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">{v.name}</h4>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                          {v.seats} Seats Capacity
                        </span>
                      </div>

                      {/* Edit Rate Input */}
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold text-slate-500">Rate:</span>
                        <input
                          type="number"
                          defaultValue={v.ratePerKm}
                          onBlur={(e) => handleUpdateVehicleRate(v._id, e.target.value)}
                          className="w-12 px-1 py-0.5 border border-slate-200 rounded text-center text-xs font-bold focus:border-brand-500 focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-400 font-semibold">/ KM</span>
                      </div>

                      {/* Availability toggle toggle */}
                      <div className="flex items-center space-x-2 pt-1">
                        <button
                          onClick={() => handleToggleVehicleAvailability(v._id, v.isAvailable)}
                          className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${v.isAvailable ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                            }`}
                        >
                          {v.isAvailable ? 'Available' : 'Booked / Maintenance'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'enquiries' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl space-y-6 text-left">
              <div>
                <h3 className="text-xl font-extrabold text-slate-950">Customer Messages & Enquiries</h3>
                <p className="text-slate-400 text-xs mt-1">Review contact form submissions and quick messages.</p>
              </div>

              <div className="space-y-4">
                {enquiries.length === 0 ? (
                  <p className="text-slate-500 text-sm py-4">No messages received yet.</p>
                ) : (
                  enquiries.map((enq) => (
                    <div key={enq._id} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-extrabold text-slate-900">{enq.name}</h4>
                          <div className="text-xs text-slate-500 mt-1 flex space-x-3">
                            <span>📞 {enq.phone}</span>
                            <span>✉️ {enq.email}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">
                          {new Date(enq.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-slate-200 text-slate-700 text-sm whitespace-pre-line">
                        {enq.message}
                      </div>
                      <div className="pt-2 flex justify-end">
                        <a
                          href={`https://wa.me/91${enq.phone.replace(/\D/g, '')}?text=Hi%20${enq.name},%20we%20received%20your%20message%20from%20Ayyappa%20Travels.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-brand-50 hover:bg-brand-100 text-brand-600 font-bold px-4 py-2 rounded-xl text-xs transition-colors flex items-center space-x-1"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>Reply on WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
