import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Calendar, MapPin, User, Mail, Phone, Calculator, CheckCircle, ChevronLeft, ChevronRight, Car, Compass, AlertCircle } from 'lucide-react';
import API from '../utils/api';

const STATIC_VEHICLES = [
  { _id: 'fleet_dzire_1', name: 'Suzuki Swift Dzire ("Ayyappa" sticker - 5 Seater)', type: 'car', ratePerKm: 12, seats: 5 },
  { _id: 'fleet_tavera_1', name: 'Chevrolet Tavera Neo (10 Seater SUV)', type: 'car', ratePerKm: 14, seats: 10 },
  { _id: 'fleet_supro_van', name: 'Mahindra Supro Van (Vel - 8 Seater)', type: 'car', ratePerKm: 13, seats: 8 },
];

const formatDateStr = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d)) return dateString;
  const pad = (n) => (n < 10 ? '0' + n : n);
  let hours = d.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(hours)}:${pad(d.getMinutes())} ${ampm}`;
};

// Parse dd/mm/yyyy HH:MM into an ISO date string for internal use
const parseDdMmYyyy = (raw) => {
  if (!raw) return '';
  // Accept formats: dd/mm/yyyy HH:MM  or  dd/mm/yyyy
  const trimmed = raw.trim();
  const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/);
  if (!match) return '';
  const [, dd, mm, yyyy, hh = '00', min = '00'] = match;
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min));
  return isNaN(date) ? '' : date.toISOString();
};

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const preSelectedVehicleId = searchParams.get('vehicleId');

  // Multi-step state: 1 = Itinerary, 2 = Vehicle & Quote, 3 = Personal Details, 4 = Success
  const [step, setStep] = useState(1);
  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successData, setSuccessData] = useState(null);

  // Split date + time state for pickup and return
  const [pickupDatePart, setPickupDatePart] = useState('');
  const [pickupTimePart, setPickupTimePart] = useState('');
  const [returnDatePart, setReturnDatePart] = useState('');
  const [returnTimePart, setReturnTimePart] = useState('');

  // Refs for hidden native date pickers (triggered by calendar icon click)
  const pickupDatePickerRef = useRef(null);
  const returnDatePickerRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    pickupLocation: '54 D, Ayyampatti, Srivilliputtur',
    dropLocation: '',
    pickupDate: '',
    returnDate: '',
    estimatedDistance: 100,
    groupSize: 1,
    vehicle: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    specialInstructions: '',
  });

  // Load Vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await API.get('/vehicles');
        if (response.data && response.data.success && response.data.data.length > 0) {
          setVehicles(response.data.data);
        } else {
          setVehicles(STATIC_VEHICLES);
        }
      } catch (err) {
        console.warn('Backend unavailable, loading static fallback vehicles catalog.', err);
        setVehicles(STATIC_VEHICLES);
      } finally {
        setLoadingVehicles(false);
      }
    };

    fetchVehicles();
  }, []);

  // Pre-select vehicle if passed from Fleet page
  useEffect(() => {
    if (vehicles.length > 0 && preSelectedVehicleId) {
      const match = vehicles.find((v) => v._id === preSelectedVehicleId);
      if (match) {
        setFormData((prev) => ({ ...prev, vehicle: preSelectedVehicleId }));
        // Removed setStep(2) to ensure user fills out Itinerary first
      }
    }
  }, [vehicles, preSelectedVehicleId]);

  // Handle Form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage('');
  };

  // Handle split date + time inputs
  const handlePickupDatePart = (e) => {
    const val = e.target.value;
    setPickupDatePart(val);
    const iso = parseDdMmYyyy(`${val} ${pickupTimePart || '00:00'}`);
    setFormData((prev) => ({ ...prev, pickupDate: iso }));
    setErrorMessage('');
  };
  const handlePickupTimePart = (e) => {
    const val = e.target.value;
    setPickupTimePart(val);
    const iso = parseDdMmYyyy(`${pickupDatePart} ${val || '00:00'}`);
    setFormData((prev) => ({ ...prev, pickupDate: iso }));
    setErrorMessage('');
  };
  // Called when native hidden date picker value changes (calendar icon click)
  const handlePickupNativePicker = (e) => {
    const val = e.target.value; // yyyy-mm-dd
    if (!val) return;
    const [yyyy, mm, dd] = val.split('-');
    const formatted = `${dd}/${mm}/${yyyy}`;
    setPickupDatePart(formatted);
    const iso = parseDdMmYyyy(`${formatted} ${pickupTimePart || '00:00'}`);
    setFormData((prev) => ({ ...prev, pickupDate: iso }));
    setErrorMessage('');
  };

  const handleReturnDatePart = (e) => {
    const val = e.target.value;
    setReturnDatePart(val);
    const iso = parseDdMmYyyy(`${val} ${returnTimePart || '00:00'}`);
    setFormData((prev) => ({ ...prev, returnDate: iso }));
    setErrorMessage('');
  };
  const handleReturnTimePart = (e) => {
    const val = e.target.value;
    setReturnTimePart(val);
    const iso = parseDdMmYyyy(`${returnDatePart} ${val || '00:00'}`);
    setFormData((prev) => ({ ...prev, returnDate: iso }));
    setErrorMessage('');
  };
  // Called when native hidden date picker value changes (calendar icon click)
  const handleReturnNativePicker = (e) => {
    const val = e.target.value; // yyyy-mm-dd
    if (!val) return;
    const [yyyy, mm, dd] = val.split('-');
    const formatted = `${dd}/${mm}/${yyyy}`;
    setReturnDatePart(formatted);
    const iso = parseDdMmYyyy(`${formatted} ${returnTimePart || '00:00'}`);
    setFormData((prev) => ({ ...prev, returnDate: iso }));
    setErrorMessage('');
  };

  // Pricing Estimations Breakdown
  const selectedVehicleObj = vehicles.find((v) => v._id === formData.vehicle);
  
  const calculateEstimate = () => {
    if (!selectedVehicleObj) return { baseCost: 0, tolls: 0, driverAllowance: 0, total: 0 };
    
    const distance = Number(formData.estimatedDistance) || 1;
    const rate = selectedVehicleObj.ratePerKm;
    const baseCost = distance * rate;

    // Toll threshold logic
    let tolls = 0;
    if (distance > 100) tolls = 300;
    if (distance > 200) tolls = 600;
    if (distance > 400) tolls = 1200;

    // Days Count calculation
    let daysCount = 1;
    if (formData.pickupDate && formData.returnDate) {
      const d1 = new Date(formData.pickupDate);
      const d2 = new Date(formData.returnDate);
      const diffTime = Math.abs(d2 - d1);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      daysCount = diffDays || 1;
    }
    const driverAllowance = daysCount * 300;

    const total = baseCost + tolls + driverAllowance;

    return {
      baseCost,
      tolls,
      driverAllowance,
      daysCount,
      total,
    };
  };

  const estimate = calculateEstimate();

  // Next/Back Step Validation
  const nextStep = () => {
    if (step === 1) {
      if (!formData.pickupLocation.trim() || !formData.dropLocation.trim() || !formData.pickupDate || !formData.returnDate || !formData.estimatedDistance) {
        setErrorMessage('Please fill in all itinerary fields');
        return;
      }
      if (new Date(formData.returnDate) <= new Date(formData.pickupDate)) {
        setErrorMessage('Return Date must be after Pickup Date');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.vehicle) {
        setErrorMessage('Please choose a vehicle to calculate your quote');
        return;
      }
      setStep(3);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      setErrorMessage('');
    }
  };

  // Submit Final Booking Quote Request to Backend
  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!formData.customerName.trim() || !formData.customerEmail.trim() || !formData.customerPhone.trim()) {
      setErrorMessage('Please fill in your name, email and contact phone');
      return;
    }

    setSubmittingBooking(true);
    setErrorMessage('');

    try {
      const payload = {
        ...formData,
        estimatedDistance: Number(formData.estimatedDistance),
        groupSize: Number(formData.groupSize) || 1,
      };

      const response = await API.post('/bookings', payload);
      if (response.data && response.data.success) {
        setSuccessData(response.data);
        setStep(4); // Success step
      } else {
        setErrorMessage(response.data.message || 'Error submitting booking. Please try again.');
      }
    } catch (err) {
      console.error('Booking submission error:', err);
      const msg =
        err?.response?.data?.message ||
        'Unable to reach the server. Please make sure the backend is running, or contact us directly on WhatsApp at +91-9150549150.';
      setErrorMessage(msg);
    } finally {
      setSubmittingBooking(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 py-6">
      {/* 1. Step Progress Indicators */}
      <section className="flex items-center justify-between max-w-xl mx-auto border-b border-slate-200 pb-6">
        {[
          { label: 'Itinerary', num: 1 },
          { label: 'Vehicle & Quote', num: 2 },
          { label: 'Your Info', num: 3 },
          { label: 'Confirmed', num: 4 },
        ].map((item) => (
          <div key={item.num} className="flex items-center space-x-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors duration-300 ${
                step === item.num
                  ? 'bg-brand-500 text-white shadow-md'
                  : step > item.num
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {step > item.num ? '✓' : item.num}
            </div>
            <span
              className={`text-xs font-bold hidden sm:inline transition-colors duration-300 ${
                step === item.num ? 'text-slate-900' : 'text-slate-400'
              }`}
            >
              {item.label}
            </span>
          </div>
        ))}
      </section>

      {errorMessage && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center space-x-3 text-red-700 text-sm max-w-xl mx-auto text-left">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 2. Step Layout Switcher */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden text-left">
        {step === 1 && (
          <div className="p-8 sm:p-10 space-y-8 text-left">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Define Your Route</h2>
              <p className="text-slate-400 text-xs mt-1">Specify your pickup points, return dates, and estimate your trip distance.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pickup Location */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Pickup Point (Srivilliputtur Hub)</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-brand-500" />
                  <input
                    type="text"
                    name="pickupLocation"
                    value={formData.pickupLocation}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>

              {/* Drop Location */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Drop / Destination City</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    name="dropLocation"
                    placeholder="e.g. Madurai Airport, Courtallam, Chennai, Rameswaram"
                    value={formData.dropLocation}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>

              {/* Pickup Date & Time */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Pickup Date & Time</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    {/* Hidden native date picker triggered by calendar icon */}
                    <input
                      ref={pickupDatePickerRef}
                      type="date"
                      onChange={handlePickupNativePicker}
                      className="absolute inset-0 opacity-0 w-0 h-0 pointer-events-none"
                      tabIndex={-1}
                    />
                    <button
                      type="button"
                      onClick={() => pickupDatePickerRef.current?.showPicker()}
                      className="absolute left-3 top-3.5 h-4 w-4 text-brand-500 hover:text-brand-600 transition-colors cursor-pointer z-10"
                      title="Open calendar"
                    >
                      <Calendar className="h-4 w-4" />
                    </button>
                    <input
                      type="text"
                      value={pickupDatePart}
                      onChange={handlePickupDatePart}
                      placeholder="dd/mm/yyyy"
                      maxLength={10}
                      className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                    />
                  </div>
                  <div className="relative w-28">
                    <input
                      type="time"
                      value={pickupTimePart}
                      onChange={handlePickupTimePart}
                      className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                    />
                  </div>
                </div>
                <p className="text-[10px] font-semibold text-slate-400 pl-1">Click 📅 to pick date &nbsp;|&nbsp; Then set time</p>
              </div>

              {/* Return Date & Time */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Return Date & Time</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    {/* Hidden native date picker triggered by calendar icon */}
                    <input
                      ref={returnDatePickerRef}
                      type="date"
                      onChange={handleReturnNativePicker}
                      className="absolute inset-0 opacity-0 w-0 h-0 pointer-events-none"
                      tabIndex={-1}
                    />
                    <button
                      type="button"
                      onClick={() => returnDatePickerRef.current?.showPicker()}
                      className="absolute left-3 top-3.5 h-4 w-4 text-brand-500 hover:text-brand-600 transition-colors cursor-pointer z-10"
                      title="Open calendar"
                    >
                      <Calendar className="h-4 w-4" />
                    </button>
                    <input
                      type="text"
                      value={returnDatePart}
                      onChange={handleReturnDatePart}
                      placeholder="dd/mm/yyyy"
                      maxLength={10}
                      className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                    />
                  </div>
                  <div className="relative w-28">
                    <input
                      type="time"
                      value={returnTimePart}
                      onChange={handleReturnTimePart}
                      className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                    />
                  </div>
                </div>
                <p className="text-[10px] font-semibold text-slate-400 pl-1">Click 📅 to pick date &nbsp;|&nbsp; Then set time</p>
              </div>

              {/* Estimated Distance */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Estimated Round Trip (KM)</label>
                <div className="relative">
                  <Calculator className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                  <input
                    type="number"
                    name="estimatedDistance"
                    min="1"
                    placeholder="Enter total estimated KMs"
                    value={formData.estimatedDistance}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
                <p className="text-[10px] font-semibold text-slate-400 leading-none pl-2">
                  Tip: Madurai roundtrip is ~160km. Courtallam roundtrip is ~140km.
                </p>
              </div>

              {/* Group Size */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Number of Travelers</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                  <input
                    type="number"
                    name="groupSize"
                    min="1"
                    max="10"
                    value={formData.groupSize}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Step Navigation */}
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={nextStep}
                className="bg-brand-500 hover:bg-brand-600 text-white font-extrabold px-8 py-3.5 rounded-2xl shadow-lg shadow-brand-500/10 flex items-center space-x-1"
              >
                <span>Select Vehicle</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-8 sm:p-10 space-y-8 text-left">
            <div>
              <h2 className="text-2xl font-black text-slate-900 font-sans">Choose Vehicle & Calculate Quote</h2>
              <p className="text-slate-400 text-xs mt-1">Select from our family sedans or SUVs. Rates update live below.</p>
            </div>

            {loadingVehicles ? (
              <div className="py-12 text-center text-slate-400 font-semibold flex flex-col items-center justify-center space-y-2">
                <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                <span>Fetching live pricing and vehicles list...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Vehicles Picker List */}
                <div className="lg:col-span-7 space-y-3 max-h-[350px] overflow-y-auto pr-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Available Options</label>
                  {vehicles.map((v) => (
                    <div
                      key={v._id}
                      onClick={() => setFormData((prev) => ({ ...prev, vehicle: v._id }))}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                        formData.vehicle === v._id
                          ? 'border-brand-500 bg-brand-50/20'
                          : 'border-slate-100 hover:border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3 text-left">
                        <div className={`p-2 rounded-xl ${formData.vehicle === v._id ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                          <Car className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900">{v.name}</h4>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            {v.seats} Seats Capacity
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="block font-black text-slate-900 text-sm">₹{v.ratePerKm}/km</span>
                        <span className="block text-[9px] text-slate-400">base rate</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Live Cost Summary Breakdown */}
                <div className="lg:col-span-5 bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-6 text-left">
                  <h3 className="font-extrabold text-slate-950 text-sm border-b border-slate-200 pb-3 uppercase tracking-wider flex items-center space-x-2">
                    <Compass className="h-4 w-4 text-brand-500" />
                    <span>Estimated Cost breakdown</span>
                  </h3>

                  {formData.vehicle ? (
                    <div className="space-y-4 text-xs font-medium text-slate-600">
                      {/* Breakdown Rows */}
                      <div className="flex justify-between">
                        <span>Base Ride (₹{selectedVehicleObj?.ratePerKm}/km × {formData.estimatedDistance}km)</span>
                        <span className="font-bold text-slate-900">₹{estimate.baseCost}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Toll Fees (Estimated distance-based)</span>
                        <span className="font-bold text-slate-900">₹{estimate.tolls}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Driver Allowance ({estimate.daysCount} Days × ₹300)</span>
                        <span className="font-bold text-slate-900">₹{estimate.driverAllowance}</span>
                      </div>
                      <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-left">
                        <span className="font-extrabold text-slate-900 text-sm">Total Estimate</span>
                        <span className="font-black text-brand-500 text-xl">₹{estimate.total}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 italic leading-snug">
                        * Note: State permits and actual toll booth charges are calculated dynamically.
                      </p>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-slate-400">
                      <Calculator className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                      <p className="text-xs">Pick a vehicle to view pricing breakdown</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                onClick={prevStep}
                className="border border-slate-200 hover:bg-slate-50 text-slate-600 font-extrabold px-6 py-3.5 rounded-2xl flex items-center space-x-1"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Itinerary</span>
              </button>
              <button
                onClick={nextStep}
                className="bg-brand-500 hover:bg-brand-600 text-white font-extrabold px-8 py-3.5 rounded-2xl shadow-lg shadow-brand-500/10 flex items-center space-x-1"
              >
                <span>Add Details</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleSubmitBooking} className="p-8 sm:p-10 space-y-8 text-left">
            <div>
              <h2 className="text-2xl font-black text-slate-900 font-sans">Contact Details & Confirm</h2>
              <p className="text-slate-400 text-xs mt-1">Provide your contact details so we can block your dates and dispatch your vehicle.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Name */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Your Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    name="customerName"
                    required
                    placeholder="e.g. Anand Kumar"
                    value={formData.customerName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>

              {/* Customer Email */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Your Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    name="customerEmail"
                    required
                    placeholder="e.g. anand@gmail.com"
                    value={formData.customerEmail}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>

              {/* Customer Phone */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Your Contact Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                  <input
                    type="tel"
                    name="customerPhone"
                    required
                    placeholder="e.g. +91 9150549150"
                    value={formData.customerPhone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>

              {/* Special Instructions */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">Special Instructions / Requests (Optional)</label>
                <textarea
                  name="specialInstructions"
                  rows="3"
                  placeholder="Need luggage carrier / specific driver preferences..."
                  value={formData.specialInstructions}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            {/* Quick Summary overview */}
            <div className="bg-orange-50/40 p-5 rounded-2xl border border-brand-100 flex justify-between items-center text-left">
              <div>
                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Selected Trip</span>
                <span className="block text-sm font-extrabold text-slate-800 mt-0.5">
                  {selectedVehicleObj?.name} to {formData.dropLocation} ({formData.estimatedDistance} KM)
                </span>
              </div>
              <div className="text-right">
                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Estimated Total Quote</span>
                <span className="block text-xl font-black text-brand-600">₹{estimate.total}</span>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={prevStep}
                className="border border-slate-200 hover:bg-slate-50 text-slate-600 font-extrabold px-6 py-3.5 rounded-2xl flex items-center space-x-1"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Vehicle Options</span>
              </button>
              <button
                type="submit"
                disabled={submittingBooking}
                className="bg-brand-500 hover:bg-brand-600 disabled:bg-slate-400 text-white font-extrabold px-8 py-3.5 rounded-2xl shadow-lg shadow-brand-500/10 flex items-center space-x-1"
              >
                <span>{submittingBooking ? 'Submitting Request...' : 'Request Quote Receipt'}</span>
                {!submittingBooking && <ChevronRight className="h-4 w-4" />}
              </button>
            </div>
          </form>
        )}

        {step === 4 && successData && (
          <div className="p-10 text-center space-y-8 max-w-xl mx-auto">
            <div className="inline-flex p-4 bg-emerald-50 text-emerald-500 rounded-full">
              <CheckCircle className="h-16 w-16" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black text-slate-900 font-sans">Booking Request Sent!</h2>
              <p className="text-slate-500 text-sm">
                Hi <strong className="text-slate-900">{successData.data.customerName}</strong>, we have received your trip booking request to <strong className="text-slate-900">{formData.dropLocation}</strong>!
              </p>
            </div>

            {/* Printable summary receipt */}
            <div className="border border-slate-100 rounded-3xl p-6 bg-slate-50 space-y-4 text-xs font-semibold text-slate-600 text-left">
              <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-200 pb-2 uppercase tracking-wider">
                Ayyappa Travels Travel Receipt
              </h3>
              <div className="flex justify-between">
                <span>Route</span>
                <span className="text-slate-900">{successData.data.pickupLocation} ➔ {successData.data.dropLocation}</span>
              </div>
              <div className="flex justify-between">
                <span>Pickup Date</span>
                <span className="text-slate-900">{formatDateStr(formData.pickupDate)}</span>
              </div>
              <div className="flex justify-between">
                <span>Return Date</span>
                <span className="text-slate-900">{formatDateStr(formData.returnDate)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Distance</span>
                <span className="text-slate-900">{formData.estimatedDistance} KM</span>
              </div>
              <div className="flex justify-between">
                <span>Total Estimated Cost</span>
                <span className="text-brand-500 text-base font-black">₹{successData.data.estimatedCost || estimate.total}</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal italic pt-2 border-t border-slate-200">
                A verification summary email has been forwarded to <strong>{formData.customerEmail}</strong>. Our booking desk will contact you at <strong>{successData.data.customerPhone}</strong> shortly.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href={`https://wa.me/919150549150?text=Hi%20Ayyappa%20Travels,%20I%20have%20submitted%20a%20booking%20receipt%20for%20my%20trip%20to%20${formData.dropLocation}%20estimated%20at%20Rs.%20${successData.data.estimatedCost || estimate.total}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold px-8 py-3.5 rounded-2xl shadow-lg shadow-emerald-500/10 flex items-center justify-center space-x-2 w-full sm:w-auto"
              >
                <span>Confirm on WhatsApp</span>
              </a>
              <Link
                to="/"
                className="border border-slate-200 hover:bg-slate-50 text-slate-600 font-extrabold px-8 py-3.5 rounded-2xl w-full sm:w-auto block text-center"
              >
                Go to Homepage
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
