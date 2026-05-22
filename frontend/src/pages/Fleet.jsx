import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Users, Info, DollarSign, CheckCircle2, ChevronRight, ChevronLeft, Compass, ArrowLeft } from 'lucide-react';
import API from '../utils/api';
import car1 from '../assets/car1_new.jpg';
import car2 from '../assets/car2_new.jpg';
import car3 from '../assets/car3.png';
import car4 from '../assets/car4_new.jpg';

// Exact 4-vehicle fleet details representing Ayyappa Travels Srivilliputtur
const STATIC_VEHICLES = [
  {
    _id: 'fleet_dzire_1',
    name: 'Suzuki Swift Dzire (Windshield Sticker "Ayyappa")',
    type: 'car',
    seats: 5,
    ratePerKm: 12,
    features: ['"Ayyappa" wind-shield sticker', 'Powerful Dual AC', 'Neat cushioned seats', 'Tamil/English speaking expert driver'],
    image: car1,
    description: 'Our standard pristine 5-seater family sedan (TN 84 R 3542) featuring devotional trims. Perfect for quick inter-city runs and temple visits.',
  },
  {
    _id: 'fleet_tavera_1',
    name: 'Chevrolet Tavera Neo',
    type: 'car',
    seats: 10,
    ratePerKm: 14,
    features: ['10 Seater Capacity', 'High roof dual AC cabin', 'Top luggage roof carrier', 'Expert Ghat road driver'],
    image: car2,
    description: 'White spacious Chevrolet Tavera SUV, excellent for large family trips, outstation marriages, and pilgrimage group commutes.',
  },

  {
    _id: 'fleet_supro_van',
    name: 'Mahindra Supro Van (Vel)',
    type: 'car',
    seats: 8,
    ratePerKm: 13,
    features: ['Traditional Devotional Trims', 'Sri Ayyanar Thonai Decals', '8 Seater Capacity', 'Local route specialist driver'],
    image: car4,
    description: 'Dedicated 8-seater pilgrimage van decorated with sacred "വേல்" trims, perfect for local temple circuits and small group runs.',
  },
];

