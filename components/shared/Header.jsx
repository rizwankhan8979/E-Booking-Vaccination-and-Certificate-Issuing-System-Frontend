'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import api from '../../lib/axios';
import Modal from './Modal';

export default function Header({ title, onMenuClick }) {
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
    <>
      <header className="header">
        <div className="header-title">
          <button className="mobile-menu-btn" onClick={onMenuClick}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" x2="21" y1="6" y2="6" />
              <line x1="3" x2="21" y1="12" y2="12" />
              <line x1="3" x2="21" y1="18" y2="18" />
            </svg>
          </button>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
          <span>{title}</span>
        </div>
        <div className="header-actions">
          
          {/* GET VIAL DATA SEARCH BAR (Minimal Pill Style) */}
          <form onSubmit={handleSearchVial} className="flex items-center h-[32px] rounded-md overflow-hidden border border-slate-300 bg-white shadow-sm hover:shadow-md focus-within:border-[#dda135] focus-within:ring-1 focus-within:ring-[#dda135]/30 transition-all relative group hidden md:flex ml-4 mr-4">
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
              className="absolute right-0 h-full pl-2 pr-4 text-slate-400 group-focus-within:text-[#dda135] hover:text-[#dda135] transition-colors cursor-pointer flex items-center justify-center shrink-0"
              disabled={isSearching}
              title="Search Vial"
            >
              {isSearching ? (
                <svg className="animate-spin text-slate-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              )}
            </button>
          </form>

          <button className="btn btn-outline btn-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            Notifications
          </button>
        </div>
      </header>

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
                    Scanned Vial Record : {scannedVial.vialNumber}
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
                              <p className="text-center w-full">Target Age: {scannedVial.vaccine?.ageRange || '18+'}</p>
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
                              <p className="text-center w-full">Remaining Doses: {scannedVial.remainingDoses}</p>
                              <p className="text-center w-full">Doses Required: {scannedVial.vaccine?.dosesRequired}</p>
                              <p className="text-center w-full">Vial Capacity: {scannedVial.vaccine?.dosesPerVial} Max</p>
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
                              <p className="text-center w-full">Record: {scannedVial.vaccine?.batchNumber}</p>
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
    </>
  );
}
