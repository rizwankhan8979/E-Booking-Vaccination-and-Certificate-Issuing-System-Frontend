'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AuthModal from '../auth/AuthModal';
import { toast } from 'sonner';
import api from '../../lib/axios';
import Modal from '../shared/Modal';

const features = [
  {
    id: 'centers',
    title: 'Vaccination Centers',
    date: 'Available Now',
    location: 'Multiple Locations',
    description: 'Find and book appointments at your nearest center.',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop',
    href: '/dashboard/centers',
  },
  {
    id: 'doctors',
    title: 'Expert Doctors',
    date: 'Consultations',
    location: 'Authorized Clinics',
    description: 'Consult with highly qualified registered medical professionals.',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=800&auto=format&fit=crop',
    href: '/dashboard/doctors',
  },
  {
    id: 'vaccines',
    title: 'Approved Vaccines',
    date: 'In Stock',
    location: 'Verified Manufacturers',
    description: 'Get details on available vaccines and schedule.',
    image: 'https://images.unsplash.com/photo-1618961734760-466979ce35b0?q=80&w=800&auto=format&fit=crop',
    href: '/dashboard/vaccines',
  },
  {
    id: 'doses',
    title: 'Doses Management',
    date: 'Track Online',
    location: 'Digital Records',
    description: 'Seamlessly track dose administration status.',
    image: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=800&auto=format&fit=crop',
    href: '/dashboard/doses',
  }
];
export default function HomePage() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const auth = params.get('auth');
      if (auth === 'register') {
        setAuthTab('register');
        setIsAuthOpen(true);
        window.history.replaceState({}, '', '/');
      } else if (auth === 'login') {
        setAuthTab('login');
        setIsAuthOpen(true);
        window.history.replaceState({}, '', '/');
      }
    }
  }, []);

  const openRegister = () => {
    setAuthTab('register');
    setIsAuthOpen(true);
  };
  const openLogin = () => {
    setAuthTab('login');
    setIsAuthOpen(true);
  };
  const closeAuth = () => setIsAuthOpen(false);

  const [vialSearchQuery, setVialSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [scannedVial, setScannedVial] = useState(null);
  const [showVialModal, setShowVialModal] = useState(false);

  const handleSearchVial = async (e) => {
    e.preventDefault();
    if (!vialSearchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await api.get(`/vial/scan/${vialSearchQuery.trim()}`);
      setScannedVial(response.data);
      setShowVialModal(true);
      setVialSearchQuery(''); // Clear the search bar
    } catch (error) {
      console.error("Error scanning vial:", error);
      toast.error(error.response?.data || "Error: Vial not found!");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a202c] font-sans text-slate-100 pb-20">
      {/* Navigation */}
      {!isAuthOpen && (
        <nav className="w-full bg-[#1a202c]/60 backdrop-blur-md border-b border-white/5 sticky top-0 z-[100] h-[80px] flex items-center">
        <div className="max-w-7xl mx-auto px-8 md:px-12 flex items-center justify-between w-full relative">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[#0ea5e9] font-bold text-xl tracking-tight">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <span>e-Booking</span>
            </div>
          </div>

          {/* Navigation Links (DEAD-CENTERED with Hover "Popup" Underline) */}
          <div className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2 gap-8 font-extrabold text-slate-300 z-50 text-[15px]">
            <Link href="/" className="cursor-pointer hover:text-white hover:border-b-2 hover:border-[#0ea5e9] pb-1 transition-all">Home</Link>
            <Link href="/dashboard" className="cursor-pointer hover:text-white hover:border-b-2 hover:border-[#0ea5e9] pb-1 transition-all">Dashboard</Link>
            <Link href="/dashboard/appointments" className="cursor-pointer hover:text-white hover:border-b-2 hover:border-[#0ea5e9] pb-1 transition-all">Appointments</Link>
            <Link href="/dashboard/users" className="cursor-pointer hover:text-white hover:border-b-2 hover:border-[#0ea5e9] pb-1 transition-all">My Profile</Link>
            <button onClick={openRegister} className="cursor-pointer hover:text-white hover:border-b-2 hover:border-[#0ea5e9] pb-1 transition-all">Register</button>
            <button onClick={openLogin} className="cursor-pointer hover:text-white hover:border-b-2 hover:border-[#0ea5e9] pb-1 transition-all">Log in</button>
          </div>

          {/* Right Info / Search Bar (Minimal Pill Style) */}
          <div className="hidden lg:block z-[200]">
            <form onSubmit={handleSearchVial} className="flex items-center h-[32px] rounded-md overflow-hidden border border-slate-300 bg-white shadow-sm hover:shadow-md focus-within:border-[#0ea5e9] focus-within:ring-1 focus-within:ring-[#0ea5e9]/30 transition-all relative group">
              <input
                type="text"
                placeholder="Track Vial Status..."
                autoComplete="off"
                className="bg-transparent text-center text-slate-700 text-[13px] h-full focus:outline-none w-[130px] lg:w-[150px] xl:w-[180px] px-9 font-medium placeholder:text-slate-400 placeholder:font-normal"
                value={vialSearchQuery}
                onChange={(e) => setVialSearchQuery(e.target.value)}
                disabled={isSearching}
              />

              <button
                type="submit"
                className="absolute right-0 h-full pl-2 pr-4 text-slate-400 group-focus-within:text-[#0ea5e9] hover:text-[#0ea5e9] transition-colors cursor-pointer flex items-center justify-center shrink-0"
                disabled={isSearching}
                title="Search Vial"
              >
                {isSearching ? (
                  <svg className="animate-spin text-slate-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><path d="M12 2a10 10 0 0 1 10 10" /></svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                )}
              </button>
            </form>
          </div>
        </div>
      </nav>
      )}

      {/* Hero Section (Full Width Rectangle) */}
      <div className="w-full">
        <div className="relative w-full h-[450px] md:h-[500px] overflow-hidden shadow-md">
          <img
            src="https://images.unsplash.com/photo-1583911860205-72f8ac8ddcbe?q=80&w=1600&auto=format&fit=crop"
            alt="Vaccination Hub"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-sky-900/30"></div>

          <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-8 md:px-16 mx-auto w-full max-w-7xl">
            <h1 className="text-4xl md:text-5xl lg:text-5xl font-extrabold text-white leading-tight mb-6 tracking-tight drop-shadow-lg">
              e-Booking Vaccination and Certificate Issuing System
            </h1>

            <p className="text-blue-50 text-lg md:text-xl max-w-2xl leading-relaxed drop-shadow-md font-medium opacity-90 mx-auto">
              A comprehensive platform to manage users, doctors, vaccination centers, vaccines, doses, and appointments securely all in one place. Navigate healthcare with an integrated approach.
            </p>
          </div>
        </div>
      </div>

      {/* Services Section */}
      {/* Unified Bottom Section (Services & Footer) */}
      <div className="w-full bg-[#1a202c] border-t border-white/5 pt-16 md:pt-24 pb-12 flex flex-col items-center">
        <div className="w-[94%] max-w-7xl">
          {/* Services Section Header */}
          <div className="w-full flex flex-col items-center justify-center text-center mb-16 px-4">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-6 uppercase tracking-tighter w-full text-center">
              Available Services
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed font-medium opacity-90 max-w-4xl w-full text-center mx-auto">
              Manage your healthcare journey efficiently. Register for vaccination, track doses, browse centers, and get certified seamlessly through our portal.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 mb-44 pb-32 border-b border-white/5">
            {features.map((service, index) => (
              <Link key={index} href={service.href}>
                <div className="group relative overflow-hidden rounded-2xl bg-[#1e293b] border border-white/5 shadow-2xl hover:shadow-[#0ea5e9]/10 transition-all duration-500 cursor-pointer h-64">
                  <div className="absolute inset-0 z-0">
                    <img src={service.image} alt={service.title} className="h-full w-full object-cover opacity-30 group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1e293b] via-[#1e293b]/90 to-transparent" />
                  </div>

                  <div className="relative z-10 h-full p-8 flex items-center justify-between">
                    <div className="flex flex-col items-center flex-1 text-center pr-4">
                      <h3 className="text-xl font-black text-white mb-2 group-hover:text-[#0ea5e9] transition-colors">{service.title}</h3>
                      <div className="space-y-1 mb-4">
                        <p className="text-[10px] font-black text-[#0ea5e9] tracking-widest uppercase">{service.status}</p>
                        <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1 font-bold">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          {service.location}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-[#0ea5e9] flex items-center gap-1 group-hover:gap-2 transition-all">
                        Explore Details <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                      </span>
                    </div>

                    <div className="hidden lg:block w-32 h-32 rounded-xl overflow-hidden border border-white/10 shadow-xl group-hover:border-[#0ea5e9]/50 transition-colors duration-500">
                      <img src={service.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="space-y-80 pt-20">
            {/* About Application Section */}
            <div className="flex flex-col items-center w-full text-center pt-24">
              <h4 className="text-white font-bold text-xl md:text-2xl mb-10 tracking-tight uppercase tracking-tighter">Empowering Healthcare with Digital Innovation</h4>
              <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-4xl w-full hover:text-slate-300 transition-colors duration-300">
                Our e-Booking Vaccination & Certification System is designed to bridge the gap between healthcare providers and patients through a secure, transparent, and highly efficient digital ecosystem. From real-time dose tracking to seamless certification, we utilize state-of-the-art encryption to ensure your health data remains protected and reliable. Trusted by thousands, we are committed to building a healthier, digitally-empowered India.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-20 pb-24 border-b border-white/5 w-full">
                {['Secure Encryption', 'Real-time Tracking', 'Verified Centers', 'WHO Compliance'].map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-[#0ea5e9] font-bold uppercase tracking-wider hover:bg-[#0ea5e9]/10 transition-all cursor-default">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-20 items-start">
              <div className="flex flex-col items-start">
                <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-tighter">Our Services</h4>
                <ul className="space-y-4 text-slate-400 font-medium text-sm">
                  <li><Link href="/" className="hover:text-[#0ea5e9] transition-colors">Home Page</Link></li>
                  <li><Link href="/dashboard" className="hover:text-[#0ea5e9] transition-colors">User Dashboard</Link></li>
                  <li><Link href="/dashboard/appointments" className="hover:text-[#0ea5e9] transition-colors">Book Appointments</Link></li>
                  <li><Link href="/dashboard/centers" className="hover:text-[#0ea5e9] transition-colors">Vaccination Centers</Link></li>
                </ul>
              </div>

              <div className="flex flex-col items-start">
                <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-tighter">Our Policies</h4>
                <ul className="space-y-4 text-slate-400 font-medium text-sm">
                  <li><a href="#" className="hover:text-[#0ea5e9] transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-[#0ea5e9] transition-colors">Terms and Conditions</a></li>
                  <li><a href="#" className="hover:text-[#0ea5e9] transition-colors">Editorial Policy</a></li>
                  <li><a href="#" className="hover:text-[#0ea5e9] transition-colors">Safety Protocols</a></li>
                </ul>
              </div>

              <div className="flex flex-col items-start">
                <div className="space-y-10 w-fit">
                  <div className="flex flex-row items-start gap-4 text-left group">
                    <div className="p-2.5 bg-[#0ea5e9]/10 rounded-xl text-[#0ea5e9] group-hover:bg-[#0ea5e9] group-hover:text-white transition-all duration-300 shadow-lg shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm mb-1 uppercase tracking-tight">Reliable</h4>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[200px] group-hover:text-slate-400">All vaccines are sourced from WHO approved manufacturers.</p>
                    </div>
                  </div>
                  <div className="flex flex-row items-start gap-4 text-left group">
                    <div className="p-2.5 bg-[#0ea5e9]/10 rounded-xl text-[#0ea5e9] group-hover:bg-[#0ea5e9] group-hover:text-white transition-all duration-300 shadow-lg shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm mb-1 uppercase tracking-tight">Secure</h4>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[200px] group-hover:text-slate-400">Your medical records are encrypted using AES 256-bit security.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start">
                <h4 className="text-white font-bold text-lg mb-8 uppercase tracking-tighter">Connect with us</h4>
                <div className="flex flex-col items-start gap-3">
                  <div className="flex flex-row items-center gap-4 group cursor-pointer">
                    <a href="mailto:rizwankhan.officialit@gmail.com" className="w-9 h-9 shrink-0 rounded-full bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 flex items-center justify-center text-[#0ea5e9] group-hover:bg-[#0ea5e9] group-hover:text-white transition-all duration-300 shadow-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </a>
                    <a href="mailto:rizwankhan.officialit@gmail.com" className="text-slate-200 font-bold text-sm hover:text-[#0ea5e9] transition-colors">
                      rizwankhan.officialit@gmail.com
                    </a>
                  </div>
                  <div className="flex flex-row items-center gap-4 group cursor-pointer">
                    <div className="w-9 h-9 shrink-0 rounded-full bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 flex items-center justify-center text-[#0ea5e9] group-hover:bg-[#0ea5e9] group-hover:text-white transition-all duration-300 shadow-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    </div>
                    <div className="text-slate-200 font-bold text-sm hover:text-[#0ea5e9] transition-colors">
                      6397939165
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-12 border-t border-white/5 text-center w-full pb-8">
              <p className="text-xs text-slate-500/60 font-normal leading-relaxed w-full uppercase tracking-tighter">
                © 2024 e-Booking Vaccination and Certificate Issuing System. All rights reserved.
                Vaccination data is processed in compliance with the health and safety act and healthcare guidelines.
                We do not share personal health data for non-medical purposes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={closeAuth} initialTab={authTab} />

      {/* SCANNED VIAL RESULT FULL-SCREEN MODAL */}
      {showVialModal && (
        <div className="fixed inset-0 bg-white z-[200] flex flex-col overflow-y-auto animate-in fade-in duration-300">
          {/* Close button top right */}
          <button 
            onClick={() => setShowVialModal(false)} 
            className="absolute top-4 right-4 lg:top-8 lg:right-8 w-12 h-12 lg:w-14 lg:h-14 rounded-none bg-slate-100/80 hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-slate-500 transition-all focus:outline-none z-[250]"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>

          {scannedVial && (
             <div className="w-full h-full max-w-5xl self-center p-4 md:p-8 lg:p-12 flex flex-col items-center justify-center">
                 <h2 className="text-2xl lg:text-4xl font-bold text-[#00a29a] text-center mb-8 lg:mb-12">
                    Vial Authentication : {scannedVial.vialNumber}
                 </h2>
                 
                 <div className="flex flex-col gap-3 lg:gap-4 w-full">
                    {/* ROW 1: VACCINE */}
                    <div className="flex w-full gap-1 lg:gap-2">
                        <div className="w-1/3 bg-[#5ab6ba] text-white rounded-l-2xl flex items-center justify-center p-4 lg:p-6">
                           <h3 className="text-lg lg:text-2xl font-bold tracking-widest uppercase text-center">Vaccine</h3>
                        </div>
                        <div className="w-2/3 bg-[#e4eff0] rounded-r-2xl p-4 lg:p-6 flex flex-col justify-center items-center text-center">
                           <div className="w-full flex flex-col items-center justify-center text-center space-y-2 lg:space-y-3 text-slate-800 font-bold text-base lg:text-xl">
                              <p className="text-center w-full">Name: {scannedVial.vaccine?.vaccineName}</p>
                              <p className="text-center w-full">Manufacturer: {scannedVial.vaccine?.manufacturer}</p>
                              <p className="text-center w-full">Price: ₹{scannedVial.vaccine?.price || 0}</p>
                              <p className="text-center w-full">Eligible Age Group: {scannedVial.vaccine?.ageRange || '18+'}</p>
                           </div>
                        </div>
                    </div>

                    {/* ROW 2: DOSES */}
                    <div className="flex w-full gap-1 lg:gap-2">
                        <div className="w-1/3 bg-[#64c0af] text-white rounded-l-2xl flex items-center justify-center p-4 lg:p-6">
                           <h3 className="text-lg lg:text-2xl font-bold tracking-widest uppercase text-center">Doses</h3>
                        </div>
                        <div className="w-2/3 bg-[#e6f2f0] rounded-r-2xl p-4 lg:p-6 flex flex-col justify-center items-center text-center">
                           <div className="w-full flex flex-col items-center justify-center text-center space-y-2 lg:space-y-3 text-slate-800 font-bold text-base lg:text-xl">
                              <p className="text-center w-full">Available Doses: {scannedVial.remainingDoses}</p>
                              <p className="text-center w-full">Doses Required: {scannedVial.vaccine?.dosesRequired}</p>
                              <p className="text-center w-full">Total Vial Dosage: {scannedVial.vaccine?.dosesPerVial} Max</p>
                           </div>
                        </div>
                    </div>

                    {/* ROW 3: BATCH */}
                    <div className="flex w-full gap-1 lg:gap-2">
                        <div className="w-1/3 bg-[#74cba0] text-white rounded-l-2xl flex items-center justify-center p-4 lg:p-6">
                           <h3 className="text-lg lg:text-2xl font-bold tracking-widest uppercase text-center">Batch</h3>
                        </div>
                        <div className="w-2/3 bg-[#e8f5ed] rounded-r-2xl p-4 lg:p-6 flex flex-col justify-center items-center text-center">
                           <div className="w-full flex flex-col items-center justify-center text-center space-y-2 lg:space-y-3 text-slate-800 font-bold text-base lg:text-xl">
                              <p className="text-center w-full">Batch Number: {scannedVial.vaccine?.batchNumber}</p>
                              <p className="text-center w-full">Total Capacity: {scannedVial.vaccine?.totalBatchCapacity} Units</p>
                              <p className="text-center w-full">Status: <span className={scannedVial.status === 'AVAILABLE' ? "text-green-600" : "text-red-500"}>{scannedVial.status}</span></p>
                           </div>
                        </div>
                    </div>

                    {/* ROW 4: LIFESPAN */}
                    <div className="flex w-full gap-1 lg:gap-2">
                        <div className="w-1/3 bg-[#85d595] text-white rounded-l-2xl flex items-center justify-center p-4 lg:p-6">
                           <h3 className="text-lg lg:text-2xl font-bold tracking-widest uppercase text-center">Lifespan</h3>
                        </div>
                        <div className="w-2/3 bg-[#eaf8ed] rounded-r-2xl p-4 lg:p-6 flex flex-col justify-center items-center text-center">
                           <div className="w-full flex flex-col items-center justify-center text-center space-y-2 lg:space-y-3 text-slate-800 font-bold text-base lg:text-xl">
                              <p className="text-center w-full">Production Date: {scannedVial.vaccine?.entryDate ? new Date(scannedVial.vaccine.entryDate).toLocaleDateString() : 'N/A'}</p>
                              <p className="text-center w-full">Expiry Date: {scannedVial.vaccine?.expiryDate ? new Date(scannedVial.vaccine.expiryDate).toLocaleDateString() : 'N/A'}</p>
                           </div>
                        </div>
                    </div>
                 </div>
             </div>
          )}
        </div>
      )}
    </div>
  );
}
