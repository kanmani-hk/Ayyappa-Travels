import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, Star, Phone, ShieldCheck, Clock, MapPin, ArrowRight, Sparkles } from 'lucide-react';
import car1 from '../assets/car1_new.jpg';
import car2 from '../assets/car2_new.jpg';
import car4 from '../assets/car4_new.jpg';

function FadeIn({ children, delay = 0 }) {
  const domRef = useRef();
  
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -50px 0px' });
    
    if (domRef.current) observer.observe(domRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={domRef} 
      style={{ opacity: 0, transform: 'translateY(40px)', transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const heroBackgrounds = [
    "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=1600&auto=format&fit=crop"
  ];
  
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  useEffect(() => {
    const bgInterval = setInterval(() => {
      setCurrentBgIndex((prevIndex) => (prevIndex + 1) % heroBackgrounds.length);
    }, 5000);
    return () => clearInterval(bgInterval);
  }, []);

  const fleetItems = [
    {
      id: 'dzire',
      name: 'Suzuki Swift Dzire (5 Seats)',
      category: 'Sedans & Hatchbacks',
      image: car1,
      description: 'Featuring our highly reliable family sedans (TN 84 R 3542) with powerful air conditioning and optional robust luggage carriers. Spotless cabins decorated with devotion, ideal for small families.',
      rate: 'Starting at ₹12 / KM',
      link: '/fleet?car=dzire'
    },
    {
      id: 'tavera',
      name: 'Chevrolet Tavera Neo (10 Seats)',
      category: 'Multi-Utility SUVs',
      image: car2,
      description: 'Our flagship 10-seater White Chevrolet Tavera Neo. Features high-roof spacious seating, dual high-power AC units, and heavy top luggage carriers. Ideal for weddings, pilgrimage groups, and hill tours.',
      rate: 'Starting at ₹14 / KM',
      link: '/fleet?car=tavera'
    },
    {
      id: 'supro',
      name: 'Tata Ace / Mahindra Supro',
      category: 'Vans & Mini Trucks',
      image: car4,
      description: 'Dedicated pilgrimage van decorated with sacred trims, perfect for local temple circuits, small group runs and cargo hauling with secure top cover.',
      rate: 'Starting at ₹13 / KM',
      link: '/fleet?car=supro'
    }
  ];

  const duplicatedFleetItems = [...fleetItems, ...fleetItems, ...fleetItems, ...fleetItems, ...fleetItems, ...fleetItems];


  return (
    <div className="space-y-24">
      {/* 1. Hero Section */}
      <FadeIn delay={0}>
        <section className="relative overflow-hidden min-h-[85vh] flex items-center px-4 sm:px-6 lg:px-8">
          {/* Background Slideshow with overlay gradient */}
          <div className="absolute inset-0 z-0">
            {heroBackgrounds.map((bgUrl, index) => (
              <img
                key={index}
                src={bgUrl}
                alt={`Ayyappa Travels Hero Background ${index + 1}`}
                className={`absolute inset-0 w-full h-full object-cover object-center filter scale-105 brightness-[0.35] transition-opacity duration-1000 ${
                  index === currentBgIndex ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900/90 to-brand-950/20" />
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-8 text-left">
              {/* Tagline Badge */}
              <div className="inline-flex items-center space-x-2 bg-brand-500/10 border border-brand-500/30 text-brand-400 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest animate-pulse">
                <Sparkles className="h-4 w-4 shrink-0" />
                <span>Srivilliputtur & Southern Tamil Nadu's Elite Private Fleet</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.1] font-sans">
                Specialized Private Car & <br />
                <span className="text-brand-500 bg-clip-text">Pilgrimage Outstation</span> Rentals
              </h1>

              {/* Description */}
              <p className="text-slate-300 text-lg max-w-xl font-medium leading-relaxed">
                No complex tours, no giant buses. We specialize strictly in well-maintained 5-seater sedans, 10-seater spacious family SUVs, and 8-seater local/pilgrimage vans. Based in Ayyampatti, Srivilliputtur.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link
                  to="/booking"
                  className="bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-center px-8 py-4 rounded-2xl shadow-xl shadow-brand-500/20 hover:shadow-brand-600/30 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <span>Calculate Instant Quote</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/fleet"
                  className="border-2 border-slate-700 hover:border-brand-500 bg-slate-900/40 text-slate-200 hover:text-white font-extrabold text-center px-8 py-4 rounded-2xl backdrop-blur-sm hover:-translate-y-0.5 transition-all duration-300"
                >
                  View Rates per KM
                </Link>
              </div>

              {/* Key trust indicators */}
              <div className="grid grid-cols-3 gap-6 pt-4 border-t border-slate-800/80 max-w-lg">
                <div>
                  <span className="block text-2xl font-extrabold text-white">₹12/km</span>
                  <span className="block text-xs text-slate-400 mt-1">Car Base Rate</span>
                </div>
                <div>
                  <span className="block text-2xl font-extrabold text-white">₹14/km</span>
                  <span className="block text-xs text-slate-400 mt-1">SUV Base Rate</span>
                </div>
                <div>
                  <span className="block text-2xl font-extrabold text-white">100%</span>
                  <span className="block text-xs text-slate-400 mt-1">Driver & AC Included</span>
                </div>
              </div>
            </div>

            {/* Quick Quote Floating Card (Desktop-Only) */}
            <div className="lg:col-span-5 hidden lg:block">
              <div className="glass-dark border border-slate-700/50 p-8 rounded-3xl shadow-2xl space-y-6 text-left">
                <div>
                  <h3 className="text-xl font-extrabold text-white">Plan Your Journey</h3>
                  <p className="text-slate-400 text-xs mt-1">Get an estimated travel cost in 10 seconds.</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">From</label>
                      <div className="bg-slate-800/50 border border-slate-700 p-3 rounded-xl text-slate-300 text-sm">
                        Ayyampatti, Srivilliputtur
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">To</label>
                      <div className="bg-slate-800/50 border border-slate-700 p-3 rounded-xl text-slate-300 text-sm">
                        Madurai / Courtallam / Temple
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Seating Capacity</label>
                    <div className="bg-slate-800/50 border border-slate-700 p-3 rounded-xl text-slate-300 text-sm">
                      Select 5 to 10 Seaters
                    </div>
                  </div>

                  <Link
                    to="/booking"
                    className="block text-center bg-brand-500 hover:bg-brand-600 text-white font-extrabold py-3.5 rounded-2xl shadow-lg transition-colors"
                  >
                    Go to Estimator Form
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* 2. Trust Badges / Stats banner */}
      <FadeIn delay={200}>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex items-center space-x-4 border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0 md:pr-6">
              <div className="bg-brand-50 p-3.5 rounded-2xl text-brand-600">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="text-left">
                <h4 className="font-extrabold text-slate-900 text-sm">Elite Security</h4>
                <p className="text-slate-500 text-xs mt-1">Experienced Ghat-road drivers</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0 md:pr-6">
              <div className="bg-brand-50 p-3.5 rounded-2xl text-brand-600">
                <Star className="h-6 w-6" />
              </div>
              <div className="text-left">
                <h4 className="font-extrabold text-slate-900 text-sm">5-Star Reputation</h4>
                <p className="text-slate-500 text-xs mt-1">Excellent client feedback</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0 md:pr-6">
              <div className="bg-brand-50 p-3.5 rounded-2xl text-brand-600">
                <Clock className="h-6 w-6" />
              </div>
              <div className="text-left">
                <h4 className="font-extrabold text-slate-900 text-sm">Always Punctual</h4>
                <p className="text-slate-500 text-xs mt-1">Strict adherence to timings</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="bg-brand-50 p-3.5 rounded-2xl text-brand-600">
                <Phone className="h-6 w-6 animate-bounce" />
              </div>
              <div className="text-left">
                <h4 className="font-extrabold text-slate-900 text-sm">Insta Booking</h4>
                <p className="text-slate-500 text-xs mt-1">Instant confirmation quotes</p>
              </div>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* 3. Specialization Showcase (Strictly family cars/SUVs) */}
      <FadeIn delay={100}>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-500">Unmatched Quality</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Our Private Vehicle Fleet</h2>
            <p className="text-slate-500 text-base">
              We operate exclusively with our own meticulously cleaned, well-maintained private vehicles. Pick the perfect seating setup for your trip.
            </p>
          </div>

          <div className="overflow-hidden w-full group relative">
            <div className="flex w-max animate-marquee hover-pause gap-6 pb-6 px-4">
              {duplicatedFleetItems.map((item, index) => (
                <div 
                  key={`${item.id}-${index}`}
                  className="premium-card overflow-hidden w-[85vw] sm:w-[350px] md:w-[420px] lg:w-[450px] flex-shrink-0 border border-slate-200 flex flex-col"
                >
                <div className="h-56 md:h-64 overflow-hidden relative shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                    {item.category}
                  </div>
                </div>
                <div className="p-6 md:p-8 text-left flex flex-col flex-grow">
                  <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 mb-3">{item.name}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    {item.description}
                  </p>
                  <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-600">{item.rate}</span>
                    <Link
                      to={item.link}
                      className="text-brand-500 hover:text-brand-600 font-extrabold text-sm flex items-center space-x-1"
                    >
                      <span>View Car Details</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            </div>
          </div>
        </section>
      </FadeIn>

      {/* 4. Professional Drivers / Safety Highlight */}
      <FadeIn delay={100}>
        <section className="bg-slate-900 py-24 text-left">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-500">Uncompromised Quality</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Expert Ghat-Road Certified Drivers
              </h2>
              <p className="text-slate-400 text-base leading-relaxed">
                Tamil Nadu's tourist paths like Ooty, Kodaikanal, and Valparai feature challenging hairpin turns. Our driver teams are certified and heavily vetted with over 10+ years of driving experience across these routes.
              </p>
              <ul className="space-y-3 text-slate-300 font-medium">
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-brand-500" />
                  <span>Excellent understanding of alternate routes</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-brand-500" />
                  <span>Fluent in English, Tamil, and Malayalam</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-brand-500" />
                  <span>Properly structured sleep shifts for night travels</span>
                </li>
              </ul>
              <div className="pt-4">
                <a
                  href="https://wa.me/919150549150?text=Hi%20Ayyappa%20Travels,%20I%20need%20to%20know%20more%20about%20your%20vehicle%20availabilities."
                  className="inline-flex items-center space-x-2 bg-brand-500 hover:bg-brand-600 text-white font-extrabold px-6 py-3 rounded-xl transition-all"
                >
                  <span>Inquire on WhatsApp</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
            <div className="relative h-96 rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop"
                alt="Safe Driving with Ayyappa Travels"
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=800&auto=format&fit=crop";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
              <div className="absolute bottom-4 left-4 bg-slate-900/70 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider">
                Certified Ghat-Road Drivers
              </div>
            </div>
          </div>
        </section>
      </FadeIn>
      {/* 5. Pricing Formula Explanation */}
      <FadeIn delay={100}>
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-500">100% Transparent</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">How We Calculate Your Quote</h2>
            <p className="text-slate-500 text-base">No shocking hidden extras. Our formula is perfectly clear.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-premium">
              <div className="w-12 h-12 bg-orange-50 text-brand-600 rounded-xl flex items-center justify-center font-bold text-lg mb-4 mx-auto">
                1
              </div>
              <h4 className="font-extrabold text-slate-900 mb-2">Distance (KM) × Rate</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Base distance is multiplied by the vehicle rate (e.g. ₹12/km for Car or ₹14/km for Chevrolet Tavera SUV).
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-premium">
              <div className="w-12 h-12 bg-orange-50 text-brand-600 rounded-xl flex items-center justify-center font-bold text-lg mb-4 mx-auto">
                2
              </div>
              <h4 className="font-extrabold text-slate-900 mb-2">Toll & State Permits</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Calculated dynamically. Standard toll routes add ₹300 for short routes or ₹600 for longer routes.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-premium">
              <div className="w-12 h-12 bg-orange-50 text-brand-600 rounded-xl flex items-center justify-center font-bold text-lg mb-4 mx-auto">
                3
              </div>
              <h4 className="font-extrabold text-slate-900 mb-2">Driver Night Allowance</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Driver charges are ₹300 per day. For multi-day trips or late night travels, this helps take care of the driver's lodging.
              </p>
            </div>
          </div>

          <div className="bg-brand-50 p-6 rounded-2xl border border-brand-100 text-slate-700 text-sm max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="font-semibold text-slate-700">Example: Srivilliputtur-Madurai (80km), Chevrolet Tavera SUV</span>
            <span className="font-bold text-brand-600 text-lg bg-white px-4 py-1.5 rounded-xl border border-brand-100 shrink-0">
              ₹1,120 + tolls
            </span>
          </div>
        </section>
      </FadeIn>

      {/* 6. High-Conversion CTA Banner */}
      <FadeIn delay={200}>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="bg-gradient-to-r from-brand-600 to-amber-600 rounded-3xl p-10 sm:p-16 text-center text-white relative overflow-hidden shadow-xl shadow-brand-500/10">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl sm:text-5xl font-extrabold leading-tight">
                Ready to Book Your Ride?
              </h2>
              <p className="text-brand-100 text-base max-w-lg mx-auto">
                Submit your dates and destination. We will instantly calculate your exact pricing breakdown and contact you to lock in the reservation.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-4 pt-4">
                <Link
                  to="/booking"
                  className="bg-white hover:bg-slate-50 text-brand-600 font-extrabold px-8 py-4 rounded-2xl shadow-lg transition-transform duration-300 hover:-translate-y-0.5 text-center"
                >
                  Get Quote Instantly
                </Link>
                <a
                  href="tel:+919150549150"
                  className="bg-slate-900/40 border border-white/20 hover:bg-slate-900/60 font-extrabold px-8 py-4 rounded-2xl transition-all text-center"
                >
                  📞 Call Ayyappa Travels
                </a>
              </div>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* Floating WhatsApp Button (Bottom Right) */}
      <a
        href="https://wa.me/9150549150"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:bg-[#128C7E] hover:scale-110 transition-all duration-300 group"
        aria-label="Chat on WhatsApp"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-8 h-8"
        >
          <path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.128.555 4.195 1.611 6.02L.055 24l6.096-1.597A11.967 11.967 0 0012.031 24c6.645 0 12.03-5.385 12.03-12.031S18.676 0 12.031 0zm6.574 17.262c-.276.776-1.597 1.488-2.222 1.543-.591.05-1.28.167-3.957-.936-3.218-1.326-5.289-4.664-5.45-4.88-.16-.217-1.303-1.737-1.303-3.313 0-1.576.815-2.35 1.107-2.656.29-.304.633-.382.845-.382.213 0 .426 0 .604.009.189.009.444-.073.693.527.26.634.894 2.181.972 2.342.079.162.132.35.026.561-.106.211-.158.343-.316.527-.158.185-.333.4-.476.545-.158.162-.326.342-.144.659.182.316.811 1.344 1.745 2.174 1.205 1.072 2.212 1.403 2.528 1.554.316.151.5.125.686-.08.185-.205.792-.924 1.003-1.242.212-.317.423-.263.712-.152.29.112 1.83.864 2.146 1.021.316.158.528.238.606.37.079.132.079.767-.197 1.543z"/>
        </svg>
        {/* Tooltip */}
        <span className="absolute right-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-slate-900 text-white text-xs font-bold py-1 px-3 rounded-lg whitespace-nowrap pointer-events-none shadow-xl">
          Chat on WhatsApp
        </span>
      </a>
    </div>
  );
}