export default function Fleet() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'sedan' | 'suv'
  const [modalVehicle, setModalVehicle] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const selectedCarId = queryParams.get('car');

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await API.get('/vehicles');
        if (response.data && response.data.success && response.data.data.length > 0) {
          const fetchedVehicles = response.data.data.map(v => {
            let localImage = v.image;
            // Override unsplash placeholder images with our actual fleet images
            if (v.name.includes('Dzire') && v.name.includes('Carrier')) localImage = car3;
            else if (v.name.includes('Tavera')) localImage = car2;
            else if (v.name.includes('Dzire')) localImage = car1;
            else if (v.name.includes('Supro')) localImage = car4;
            
            return { ...v, image: localImage };
          });
          setVehicles(fetchedVehicles);
        } else {
          setVehicles(STATIC_VEHICLES);
        }
      } catch (err) {
        console.warn('Could not fetch vehicles from server, loading static fleet catalog.', err);
        setVehicles(STATIC_VEHICLES);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  // Filter vehicles based on custom category or selected car
  const filteredVehicles = vehicles.filter((v) => {
    if (selectedCarId) return v._id === selectedCarId || v.name.toLowerCase().includes(selectedCarId.toLowerCase());
    if (activeTab === 'all') return true;
    if (activeTab === 'sedan') return v.seats <= 5;
    if (activeTab === 'suv') return v.seats > 5;
    return true;
  });

  const handleBookNow = (vehicle) => {
    navigate(`/booking?vehicleId=${vehicle._id}`);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-semibold animate-pulse">Loading Ayyappa Travels Premium Fleet...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 py-6">
      {/* 1. Header banner */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        {selectedCarId ? (
          <>
            <div className="inline-flex items-center space-x-1.5 bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest border border-brand-100">
              <Compass className="h-4 w-4 shrink-0" />
              <span>Vehicle Details</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-none">
              Selected Vehicle Details
            </h1>
            <div className="pt-4">
              <Link to="/fleet" className="inline-flex items-center space-x-2 text-brand-600 hover:text-brand-700 font-bold bg-brand-50 hover:bg-brand-100 px-5 py-2.5 rounded-xl transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <span>View All Fleet</span>
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="inline-flex items-center space-x-1.5 bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest border border-brand-100">
              <Compass className="h-4 w-4 shrink-0" />
              <span>Our Complete Rate Sheet</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-none">
              Explore Our Fleet & Rates
            </h1>
            <p className="text-slate-500 text-lg leading-relaxed">
              From highly robust family sedans to 10-seater spacious White Chevrolet Tavera SUVs, Ayyappa Travels operates a direct, well-maintained private fleet. All rates are 100% transparent.
            </p>
          </>
        )}
      </section>

      {/* 2. Custom Tabs/Filters */}
      {!selectedCarId && (
        <section className="flex justify-center">
          <div className="bg-white p-1.5 rounded-2xl border border-slate-100 shadow-md inline-flex space-x-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'all'
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                  : 'text-slate-600 hover:text-brand-500 hover:bg-slate-50'
              }`}
            >
              All Vehicles ({vehicles.length})
            </button>
            <button
              onClick={() => setActiveTab('sedan')}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'sedan'
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                  : 'text-slate-600 hover:text-brand-500 hover:bg-slate-50'
              }`}
            >
              Sedans ({vehicles.filter(v => v.seats <= 5).length})
            </button>
            <button
              onClick={() => setActiveTab('suv')}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'suv'
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                  : 'text-slate-600 hover:text-brand-500 hover:bg-slate-50'
              }`}
            >
              SUVs & Vans ({vehicles.filter(v => v.seats > 5).length})
            </button>
          </div>
        </section>
      )}

      {/* 3. Vehicles Grid */}
      <section className={`grid grid-cols-1 ${selectedCarId ? 'max-w-2xl' : 'md:grid-cols-2 lg:grid-cols-2 max-w-5xl'} gap-12 pb-12 mx-auto`}>
        {filteredVehicles.map((vehicle) => (
          <div key={vehicle._id} className="premium-card flex flex-col overflow-hidden group">
            {/* Image section */}
            <div className="relative h-64 overflow-hidden cursor-pointer" onClick={() => { setModalVehicle(vehicle); setCurrentImageIndex(0); }}>
              <img
                src={vehicle.image}
                alt={vehicle.name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm shadow-md border border-slate-100 px-3 py-1 rounded-full flex items-center space-x-1.5">
                <Users className="h-4 w-4 text-brand-500" />
                <span className="text-slate-800 text-xs font-bold">{vehicle.seats} Seater Capacity</span>
              </div>
              <div className="absolute bottom-4 right-4 bg-brand-500 text-white px-4 py-1.5 rounded-2xl font-black text-sm shadow-lg shadow-brand-500/20">
                ₹{vehicle.ratePerKm} / KM
              </div>
            </div>

            {/* Content section */}
            <div className="p-6 text-left flex-grow flex flex-col justify-between space-y-6 bg-white">
              <div className="space-y-3">
                <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-brand-500 transition-colors">
                  {vehicle.name}
                </h3>
                {vehicle.description && (
                  <p className="text-slate-500 text-xs leading-relaxed">
                    {vehicle.description}
                  </p>
                )}

                {/* Features checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {vehicle.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-xs font-medium text-slate-600">
                      <CheckCircle2 className="h-4 w-4 text-brand-500 shrink-0" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTAs */}
              <button
                onClick={() => handleBookNow(vehicle)}
                className="w-full bg-slate-900 hover:bg-brand-500 text-white group-hover:bg-brand-500 font-extrabold py-3.5 rounded-2xl shadow-md hover:shadow-brand-500/20 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>Select & Calculate Estimate</span>
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* 4. Mini alert notice */}
      <section className="bg-orange-50 border border-brand-100 p-6 rounded-2xl max-w-4xl mx-auto flex items-start space-x-4 text-left pb-12">
        <Info className="h-6 w-6 text-brand-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-brand-800 text-sm">Need a vehicle with customized configurations?</h4>
          <p className="text-slate-600 text-xs leading-relaxed">
            If you need customized temple trip schedules, multiple pickup locations near Srivilliputtur, or customized overnight stays, please feel free to call us directly at <a href="tel:+919150549150" className="font-extrabold text-brand-600 underline">+91-9150549150</a>. We will be delighted to coordinate your travel route!
          </p>
        </div>
      </section>

      {/* Image Gallery Modal */}
      {modalVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm" onClick={() => setModalVehicle(null)}>
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setModalVehicle(null)} className="absolute top-4 right-4 z-20 bg-black/50 text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-brand-500 transition-colors">
              ✕
            </button>
            
            {/* Image Carousel */}
            <div className="relative h-64 sm:h-80 w-full overflow-hidden flex items-center justify-center bg-slate-100 group">
               <img src={[modalVehicle.image, car3, car4][currentImageIndex]} className="w-full h-full object-cover transition-all" alt="Car view" />
               
               <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-10">
                  {[modalVehicle.image, car3, car4].map((_, idx) => (
                    <button 
                       key={idx} 
                       onClick={() => setCurrentImageIndex(idx)}
                       className={`w-2.5 h-2.5 rounded-full ${currentImageIndex === idx ? 'bg-brand-500 scale-125' : 'bg-white/60'} transition-all`} 
                    />
                  ))}
               </div>
               
               {/* Prev / Next arrows */}
               <button className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-slate-800 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10" onClick={() => setCurrentImageIndex(i => i === 0 ? 2 : i - 1)}>
                  <ChevronLeft className="h-5 w-5" />
               </button>
               <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-slate-800 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10" onClick={() => setCurrentImageIndex(i => (i + 1) % 3)}>
                  <ChevronRight className="h-5 w-5" />
               </button>
            </div>

            {/* Details underneath */}
            <div className="p-6 sm:p-8 text-left bg-white">
               <h3 className="text-2xl font-extrabold text-slate-900 mb-2">{modalVehicle.name}</h3>
               <p className="text-slate-500 text-sm mb-6 leading-relaxed">{modalVehicle.description}</p>
               
               <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-3">Vehicle Features</h4>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  {modalVehicle.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-sm font-medium text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <CheckCircle2 className="h-4 w-4 text-brand-500 shrink-0" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
               </div>
               
               <button onClick={() => { setModalVehicle(null); handleBookNow(modalVehicle); }} className="w-full bg-brand-500 hover:bg-brand-600 text-white font-extrabold py-3.5 rounded-2xl shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center space-x-2">
                  <span>Calculate Quote (₹{modalVehicle.ratePerKm}/KM)</span>
                  <ChevronRight className="h-4 w-4" />
               </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
