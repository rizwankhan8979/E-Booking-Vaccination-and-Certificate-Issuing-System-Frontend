'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';

// Scan page uses PC's real network IP so mobile phones can reach the backend
const scanApi = axios.create({
  baseURL: 'http://10.151.31.105:8080',
  headers: { 'Content-Type': 'application/json' },
});

export default function VialScanPage() {
  const params = useParams();
  const vialNumber = params.vialNumber ? decodeURIComponent(params.vialNumber) : null;

  const [vialData, setVialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!vialNumber) return;
    const fetchVial = async () => {
      setLoading(true);
      try {
        const response = await scanApi.get(`/vial/scan/${vialNumber}`);
        setVialData(response.data);
      } catch (err) {
        setError(err.response?.data || 'Vial not found!');
      } finally {
        setLoading(false);
      }
    };
    fetchVial();
  }, [vialNumber]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin text-[#00a29a]" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
          <p className="text-slate-500 font-medium text-lg">Loading Vial Data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-500 mb-2">Vial Not Found</h2>
          <p className="text-slate-500 mb-1">Vial Number: <span className="font-mono font-bold text-slate-700">{vialNumber}</span></p>
          <p className="text-slate-400 text-sm mt-3">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-[200] flex flex-col overflow-y-auto">
      {vialData && (
        <div className="w-full h-full max-w-5xl self-center p-4 md:p-8 lg:p-12 flex flex-col items-center justify-center">
          <h2 className="text-2xl lg:text-4xl font-bold text-[#00a29a] text-center mb-8 lg:mb-12">
            Scanned Vial Record : {vialData.vialNumber}
          </h2>

          <div className="flex flex-col gap-3 lg:gap-4 w-full">
            {/* ROW 1: VACCINE */}
            <div className="flex w-full gap-1 lg:gap-2">
              <div className="w-1/3 bg-[#5ab6ba] text-white rounded-l-2xl flex items-center justify-center p-4 lg:p-6">
                <h3 className="text-lg lg:text-2xl font-bold tracking-widest uppercase text-center">Vaccine</h3>
              </div>
              <div className="w-2/3 bg-[#e4eff0] rounded-r-2xl p-4 lg:p-6 flex flex-col justify-center items-center text-center">
                <div className="w-full flex flex-col items-center justify-center text-center space-y-2 lg:space-y-3 text-slate-800 font-bold text-base lg:text-xl">
                  <p className="text-center w-full">Name: {vialData.vaccine?.vaccineName}</p>
                  <p className="text-center w-full">Manufacturer: {vialData.vaccine?.manufacturer}</p>
                  <p className="text-center w-full">Target Age: {vialData.vaccine?.ageRange || '18+'}</p>
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
                  <p className="text-center w-full">Remaining Doses: {vialData.remainingDoses}</p>
                  <p className="text-center w-full">Doses Required: {vialData.vaccine?.dosesRequired}</p>
                  <p className="text-center w-full">Vial Capacity: {vialData.vaccine?.dosesPerVial} Max</p>
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
                  <p className="text-center w-full">Record: {vialData.vaccine?.batchNumber}</p>
                  <p className="text-center w-full">Total Capacity: {vialData.vaccine?.totalBatchCapacity} Units</p>
                  <p className="text-center w-full">Status: <span className={vialData.status === 'AVAILABLE' ? "text-green-600" : "text-red-500"}>{vialData.status}</span></p>
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
                  <p className="text-center w-full">Production Date: {vialData.vaccine?.entryDate ? new Date(vialData.vaccine.entryDate).toLocaleDateString() : 'N/A'}</p>
                  <p className="text-center w-full">Expiry Date: {vialData.vaccine?.expiryDate ? new Date(vialData.vaccine.expiryDate).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
