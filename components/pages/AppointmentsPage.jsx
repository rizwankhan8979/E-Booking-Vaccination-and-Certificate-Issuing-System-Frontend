"use client";

import React, { useState, useEffect } from "react";
import { toast } from 'sonner';
import api from "../../lib/axios";
import { useStore } from "../../lib/store";
import Card from "../shared/Card";
import Table from "../shared/Table";
import Modal from "../shared/Modal";
import StatCard from "../shared/StatCard";

export default function AppointmentsPage() {
  const { doctors, fetchDoctors, vaccines, fetchVaccines, users, fetchUsers } = useStore();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Modals
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  // Data
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Booking Form
  const [bookingData, setBookingData] = useState({
    docId: "",
    vaccineId: "",
    userId: "",
    appointmentDate: "",
    appointmentTime: "",
  });

  // Since we don't have Get All Appointments API yet, we'll keep a local list for the session
  // Now we have Get My Bookings functionality!

  const [fetchingBookings, setFetchingBookings] = useState(false);

  const handleGetMyBookings = async () => {
    setFetchingBookings(true);
    try {
      const response = await api.get("/appointment/my-bookings");
      if (Array.isArray(response.data)) {
        setAppointments(response.data);
        toast.success("Bookings loaded successfully");
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error(error.response?.data?.message || "Failed to load bookings");
    } finally {
      setFetchingBookings(false);
    }
  };

  const [doctorVaccines, setDoctorVaccines] = useState([]);
  const [fetchingVaccines, setFetchingVaccines] = useState(false);

  useEffect(() => {
    fetchDoctors();
    fetchUsers();
    fetchVaccines();
    
    // Fetch current user profile
    const fetchProfile = async () => {
      try {
        const response = await api.get("/user/profile");
        setProfile(response.data);
        setUserRole(response.data.role); // Use role from API response
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, [fetchDoctors, fetchUsers, fetchVaccines]);

  // Fetch vaccines when doctor is selected
  useEffect(() => {
    const fetchDoctorVaccines = async () => {
      if (!bookingData.docId) {
        setDoctorVaccines([]);
        return;
      }
      setFetchingVaccines(true);
      try {
        const response = await api.get(`/vaccine/doctor/${bookingData.docId}`);
        setDoctorVaccines(response.data || []);
        // Reset vaccine selection if current one isn't in new list
        setBookingData(prev => ({ ...prev, vaccineId: "" }));
      } catch (err) {
        console.error("Error fetching doctor vaccines:", err);
      } finally {
        setFetchingVaccines(false);
      }
    };
    fetchDoctorVaccines();
  }, [bookingData.docId]);

  const handleBookAppointment = async () => {
    if (!bookingData.userId || !bookingData.docId || !bookingData.vaccineId || !bookingData.appointmentDate || !bookingData.appointmentTime) {
      toast.error("All fields are required");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        docId: Number(bookingData.docId),
        vaccineId: Number(bookingData.vaccineId),
        userId: Number(bookingData.userId),
        appointmentDate: bookingData.appointmentDate,
        appointmentTime: bookingData.appointmentTime.length === 5 ? `${bookingData.appointmentTime}:00` : bookingData.appointmentTime,
      };

      const response = await api.post("/appointment/book", payload);
      const msg = typeof response.data === 'string' ? response.data : "Appointment booked successfully";
      toast.success(msg);

      const doctor = doctors.find(d => String(d.docId) === String(payload.docId));
      const vaccine = (doctorVaccines.length > 0 ? doctorVaccines : vaccines).find(v => String(v.id) === String(payload.vaccineId));
      const user = users.find(u => String(u.userId) === String(payload.userId));

      const newAppt = {
        id: Date.now(),
        doctorName: doctor ? doctor.name : "Dr. " + payload.docId,
        vaccineName: vaccine ? vaccine.vaccineName : "Vaccine #" + payload.vaccineId,
        userName: user ? user.name : "User #" + payload.userId,
        centerName: doctor && doctor.vaccinationCenter ? doctor.vaccinationCenter.centreName : "N/A",
        centerAddress: doctor && doctor.vaccinationCenter ? doctor.vaccinationCenter.address : "N/A",
        date: payload.appointmentDate,
        time: payload.appointmentTime,
        status: "Confirmed"
      };

      setAppointments(prev => [newAppt, ...prev]);
      setShowBookingModal(false);
      setShowConfirmationModal(true);

      setBookingData({
        docId: "",
        vaccineId: "",
        userId: "",
        appointmentDate: "",
        appointmentTime: "",
      });

    } catch (error) {
      console.error("Error booking appointment:", error);
      toast.error(error.response?.data?.message || error.response?.data || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
  ];

  const columns = [
    { key: "userName", label: "Vaccinee" },
    { key: "doctorName", label: "Doctor" },
    { key: "centerName", label: "Center" },
    { key: "vaccineName", label: "Vaccine" },
    { key: "date", label: "Date" },
    { key: "time", label: "Time" },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <span className="badge" style={{ background: '#10b98115', color: '#10b981', border: '1px solid #10b98130' }}>
          {value}
        </span>
      ),
    },
  ];

  const renderBookingStep = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: '600' }}>Choose Doctor</label>
            <div style={{ position: 'relative' }}>
              <select
                className="form-select"
                value={bookingData.docId}
                onChange={(e) => setBookingData({ ...bookingData, docId: e.target.value })}
                style={{ paddingLeft: '40px' }}
                required
              >
                <option value="">Select Doctor</option>
                {doctors.map((doc) => (
                  <option key={doc.docId} value={doc.docId}>
                    {doc.name}
                  </option>
                ))}
              </select>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: '600' }}>Choose Vaccine</label>
            <div style={{ position: 'relative' }}>
              <select
                className="form-select"
                value={bookingData.vaccineId}
                onChange={(e) => setBookingData({ ...bookingData, vaccineId: e.target.value })}
                disabled={!bookingData.docId || fetchingVaccines}
                style={{ paddingLeft: '40px' }}
                required
              >
                <option value="">{fetchingVaccines ? "Loading..." : bookingData.docId ? (doctorVaccines.length > 0 ? "Select Vaccine" : "No Vaccines assigned to this Doctor") : "Select Doctor First"}</option>
                {doctorVaccines.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.vaccineName} (₹{v.price || 0})
                  </option>
                ))}
              </select>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              </div>
            </div>
          </div>
        </div>

        {userRole === 'ADMIN' ? (
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: '600' }}>Choose Vaccinee (User)</label>
            <div style={{ position: 'relative' }}>
              <select
                className="form-select"
                value={bookingData.userId}
                onChange={(e) => setBookingData({ ...bookingData, userId: e.target.value })}
                style={{ paddingLeft: '40px' }}
                required
              >
                <option value="">{users.length > 0 ? "Select User" : "No Users found in database"}</option>
                {users.map((user) => (
                  <option key={user.userId} value={user.userId}>
                    {user.name} ({user.mobileNo})
                  </option>
                ))}
              </select>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: '16px', background: 'var(--background)', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>Booking for</p>
              <p style={{ margin: 0, fontWeight: '600', color: 'var(--text-primary)' }}>{profile?.name || "Loading..."}</p>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '20px', background: 'var(--background)', borderRadius: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontWeight: '600' }}>Appointment Date</label>
            <input
              type="date"
              className="form-input"
              value={bookingData.appointmentDate}
              onChange={(e) => setBookingData({ ...bookingData, appointmentDate: e.target.value })}
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontWeight: '600' }}>Select Time</label>
            <select
              className="form-select"
              value={bookingData.appointmentTime}
              onChange={(e) => setBookingData({ ...bookingData, appointmentTime: e.target.value })}
              required
            >
              <option value="">Pick a Slot</option>
              {timeSlots.map(slot => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>
        </div>

        {bookingData.docId && bookingData.vaccineId && (
          <div style={{ padding: '16px', background: '#0ea5e908', borderRadius: '12px', border: '1px dashed #0ea5e930' }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
              Standard verification will be performed at the center before dose administration.
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Appointments</h1>
          <p className="page-subtitle">
            Manage vaccination appointment bookings
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="btn btn-primary"
            onClick={() => {
              if (!localStorage.getItem('token')) {
                window.location.href = '/?auth=login';
              } else {
                handleGetMyBookings();
              }
            }}
            disabled={fetchingBookings}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            {fetchingBookings ? "Loading..." : "My Bookings"}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              if (!localStorage.getItem('token')) {
                window.location.href = '/?auth=login';
              } else {
                setShowBookingModal(true);
                setBookingData({
                  docId: "",
                  vaccineId: "",
                  userId: userRole === 'ADMIN' ? "" : (profile?.userId || ""),
                  appointmentDate: "",
                  appointmentTime: "",
                });
              }
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="12" x2="12" y1="5" y2="19" />
              <line x1="5" x2="19" y1="12" y2="12" />
            </svg>
            Book Appointment
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          icon="appointments"
          value={appointments.length}
          label="Total Bookings"
          variant="primary"
        />
        {/* Placeholders since we can't query stats yet */}
        <StatCard
          icon="check-circle"
          value={appointments.length} // All booked here are confirmed
          label="Confirmed"
          variant="success"
        />
        <StatCard
          icon="clock"
          value={0}
          label="Pending"
          variant="warning"
        />
      </div>

      <Card title="Appointment History">
        <Table
          columns={columns}
          data={appointments}
          emptyMessage="No appointments booked in this session"
          actions={(row) => (
            <button
              className="action-btn edit"
              onClick={() => {
                setSelectedAppointment(row);
                setShowDetailModal(true);
              }}
              title="View Details"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          )}
        />
      </Card>

      {/* Booking Modal */}
      <Modal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        title="Book Vaccination Appointment"
        footer={
          <>
            <button
              className="btn btn-outline"
              onClick={() => setShowBookingModal(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleBookAppointment}
              disabled={loading}
            >
              {loading ? "Booking..." : "Book Appointment"}
            </button>
          </>
        }
      >
        {renderBookingStep()}
      </Modal>

      {/* Appointment Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Appointment Details"
      >
        {selectedAppointment && (
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">Vaccinee</div>
              <div className="detail-value">{selectedAppointment.userName}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Doctor</div>
              <div className="detail-value">{selectedAppointment.doctorName}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Center</div>
              <div className="detail-value" style={{ color: 'var(--primary)', fontWeight: '600' }}>{selectedAppointment.centerName}</div>
            </div>
            <div className="detail-item" style={{ gridColumn: 'span 2' }}>
              <div className="detail-label">Center Address</div>
              <div className="detail-value" style={{ fontSize: '13px' }}>{selectedAppointment.centerAddress}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Vaccine</div>
              <div className="detail-value">{selectedAppointment.vaccineName}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Date</div>
              <div className="detail-value">{selectedAppointment.date}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Time</div>
              <div className="detail-value">{selectedAppointment.time}</div>
            </div>
            {/* Price would come from the vaccine object if available in selectedAppointment */}
            <div className="detail-item">
              <div className="detail-label">Status</div>
              <div className="detail-value">
                <span className="badge badge-success">
                  {selectedAppointment.status}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        title="Booking Confirmed"
      >
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div className="confirmation-icon">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3 className="confirmation-title">Appointment Booked Successfully!</h3>
          <p className="confirmation-subtitle">
            Your appointment has been scheduled.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => setShowConfirmationModal(false)}
          >
            Done
          </button>
        </div>
      </Modal>
    </div>
  );
}
