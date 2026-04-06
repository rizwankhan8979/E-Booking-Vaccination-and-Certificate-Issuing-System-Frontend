"use client";

import React, { useState, useEffect } from "react";
import { toast } from 'sonner';
import api from "../../lib/axios";
import { useStore } from "../../lib/store";
import Card from "../shared/Card";
import Modal from "../shared/Modal";
import StatCard from "../shared/StatCard";

export default function DosesPage() {
  const [showGiveDoseModal, setShowGiveDoseModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const { doctors, fetchDoctors } = useStore();

  // Success popup state
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const [doseData, setDoseData] = useState({
    userId: "",
    vaccineId: "",
    vaccineName: "",
    batchNumber: "",
    vialNumber: "",
    docId: "",
  });

  const [vaccines, setVaccines] = useState([]);

  // All users with doses from backend (persists on refresh)
  const [allUsersData, setAllUsersData] = useState([]);
  const [stats, setStats] = useState({ total: 0, vaccinated: 0, pending: 0 });

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // Helper to group doses by vaccine name and check overall status
  const getProcessedUserData = (users) => {
    return users.map(user => {
      // Group doses by Vaccine Name
      const groupedDoses = {};
      if (user.doses && Array.isArray(user.doses)) {
        user.doses.forEach(dose => {
          const vName = dose.vaccineName || "Unknown Vaccine";
          if (!groupedDoses[vName]) {
            groupedDoses[vName] = {
              name: vName,
              doses: [],
              dosesRequired: dose.dosesRequired || 1,
              count: 0
            };
          }
          groupedDoses[vName].doses.push(dose);
          groupedDoses[vName].count += 1;
        });
      }

      const vaccineGroups = Object.values(groupedDoses);
      
      // A user is "Fully Vaccinated" only if they have at least one vaccine group 
      // AND all their vaccine groups have reached the dosesRequired limit.
      const isActuallyFullyVaccinated = vaccineGroups.length > 0 && 
        vaccineGroups.every(g => g.count >= g.dosesRequired);

      return {
        ...user,
        vaccineGroups,
        isActuallyFullyVaccinated
      };
    });
  };

  // Fetch users with their doses from backend
  const fetchAllUsersWithDoses = async () => {
    setFetchLoading(true);
    try {
      const response = await api.get("/user/getAllWithDoses");
      const rawData = Array.isArray(response.data) ? response.data : [];
      
      const processedData = getProcessedUserData(rawData);
      setAllUsersData(processedData);
      
      const vaccinatedCount = processedData.filter(u => u.isActuallyFullyVaccinated).length;
      setStats({
        total: processedData.length,
        vaccinated: vaccinatedCount,
        pending: processedData.length - vaccinatedCount,
      });
    } catch (error) {
      console.error("Error fetching users with doses:", error);
      if (error.response?.status !== 403) {
        toast.error("Failed to load vaccination records.");
      }
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchVaccines = async () => {
    try {
      const response = await api.get("/vaccine/getAll");
      setVaccines(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to fetch vaccines", err);
    }
  };

  useEffect(() => {
    fetchAllUsersWithDoses();
    fetchVaccines();
    fetchDoctors();
  }, []);

  const handleGiveDose = async (e) => {
    e.preventDefault();
    if (!doseData.userId || !doseData.vaccineId || !doseData.vialNumber) {
      toast.error("Please fill in all mandatory fields");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        userId: Number(doseData.userId),
        vaccineId: Number(doseData.vaccineId),
        vaccineName: doseData.vaccineName,
        batchNumber: doseData.batchNumber,
        vialNumber: doseData.vialNumber.trim(),
        docId: doseData.docId ? Number(doseData.docId) : null
      };

      const response = await api.post("/dose/giveDose", payload);
      const resData = response.data;

      setShowGiveDoseModal(false);
      setDoseData({ userId: "", vaccineId: "", vaccineName: "", batchNumber: "", vialNumber: "", docId: "" });

      // Refresh backend data so table updates immediately
      await fetchAllUsersWithDoses();

      // Show premium success popup
      setSuccessData({
        userName: resData.userName || `User ${doseData.userId}`,
        userEmail: resData.userEmail || "",
        doseNumber: resData.doseNumber,
        vaccineName: doseData.vaccineName,
        batchNumber: resData.batchNumber || doseData.batchNumber,
        vialNumber: resData.vialNumber || doseData.vialNumber,
        doctorName: resData.doctorName || doctors.find(d => String(d.docId) === String(doseData.docId))?.name || "General Staff",
        date: resData.vaccinationDate
          ? new Date(resData.vaccinationDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
          : new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }),
      });
      setShowSuccessPopup(true);

    } catch (error) {
      console.error("Error giving dose:", error);
      const errMsg = error.response?.data?.message
        || (typeof error.response?.data === 'string' ? error.response?.data : null)
        || "Failed to administer dose. Please check User ID and Vial Number.";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Filter users by search
  const filteredUsers = allUsersData.filter(user => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      String(user.userId).includes(q) ||
      (user.name && user.name.toLowerCase().includes(q)) ||
      (user.email && user.email.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      {/* ✅ Premium Success Popup */}
      {showSuccessPopup && successData && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{
            background: 'var(--surface)',
            borderRadius: '24px',
            padding: '40px 36px',
            maxWidth: '460px',
            width: '90%',
            border: '1px solid rgba(16,185,129,0.4)',
            boxShadow: '0 0 60px rgba(16,185,129,0.2), 0 20px 60px rgba(0,0,0,0.5)',
            textAlign: 'center',
            animation: 'slideUp 0.3s ease',
          }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 0 30px rgba(16,185,129,0.5)'
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#10b981', marginBottom: '6px' }}>
              💉 Dose Successfully Administered!
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '28px' }}>
              Vaccination record has been saved in the system.
            </p>
            <div style={{
              background: 'var(--background)', borderRadius: '16px',
              padding: '20px', textAlign: 'left', marginBottom: '24px',
              border: '1px solid var(--border)'
            }}>
              {[
                { label: '👤 Patient', value: successData.userName },
                { label: '📧 Email', value: successData.userEmail || '—' },
                { label: '💉 Dose No.', value: `Dose #${successData.doseNumber}` },
                { label: '🧪 Vaccine', value: successData.vaccineName },
                { label: '👨‍⚕️ Doctor', value: `Dr. ${successData.doctorName}` },
                { label: '📦 Batch', value: successData.batchNumber },
                { label: '🔬 Vial No.', value: successData.vialNumber },
                { label: '📅 Date', value: successData.date },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: i < 6 ? '1px solid var(--border)' : 'none'
                }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{item.label}</span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', textAlign: 'right', maxWidth: '55%' }}>{item.value}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowSuccessPopup(false)}
              style={{
                width: '100%', padding: '14px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white', border: 'none', borderRadius: '12px',
                fontSize: '15px', fontWeight: '700', cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(16,185,129,0.4)',
                transition: 'transform 0.1s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              ✓ Done
            </button>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Doses Management</h1>
          <p className="page-subtitle">Administer vaccination doses and view all patient vaccination records</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowGiveDoseModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m18 2 4 4" /><path d="m17 7 3-3" />
            <path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5" />
            <path d="m9 11 4 4" /><path d="m5 19-3 3" /><path d="m14 4 6 6" />
          </svg>
          Mark Dose as Given
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard icon="vaccines" value={stats.total} label="Total Patients" variant="primary" />
        <StatCard icon="vaccines" value={stats.vaccinated} label="Fully Vaccinated ✅" variant="success" />
        <StatCard icon="appointments" value={stats.pending} label="Pending Vaccination" variant="warning" />
      </div>

      {/* All Vaccination Records */}
      <Card
        title="All Patient Vaccination Records"
        actions={
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by name, ID or email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '220px', padding: '6px 12px', fontSize: '13px' }}
            />
            <button className="btn btn-outline btn-sm" onClick={fetchAllUsersWithDoses} disabled={fetchLoading}>
              {fetchLoading ? "Loading..." : "🔄 Refresh"}
            </button>
          </div>
        }
      >
        {fetchLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading vaccination records...</div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            <p>No patient records found.</p>
            <p style={{ fontSize: '13px', marginTop: '8px' }}>Try refreshing or check if the backend is running.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {filteredUsers.map((user) => (
              <div key={user.userId} style={{
                background: 'var(--background)',
                borderRadius: '16px',
                border: `1px solid ${user.isActuallyFullyVaccinated ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`,
                overflow: 'hidden'
              }}>
                {/* User Header */}
                <div style={{
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid var(--border)',
                  background: user.isActuallyFullyVaccinated ? 'rgba(16,185,129,0.05)' : 'transparent'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '42px', height: '42px', borderRadius: '50%',
                      background: user.isActuallyFullyVaccinated ? 'rgba(16,185,129,0.15)' : 'rgba(14,165,233,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '18px', fontWeight: '700',
                      color: user.isActuallyFullyVaccinated ? '#10b981' : 'var(--primary)'
                    }}>
                      {user.name ? user.name.charAt(0).toUpperCase() : '#'}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '15px' }}>{user.name || '—'}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        ID: {user.userId} &nbsp;|&nbsp; {user.email || '—'} &nbsp;|&nbsp; Age: {user.age} &nbsp;|&nbsp; {user.gender}
                      </div>
                    </div>
                  </div>
                  <div>
                    {user.isActuallyFullyVaccinated ? (
                      <span style={{
                        background: 'rgba(16,185,129,0.15)', color: '#10b981',
                        padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700'
                      }}>✅ Fully Vaccinated</span>
                    ) : (
                      <span style={{
                        background: 'rgba(245,158,11,0.15)', color: '#f59e0b',
                        padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700'
                      }}>⏳ In Progress</span>
                    )}
                  </div>
                </div>

                {/* Doses Grouped by Vaccine */}
                {user.vaccineGroups && user.vaccineGroups.length > 0 ? (
                  <div style={{ padding: '16px 20px' }}>
                    {user.vaccineGroups.map((group, gIdx) => {
                      const isGroupComplete = group.count >= group.dosesRequired;
                      return (
                        <div key={gIdx} style={{ marginBottom: gIdx < user.vaccineGroups.length - 1 ? '24px' : '0' }}>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            marginBottom: '10px'
                          }}>
                            <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                              🧪 {group.name} 
                              <span style={{ 
                                marginLeft: '10px', 
                                color: isGroupComplete ? '#10b981' : 'var(--primary)',
                                fontWeight: '700'
                              }}>
                                ({group.count}/{group.dosesRequired})
                              </span>
                            </div>
                            {isGroupComplete ? (
                              <span style={{ fontSize: '11px', fontWeight: '700', color: '#10b981' }}>✓ ALL DOSES TAKEN</span>
                            ) : (
                              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--primary)' }}>INCOMPLETE</span>
                            )}
                          </div>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px' }}>
                            {group.doses.map((dose, idx) => (
                              <div key={idx} style={{
                                background: 'var(--surface)',
                                borderRadius: '12px',
                                padding: '12px 16px',
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '8px',
                                border: '1px solid var(--border)'
                              }}>
                                <div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '2px' }}>DOSE NO.</div>
                                  <div style={{ fontWeight: '700', color: 'var(--primary)' }}>#{dose.doseNumber}</div>
                                </div>
                                <div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '2px' }}>BATCH</div>
                                  <div style={{ fontWeight: '600', fontSize: '13px' }}>{dose.batchNumber}</div>
                                </div>
                                <div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '2px' }}>VIAL</div>
                                  <div style={{ fontWeight: '600', fontSize: '13px' }}>{dose.vialSerialNumber}</div>
                                </div>
                                <div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '2px' }}>DATE</div>
                                  <div style={{ fontWeight: '600', fontSize: '13px' }}>
                                    {dose.vaccinationDate ? new Date(dose.vaccinationDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                                  </div>
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '2px' }}>ADMINISTERED BY</div>
                                  <div style={{ fontWeight: '700', fontSize: '13px', color: '#0ea5e9' }}>
                                     Dr. {dose.doctorName || "General Staff"}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ padding: '20px', fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                    No doses administered yet.
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Give Dose Modal */}
      <Modal
        isOpen={showGiveDoseModal}
        onClose={() => setShowGiveDoseModal(false)}
        title="Mark Dose as Given"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setShowGiveDoseModal(false)}>Cancel</button>
            <button className="btn btn-success" onClick={handleGiveDose} disabled={loading}>
              {loading ? "Processing..." : "Confirm Dose Given"}
            </button>
          </>
        }
      >
        <form onSubmit={handleGiveDose}>
          <div className="form-group">
            <label className="form-label">User ID (Patient) *</label>
            <input
              type="number"
              className="form-input"
              placeholder="Enter User ID (integer)"
              value={doseData.userId}
              onChange={(e) => setDoseData({ ...doseData, userId: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Select Administering Doctor *</label>
            <select
              className="form-select"
              value={doseData.docId}
              onChange={(e) => setDoseData({ ...doseData, docId: e.target.value })}
              required
            >
              <option value="">Choose Doctor</option>
              {doctors.map(doc => (
                <option key={doc.docId} value={doc.docId}>
                   Dr. {doc.name} ({doc.specialization})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Select Vaccine Batch *</label>
            <select
              className="form-select"
              value={doseData.vaccineId}
              onChange={(e) => {
                const vaccine = vaccines.find(v => String(v.id) === e.target.value);
                if (vaccine) {
                  setDoseData({ ...doseData, vaccineId: vaccine.id, vaccineName: vaccine.vaccineName, batchNumber: vaccine.batchNumber });
                } else {
                  setDoseData({ ...doseData, vaccineId: "", vaccineName: "", batchNumber: "" });
                }
              }}
              required
            >
              <option value="">Choose Vaccine Batch</option>
              {Array.isArray(vaccines) && vaccines.map(v => (
                <option key={v.id} value={v.id}>
                  {v.vaccineName} - {v.batchNumber} ({v.manufacturer})
                </option>
              ))}
            </select>
          </div>

          {doseData.vaccineId && (
            <div className="form-row" style={{ marginTop: '-8px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '12px' }}>Vaccine Name</label>
                <input type="text" className="form-input" value={doseData.vaccineName} disabled style={{ background: 'var(--background)', opacity: 0.8 }} />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '12px' }}>Vaccine ID</label>
                <input type="text" className="form-input" value={doseData.vaccineId} disabled style={{ background: 'var(--background)', opacity: 0.8 }} />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Vial / Tracking Number *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter Vial Serial Number"
              value={doseData.vialNumber}
              onChange={(e) => setDoseData({ ...doseData, vialNumber: e.target.value })}
              required
            />
            <small className="text-muted">Required for vial deduction and tracking</small>
          </div>
          <div className="alert alert-warning">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" x2="12" y1="9" y2="13" /><line x1="12" x2="12.01" y1="17" y2="17" />
            </svg>
            <div>Please verify the patient&apos;s identity before administering the dose.</div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
