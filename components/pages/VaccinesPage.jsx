"use client";

import React, { useState, useEffect, useRef } from "react";
import QRCode from "react-qr-code";
import { toast } from 'sonner';
import api from "../../lib/axios";
import { useStore } from "../../lib/store";
import Card from "../shared/Card";
import Table from "../shared/Table";
import Modal from "../shared/Modal";
import StatCard from "../shared/StatCard";

export default function VaccinesPage() {
  const { vaccines, loadingVaccines: storeLoading, fetchVaccines, doctors, fetchDoctors } = useStore();
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAssociateModal, setShowAssociateModal] = useState(false);
  const [showAddVialModal, setShowAddVialModal] = useState(false);

  // Selection
  const [selectedVaccine, setSelectedVaccine] = useState(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [doctorVaccines, setDoctorVaccines] = useState([]);
  const [vaccineForVial, setVaccineForVial] = useState(null);
  const [numberOfVialsToAdd, setNumberOfVialsToAdd] = useState("");
  const [selectedVaccineIdForVial, setSelectedVaccineIdForVial] = useState("");
  const [vialSearchQuery, setVialSearchQuery] = useState("");
  const [expandedVialQr, setExpandedVialQr] = useState(null); // stores vialNumber whose QR is expanded

  // Forms
  const [formData, setFormData] = useState({
    vaccineName: "",
    manufacturer: "",
    dosesRequired: "",
    ageRange: "",
    batchNumber: "",
    totalBatchCapacity: "",
    dosesPerVial: "",
    entryDate: "",
    expiryDate: "",
    price: "",
    status: "Active",
  });

  const [associateData, setAssociateData] = useState({
    vaccineId: "",
    doctorId: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editVaccineId, setEditVaccineId] = useState(null);

  // Using global state for fetching vaccines and doctors...

  // Fetch vaccines by doctor
  const fetchVaccinesByDoctor = async (doctorId) => {
    if (!doctorId) {
      setDoctorVaccines([]);
      return;
    }
    setLoading(true);
    try {
      const response = await api.get(`/vaccine/doctor/${doctorId}`);
      setDoctorVaccines(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching doctor vaccines:", error);
      toast.error("Failed to fetch doctor's vaccines");
      setDoctorVaccines([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchVaccineDetail = (id) => {
    const vaccine = vaccines.find(v => String(v.id) === String(id));
    if (vaccine) {
      setSelectedVaccine(vaccine);
      setShowDetailModal(true);
    } else {
      toast.error("Vaccine not found in loaded list");
    }
  };

  const handleEditClick = (vaccine) => {
    setIsEditing(true);
    setEditVaccineId(vaccine.id);
    setFormData({
      vaccineName: vaccine.vaccineName || "",
      manufacturer: vaccine.manufacturer || "",
      dosesRequired: vaccine.dosesRequired || "",
      ageRange: vaccine.ageRange || "",
      batchNumber: vaccine.batchNumber || "",
      totalBatchCapacity: vaccine.totalBatchCapacity || "",
      dosesPerVial: vaccine.dosesPerVial || "",
      entryDate: vaccine.entryDate ? String(vaccine.entryDate).substring(0, 10) : "",
      expiryDate: vaccine.expiryDate ? String(vaccine.expiryDate).substring(0, 10) : "",
      price: vaccine.price || "",
      status: vaccine.status || "Active",
    });
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setIsEditing(false);
    setEditVaccineId(null);
    setFormData({
      vaccineName: "",
      manufacturer: "",
      dosesRequired: "",
      ageRange: "",
      batchNumber: "",
      totalBatchCapacity: "",
      dosesPerVial: "",
      entryDate: "",
      expiryDate: "",
      price: "",
      status: "Active",
    });
  };

  const handleOpenAddVial = (vaccine) => {
    setVaccineForVial(vaccine);
    setSelectedVaccineIdForVial(vaccine.id);
    setNumberOfVialsToAdd("");
    setShowAddVialModal(true);
  };

  const handleAddVialSubmit = async (e) => {
    e.preventDefault();
    const vid = vaccineForVial ? vaccineForVial.id : selectedVaccineIdForVial;
    if (!vid) {
      toast.error("Please select a vaccine batch first");
      return;
    }
    if (!numberOfVialsToAdd || isNaN(numberOfVialsToAdd) || Number(numberOfVialsToAdd) <= 0) {
      toast.error("Please enter a valid number of vials");
      return;
    }
    setLoading(true);
    try {
      const response = await api.post(`/vial/addVial/${vid}/${numberOfVialsToAdd}`);
      toast.success(response.data || "Vials added successfully!");
      setShowAddVialModal(false);
      setVaccineForVial(null);
      setSelectedVaccineIdForVial("");
      setNumberOfVialsToAdd("");
      fetchVaccines(true); // force reload
    } catch (error) {
      console.error("Error adding vials:", error);
      if (error.response?.status === 403) {
        toast.error("Access Denied", {
          description: "This operation is restricted to Administrators only. Please contact your supervisor.",
          duration: 5000,
        });
      } else {
        toast.error(error.response?.data?.message || error.response?.data || "Failed to add vials");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaccines();
    fetchDoctors();
  }, [fetchVaccines, fetchDoctors]);

  useEffect(() => {
    if (selectedDoctorId) {
      fetchVaccinesByDoctor(selectedDoctorId);
    } else {
      setDoctorVaccines([]);
    }
  }, [selectedDoctorId]);

  // Handle Add Vaccine
  const handleAddVaccine = async (e) => {
    e.preventDefault();
    if (!formData.vaccineName || !formData.manufacturer || !formData.dosesRequired || !formData.batchNumber || !formData.totalBatchCapacity || !formData.dosesPerVial || !formData.entryDate || !formData.expiryDate || !formData.price) {
      toast.error("Please fill in all required fields (including price)");
      return;
    }

    // Validations matching backend VaccineService
    const totalCapacity = Number(formData.totalBatchCapacity);
    const dosesPerVial = Number(formData.dosesPerVial);

    if (totalCapacity <= 0 || dosesPerVial <= 0) {
      toast.error("Total Capacity and Doses Per Vial must be greater than zero!");
      return;
    }

    if (totalCapacity % dosesPerVial !== 0) {
      toast.error(`Total Capacity (${totalCapacity}) is invalid based on vials. It must be divisible by ${dosesPerVial}!`);
      return;
    }

    if (new Date(formData.expiryDate) <= new Date(formData.entryDate)) {
      toast.error("Expiry Date must be after the Entry (Manufacturing) Date!");
      return;
    }

    try {
      const payload = {
        vaccineName: formData.vaccineName,
        manufacturer: formData.manufacturer,
        dosesRequired: Number(formData.dosesRequired),
        ageRange: formData.ageRange, // string, e.g. "18-60"
        batchNumber: formData.batchNumber,
        totalBatchCapacity: Number(formData.totalBatchCapacity),
        dosesPerVial: Number(formData.dosesPerVial),
        entryDate: formData.entryDate,
        expiryDate: formData.expiryDate,
        price: Number(formData.price),
        status: formData.status,
      };

      if (isEditing) {
        await api.put(`/vaccine/update/${editVaccineId}`, payload);
        toast.success("Vaccine updated successfully!");
      } else {
        await api.post("/vaccine/add", payload);
        toast.success("Vaccine added successfully!");
      }

      handleCloseAddModal();
      fetchVaccines(true); // force reload
    } catch (error) {
      console.error("Error adding vaccine:", error);
      if (error.response?.status === 403) {
        toast.error("Access Denied", {
          description: "This operation is restricted to Administrators only. Please contact your supervisor.",
          duration: 5000,
        });
      } else {
        toast.error(error.response?.data?.message || error.response?.data || "Failed to add vaccine");
      }
    }
  };

  // Handle Associate Vaccine with Doctor
  const handleAssociateWithDoctor = async (e) => {
    e.preventDefault();
    if (!associateData.vaccineId || !associateData.doctorId) {
      toast.error("Select both vaccine and doctor");
      return;
    }
    try {
      await api.post(
        `/vaccine/associate/${associateData.vaccineId}/doctor/${associateData.doctorId}`
      );
      toast.success("Vaccine associated with doctor successfully!");
      setShowAssociateModal(false);
      setAssociateData({ vaccineId: "", doctorId: "" });

      // Refresh list if we are in 'By Doctor' view and the selected doctor was updated
      if (activeTab === "byDoctor" && Number(selectedDoctorId) === Number(associateData.doctorId)) {
        fetchVaccinesByDoctor(selectedDoctorId);
      }
    } catch (error) {
      console.error("Error associating vaccine:", error);
      if (error.response?.status === 403) {
        toast.error("Access Denied", {
          description: "This operation is restricted to Administrators only. Please contact your supervisor.",
          duration: 5000,
        });
      } else {
        toast.error(error.response?.data?.message || error.response?.data || "Failed to associate");
      }
    }
  };

  const columns = [
    { key: "vaccineName", label: "Vaccine Name" },
    { key: "manufacturer", label: "Manufacturer" },
    { key: "dosesRequired", label: "Doses Required" },
    { key: "ageRange", label: "Age Range" },
    { 
      key: "price", 
      label: "Price",
      render: (value) => `₹${value || 0}`
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <span className={`badge ${value === "Active" ? "badge-success" : "badge-danger"}`}>
          {value || "Active"}
        </span>
      ),
    },
  ];

  const emptyState = (
    <div className="flex flex-col items-center gap-4">
      <span>{activeTab === "byDoctor" ? "No vaccines found for this doctor" : "No vaccines registered yet"}</span>
      {activeTab === "all" && (
        <button
          className="text-sm text-primary hover:underline"
          onClick={async () => {
            setLoading(true);
            try {
              const samples = [
                { vaccineName: "COVID-19 Pfizer", manufacturer: "Pfizer", dosesRequired: 2, ageRange: "12+", status: "Active" },
                { vaccineName: "COVID-19 Moderna", manufacturer: "Moderna", dosesRequired: 2, ageRange: "18+", status: "Active" },
                { vaccineName: "Influenza", manufacturer: "Sanofi", dosesRequired: 1, ageRange: "6mos+", status: "Active" }
              ];
              await Promise.all(samples.map(data => api.post("/vaccine/add", data)));
              toast.success("Sample vaccines loaded");
              fetchVaccines(true); // force reload
            } catch (err) {
              console.error(err);
              toast.error("Failed to load sample vaccines");
              setLoading(false);
            }
          }}
        >
          Load Sample Data
        </button>
      )}
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Vaccines Management</h1>
          <p className="page-subtitle">Manage vaccines and doctor associations</p>
        </div>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button
            className="btn btn-outline"
            onClick={() => {
              if (!localStorage.getItem('token')) {
                window.location.href = '/?auth=login';
              } else {
                setVaccineForVial(null);
                setSelectedVaccineIdForVial("");
                setNumberOfVialsToAdd("");
                setShowAddVialModal(true);
              }
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Vials
          </button>
          <button
            className="btn btn-outline"
            onClick={() => {
              if (!localStorage.getItem('token')) {
                window.location.href = '/?auth=login';
              } else {
                setShowAssociateModal(true);
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
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            Associate with Doctor
          </button>
          <button className="btn btn-primary" onClick={() => {
            if (!localStorage.getItem('token')) {
              window.location.href = '/?auth=login';
            } else {
              setIsEditing(false);
              setEditVaccineId(null);
              setFormData({
                vaccineName: "",
                manufacturer: "",
                dosesRequired: "",
                ageRange: "",
                batchNumber: "",
                totalBatchCapacity: "",
                dosesPerVial: "",
                entryDate: "",
                expiryDate: "",
                price: "",
                status: "Active",
              });
              setShowAddModal(true);
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
          Add Vaccine
        </button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard icon="vaccines" value={vaccines.length} label="Total Vaccines" variant="primary" />
        <StatCard
          icon="appointments"
          value={vaccines.filter((v) => v.status === "Active").length}
          label="Active Vaccines"
          variant="success"
        />
        <StatCard
          icon="users"
          value={vaccines.reduce((acc, v) => acc + (v.dosesRequired || 0), 0)}
          label="Total Doses Managed"
          variant="warning"
        />
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          All Vaccines
        </button>
        <button
          className={`tab ${activeTab === "byDoctor" ? "active" : ""}`}
          onClick={() => setActiveTab("byDoctor")}
        >
          By Doctor
        </button>
      </div>

      {activeTab === "byDoctor" && (
        <Card title="Filter by Doctor" className="mb-4">
          <div className="form-group" style={{ marginBottom: 0, maxWidth: "300px" }}>
            <select
              className="form-select"
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
            >
              <option value="">Select a doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.docId || doctor.id} value={doctor.docId || doctor.id}>
                  {doctor.name}
                </option>
              ))}
            </select>
          </div>
        </Card>
      )}

      <Card title={activeTab === "all" ? "All Vaccines" : "Doctor's Vaccines"}>
        {storeLoading || loading ? (
          <div className="loading">
            <div className="spinner" />
          </div>
        ) : (
          <Table
            columns={columns}
            data={activeTab === "all" ? vaccines : doctorVaccines}
            emptyMessage={activeTab === "byDoctor" && !selectedDoctorId ? "Please select a doctor" : emptyState}
            actions={(row) => (
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  className="action-btn"
                  onClick={() => {
                    if (!localStorage.getItem('token')) {
                      window.location.href = '/?auth=login';
                    } else {
                      handleOpenAddVial(row);
                    }
                  }}
                  title="Add Vials to Batch"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ color: "#18a689" }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <button
                  className="action-btn view"
                  onClick={() => fetchVaccineDetail(row.id)}
                  title="View Details"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ color: "var(--primary)" }}
                  >
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
                <button
                  className="action-btn edit"
                  onClick={() => {
                    if (!localStorage.getItem('token')) {
                      window.location.href = '/?auth=login';
                    } else {
                      handleEditClick(row);
                    }
                  }}
                  title="Edit Vaccine"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ color: "var(--warning)" }}
                  >
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                  </svg>
                </button>
              </div>
            )}
          />
        )}
      </Card>

      {/* Add Vaccine Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={handleCloseAddModal}
        title={isEditing ? "Edit Vaccine" : "Add New Vaccine"}
        footer={
          <>
            <button className="btn btn-outline" onClick={handleCloseAddModal}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleAddVaccine}>
              {isEditing ? "Update Vaccine" : "Add Vaccine"}
            </button>
          </>
        }
      >
        <form onSubmit={handleAddVaccine}>
          <div className="form-group">
            <label className="form-label">Vaccine Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter vaccine name"
              value={formData.vaccineName}
              onChange={(e) => setFormData({ ...formData, vaccineName: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Manufacturer</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter manufacturer name"
              value={formData.manufacturer}
              onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Doses Required</label>
              <input
                type="number"
                className="form-input"
                placeholder="Number of doses"
                value={formData.dosesRequired}
                onChange={(e) => setFormData({ ...formData, dosesRequired: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Age Range</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 18-65 years"
                value={formData.ageRange}
                onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Batch Number</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. BATCH-2026-X1"
              value={formData.batchNumber}
              onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Total Batch Capacity</label>
              <input
                type="number"
                className="form-input"
                placeholder="Total doses"
                value={formData.totalBatchCapacity}
                onChange={(e) => setFormData({ ...formData, totalBatchCapacity: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Doses Per Vial</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 10"
                value={formData.dosesPerVial}
                onChange={(e) => setFormData({ ...formData, dosesPerVial: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Entry (Mfg) Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.entryDate}
                onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Expiry Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Price (₹)</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 500"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* Associate Vaccine with Doctor Modal */}
      <Modal
        isOpen={showAssociateModal}
        onClose={() => setShowAssociateModal(false)}
        title="Associate Vaccine with Doctor"
        footer={
          <>
            <button
              className="btn btn-outline"
              onClick={() => setShowAssociateModal(false)}
            >
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleAssociateWithDoctor}>
              Associate
            </button>
          </>
        }
      >
        <form onSubmit={handleAssociateWithDoctor}>
          <div className="form-group">
            <label className="form-label">Select Vaccine</label>
            <select
              className="form-select"
              value={associateData.vaccineId}
              onChange={(e) =>
                setAssociateData({ ...associateData, vaccineId: e.target.value })
              }
              required
            >
              <option value="">Choose a vaccine</option>
              {vaccines.map((vaccine) => (
                <option key={vaccine.id} value={vaccine.id}>
                  {vaccine.vaccineName}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Select Doctor</label>
            <select
              className="form-select"
              value={associateData.doctorId}
              onChange={(e) =>
                setAssociateData({ ...associateData, doctorId: e.target.value })
              }
              required
            >
              <option value="">Choose a doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.docId || doctor.id} value={doctor.docId || doctor.id}>
                  {doctor.name}
                </option>
              ))}
            </select>
          </div>
        </form>
      </Modal>

      {/* Vaccine Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => { setShowDetailModal(false); setVialSearchQuery(""); setExpandedVialQr(null); }}
        title="Vaccine Details"
      >
        {selectedVaccine && (
          <div>
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">Name</div>
                <div className="detail-value">{selectedVaccine.vaccineName}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Manufacturer</div>
                <div className="detail-value">{selectedVaccine.manufacturer}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Doses Required</div>
                <div className="detail-value">{selectedVaccine.dosesRequired}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Age Range</div>
                <div className="detail-value">{selectedVaccine.ageRange}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Batch Number</div>
                <div className="detail-value" style={{ fontFamily: "monospace", fontWeight: "bold", color: "var(--primary)" }}>{selectedVaccine.batchNumber}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Capacity / Vial Limits</div>
                <div className="detail-value">Total: {selectedVaccine.totalBatchCapacity}, Per vial: {selectedVaccine.dosesPerVial}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Mfg Date</div>
                <div className="detail-value">{selectedVaccine.entryDate ? new Date(selectedVaccine.entryDate).toLocaleDateString() : 'N/A'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Expiry Date</div>
                <div className="detail-value">{selectedVaccine.expiryDate ? new Date(selectedVaccine.expiryDate).toLocaleDateString() : 'N/A'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Status</div>
                <div className="detail-value">
                  <span className={`badge ${selectedVaccine.status === "Active" ? "badge-success" : "badge-danger"}`}>
                    {selectedVaccine.status}
                  </span>
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Price</div>
                <div className="detail-value" style={{ fontSize: "18px", fontWeight: "bold", color: "#18a689" }}>₹{selectedVaccine.price || 0}</div>
              </div>
            </div>

            {/* ===== Associated Vials Section ===== */}
            <div style={{ marginTop: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", gap: "12px", flexWrap: "wrap" }}>
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>
                  🧪 Associated Vials
                  <span style={{ marginLeft: "8px", background: "var(--primary)", color: "#fff", borderRadius: "20px", padding: "2px 10px", fontSize: "12px", fontWeight: 700 }}>
                    {selectedVaccine.vials ? selectedVaccine.vials.length : 0}
                  </span>
                </h3>
                {selectedVaccine.vials && selectedVaccine.vials.length > 0 && (
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search vial number..."
                    value={vialSearchQuery}
                    onChange={(e) => setVialSearchQuery(e.target.value)}
                    style={{ maxWidth: "220px", padding: "6px 12px", fontSize: "13px" }}
                  />
                )}
              </div>

              {!selectedVaccine.vials || selectedVaccine.vials.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)", background: "var(--surface)", borderRadius: "8px", fontSize: "14px" }}>
                  ⚠️ Koi vial nahi mila. Pehle "Add Vials" button se vials add karo.
                </div>
              ) : (
                <div style={{ maxHeight: "350px", overflowY: "auto", borderRadius: "8px", border: "1px solid var(--border)" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ background: "var(--surface-2, rgba(255,255,255,0.05))", position: "sticky", top: 0, zIndex: 1 }}>
                        <th style={{ padding: "8px 12px", textAlign: "left", color: "var(--text-muted)", fontWeight: 600 }}>#</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", color: "var(--text-muted)", fontWeight: 600 }}>Vial Number</th>
                        <th style={{ padding: "8px 12px", textAlign: "center", color: "var(--text-muted)", fontWeight: 600 }}>Doses</th>
                        <th style={{ padding: "8px 12px", textAlign: "center", color: "var(--text-muted)", fontWeight: 600 }}>Status</th>
                        <th style={{ padding: "8px 12px", textAlign: "center", color: "var(--text-muted)", fontWeight: 600 }}>QR Code</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedVaccine.vials
                        .filter(v => v.vialNumber?.toLowerCase().includes(vialSearchQuery.toLowerCase()))
                        .map((vial, idx) => {
                          const qrUrl = `http://10.151.31.105:3000/scan/${encodeURIComponent(vial.vialNumber)}`;
                          const isExpanded = expandedVialQr === vial.vialNumber;
                          return (
                            <React.Fragment key={vial.id || idx}>
                              <tr
                                style={{ borderTop: "1px solid var(--border)", transition: "background 0.15s" }}
                                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                              >
                                <td style={{ padding: "8px 12px", color: "var(--text-muted)" }}>{idx + 1}</td>
                                <td style={{ padding: "8px 12px", fontFamily: "monospace", fontWeight: 600, color: "var(--primary)", letterSpacing: "0.5px" }}>
                                  {vial.vialNumber}
                                </td>
                                <td style={{ padding: "8px 12px", textAlign: "center", color: "var(--text-primary)" }}>{vial.remainingDoses}</td>
                                <td style={{ padding: "8px 12px", textAlign: "center" }}>
                                  <span className={`badge ${vial.status === "AVAILABLE" ? "badge-success" : vial.status === "EXHAUSTED" ? "badge-danger" : "badge-warning"}`}>
                                    {vial.status}
                                  </span>
                                </td>
                                <td style={{ padding: "8px 12px", textAlign: "center" }}>
                                  <div style={{ display: "flex", gap: "6px", justifyContent: "center", alignItems: "center" }}>
                                    {/* View QR toggle */}
                                    <button
                                      onClick={() => setExpandedVialQr(isExpanded ? null : vial.vialNumber)}
                                      title={isExpanded ? "Hide QR" : "Show QR"}
                                      style={{ background: isExpanded ? "var(--primary)" : "transparent", color: isExpanded ? "#fff" : "var(--primary)", border: "1px solid var(--primary)", borderRadius: "6px", padding: "4px 8px", cursor: "pointer", fontSize: "12px", fontWeight: 600, transition: "all 0.2s" }}
                                    >
                                      {isExpanded ? "Hide" : "📱 QR"}
                                    </button>
                                    {/* Download QR */}
                                    <button
                                      title="Download QR as PNG"
                                      onClick={() => {
                                        const doDownload = (vialNum) => {
                                          const svg = document.getElementById(`qr-${vialNum}`);
                                          if (!svg) return;
                                          const svgData = new XMLSerializer().serializeToString(svg);
                                          const canvas = document.createElement('canvas');
                                          canvas.width = 400; canvas.height = 400;
                                          const ctx = canvas.getContext('2d');
                                          const img = new Image();
                                          img.onload = () => {
                                            ctx.fillStyle = '#ffffff';
                                            ctx.fillRect(0, 0, 400, 400);
                                            ctx.drawImage(img, 0, 0, 400, 400);
                                            const link = document.createElement('a');
                                            link.download = `${vialNum}.png`;
                                            link.href = canvas.toDataURL('image/png');
                                            link.click();
                                            toast.success(`QR downloaded: ${vialNum}.png`);
                                          };
                                          img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
                                        };
                                        const svg = document.getElementById(`qr-${vial.vialNumber}`);
                                        if (!svg) {
                                          // QR not visible yet — expand it first, then download after render
                                          setExpandedVialQr(vial.vialNumber);
                                          setTimeout(() => doDownload(vial.vialNumber), 350);
                                        } else {
                                          doDownload(vial.vialNumber);
                                        }
                                      }}
                                      style={{ background: "transparent", color: "#18a689", border: "1px solid #18a689", borderRadius: "6px", padding: "4px 8px", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}
                                    >
                                      ⬇️ PNG
                                    </button>
                                  </div>
                                </td>
                              </tr>
                              {/* Expanded QR Row */}
                              {isExpanded && (
                                <tr style={{ borderTop: "none" }}>
                                  <td colSpan="5" style={{ padding: "16px 24px", background: "rgba(255,255,255,0.03)" }}>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                                      <div style={{ background: "#ffffff", padding: "16px", borderRadius: "12px", display: "inline-block", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
                                        <QRCode
                                          id={`qr-${vial.vialNumber}`}
                                          value={qrUrl}
                                          size={180}
                                          level="M"
                                        />
                                      </div>
                                      <div style={{ textAlign: "center" }}>
                                        <p style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--primary)", fontSize: "14px", marginBottom: "4px" }}>{vial.vialNumber}</p>
                                        <p style={{ fontSize: "11px", color: "var(--text-muted)", maxWidth: "300px", wordBreak: "break-all" }}>📡 Scan URL: {qrUrl}</p>
                                        <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>📱 Print this QR and stick it on the vial</p>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })
                      }
                      {selectedVaccine.vials.filter(v => v.vialNumber?.toLowerCase().includes(vialSearchQuery.toLowerCase())).length === 0 && (
                        <tr>
                          <td colSpan="5" style={{ padding: "16px", textAlign: "center", color: "var(--text-muted)" }}>Koi vial nahi mila is search ke liye.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Add Vial Modal */}
      <Modal
        isOpen={showAddVialModal}
        onClose={() => setShowAddVialModal(false)}
        title={vaccineForVial ? `Add Vials to ${vaccineForVial.vaccineName}` : "Add Vials"}
        footer={
          <>
            <button className="btn btn-outline" type="button" onClick={() => setShowAddVialModal(false)} disabled={loading}>
              Cancel
            </button>
            <button className="btn btn-primary" type="button" onClick={handleAddVialSubmit} disabled={loading}>
              {loading ? "Adding..." : "Add Vials"}
            </button>
          </>
        }
      >
        <form onSubmit={handleAddVialSubmit}>
          {!vaccineForVial && (
            <div className="form-group">
              <label className="form-label">Select Vaccine Batch</label>
              <select
                className="form-select"
                value={selectedVaccineIdForVial}
                onChange={(e) => setSelectedVaccineIdForVial(e.target.value)}
                required
              >
                <option value="">Choose a vaccine...</option>
                {vaccines.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.vaccineName} (Batch: {v.batchNumber})
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Number of Vials to Add</label>
            <input
              type="number"
              className="form-input"
              placeholder="e.g. 10"
              value={numberOfVialsToAdd}
              onChange={(e) => setNumberOfVialsToAdd(e.target.value)}
              required
              min="1"
            />
            {vaccineForVial && (
              <p className="text-xs text-slate-500 mt-2">
                Batch: <span className="font-bold">{vaccineForVial.batchNumber}</span> | Doses per vial: <span className="font-bold">{vaccineForVial.dosesPerVial}</span>
              </p>
            )}
            {!vaccineForVial && selectedVaccineIdForVial && (
              <p className="text-xs text-slate-500 mt-2">
                Batch: <span className="font-bold">{vaccines.find(v => v.id == selectedVaccineIdForVial)?.batchNumber}</span> | Doses per vial: <span className="font-bold">{vaccines.find(v => v.id == selectedVaccineIdForVial)?.dosesPerVial}</span>
              </p>
            )}
            {vaccines.length === 0 && !vaccineForVial && (
              <p className="text-xs text-red-500 mt-2 font-bold">
                No vaccines exist in the system yet. Please click &quot;Add Vaccine&quot; at the top first!
              </p>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
}
