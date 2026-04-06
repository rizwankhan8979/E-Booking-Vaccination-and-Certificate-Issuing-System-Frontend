"use client";

import React, { useState, useEffect } from "react";
import { toast } from 'sonner';
import api from "../../lib/axios";
import { useStore } from "../../lib/store";
import Card from "../shared/Card";
import Table from "../shared/Table";
import Modal from "../shared/Modal";

export default function DoctorsPage() {
  const { doctors, loadingDoctors: loading, fetchDoctors } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAssociateModal, setShowAssociateModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "MALE",
    emailId: "",
  });
  const [associateData, setAssociateData] = useState({
    docId: "",
    centerId: "",
  });

  // Success/Error message states
  const [addSuccess, setAddSuccess] = useState("");
  const [addError, setAddError] = useState("");
  const [associateSuccess, setAssociateSuccess] = useState("");
  const [associateError, setAssociateError] = useState("");
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // POST /doctor/add - Add new doctor
  const handleAddDoctor = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.age || !formData.emailId) {
      toast.error("Please fill in all required fields");
      return;
    }
    setAddError("");
    setAddSuccess("");
    try {
      const payload = {
        name: formData.name,
        age: Number(formData.age),
        gender: formData.gender,
        emailId: formData.emailId,
        // centerId is not set here, it's done via associateWithCenter
      };
      const response = await api.post("/doctor/add", payload);
      const msg = response.data?.message || response.data || "Doctor added successfully!";
      toast.success(msg);

      setFormData({
        name: "",
        age: "",
        gender: "MALE",
        emailId: "",
      });
      fetchDoctors(true); // force reload
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding doctor:", error);
      if (error.response?.status === 403) {
        toast.error("Access Denied", {
          description: "This operation is restricted to Administrators only. Please contact your supervisor.",
          duration: 5000,
        });
      } else {
        const msg = error.response?.data?.message || error.response?.data || "Failed to add doctor";
        toast.error(msg);
      }
    }
  };

  // POST /doctor/associateWithCenter - Associate doctor with center
  const handleAssociateWithCenter = async (e) => {
    e.preventDefault();
    if (!associateData.docId || !associateData.centerId) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      const payload = {
        docId: Number(associateData.docId),
        centerId: Number(associateData.centerId),
      };
      const response = await api.post("/doctor/associateWithCenter", payload);
      const msg = response.data?.message || response.data || "Doctor associated with center successfully!";
      toast.success(msg);

      setAssociateData({ docId: "", centerId: "" });
      fetchDoctors(true); // force reload
      setShowAssociateModal(false);
    } catch (error) {
      console.error("Error associating doctor:", error);
      if (error.response?.status === 403) {
        toast.error("Access Denied", {
          description: "This operation is restricted to Administrators only. Please contact your supervisor.",
          duration: 5000,
        });
      } else {
        const msg = error.response?.data?.message || error.response?.data || "Failed to associate doctor";
        toast.error(msg);
      }
    }
  };

  const columns = [
    { key: "docId", label: "ID" },
    { key: "name", label: "Name" },
    { key: "emailId", label: "Email" },
    { key: "age", label: "Age" },
    { key: "gender", label: "Gender" },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Doctors Management</h1>
          <p className="page-subtitle">
            Manage doctors and their center assignments
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
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
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" x2="19" y1="8" y2="14" />
              <line x1="22" x2="16" y1="11" y2="11" />
            </svg>
            Associate with Center
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => {
              if (!localStorage.getItem('token')) {
                window.location.href = '/?auth=login';
              } else {
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
            Add Doctor
          </button>
        </div>
      </div>

      {fetchError && (
        <div className="alert alert-danger" style={{ marginBottom: "24px" }}>
          {fetchError}
        </div>
      )}

      <Card title="Doctors List">
        {loading ? (
          <div className="loading">
            <div className="spinner" />
          </div>
        ) : (
          <Table
            columns={columns}
            data={doctors}
            emptyMessage={
              <div className="flex flex-col items-center gap-4">
                <span>No doctors registered yet</span>
                <button
                  className="text-sm text-primary hover:underline"
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const samples = [
                        { name: "Dr. Smith", age: 45, gender: "MALE", emailId: "smith@example.com" },
                        { name: "Dr. Jane", age: 38, gender: "FEMALE", emailId: "jane@example.com" },
                        { name: "Dr. Alex", age: 50, gender: "OTHER", emailId: "alex@example.com" }
                      ];

                      await Promise.all(samples.map(data => api.post("/doctor/add", data)));
                      toast.success("Sample doctors loaded successfully");
                      fetchDoctors(true); // force reload
                    } catch (err) {
                      console.error(err);
                      toast.error("Failed to load sample doctors");
                      setLoading(false);
                    }
                  }}
                >
                  Load Sample Data
                </button>
              </div>
            }
            actions={(row) => (
              <button
                className="action-btn edit"
                onClick={() => {
                  setSelectedDoctor(row);
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
        )}
      </Card>

      {/* Add Doctor Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setAddError("");
          setAddSuccess("");
        }}
        title="Add New Doctor"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => {
              setShowAddModal(false);
              setAddError("");
              setAddSuccess("");
            }}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleAddDoctor}>
              Add Doctor
            </button>
          </>
        }
      >
        {addSuccess && (
          <div className="alert alert-success" style={{ marginBottom: "16px" }}>
            {addSuccess}
          </div>
        )}
        {addError && (
          <div className="alert alert-danger" style={{ marginBottom: "16px" }}>
            {addError}
          </div>
        )}
        <form onSubmit={handleAddDoctor}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter doctor's full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email ID *</label>
            <input
              type="email"
              className="form-input"
              placeholder="Enter email address"
              value={formData.emailId}
              onChange={(e) => setFormData({ ...formData, emailId: e.target.value })}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Age *</label>
              <input
                type="number"
                className="form-input"
                placeholder="Enter age"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                required
                min="1"
                max="100"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Gender *</label>
              <select
                className="form-select"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                required
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* Associate Doctor with Center Modal */}
      <Modal
        isOpen={showAssociateModal}
        onClose={() => {
          setShowAssociateModal(false);
          setAssociateError("");
          setAssociateSuccess("");
        }}
        title="Associate Doctor with Center"
        footer={
          <>
            <button
              className="btn btn-outline"
              onClick={() => {
                setShowAssociateModal(false);
                setAssociateError("");
                setAssociateSuccess("");
              }}
            >
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleAssociateWithCenter}>
              Associate
            </button>
          </>
        }
      >
        {associateSuccess && (
          <div className="alert alert-success" style={{ marginBottom: "16px" }}>
            {associateSuccess}
          </div>
        )}
        {associateError && (
          <div className="alert alert-danger" style={{ marginBottom: "16px" }}>
            {associateError}
          </div>
        )}
        <form onSubmit={handleAssociateWithCenter}>
          <div className="form-group">
            <label className="form-label">Doctor ID *</label>
            <input
              type="number"
              className="form-input"
              placeholder="Enter Doctor ID"
              value={associateData.docId}
              onChange={(e) =>
                setAssociateData({ ...associateData, docId: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Center ID *</label>
            <input
              type="number"
              className="form-input"
              placeholder="Enter Center ID"
              value={associateData.centerId}
              onChange={(e) =>
                setAssociateData({ ...associateData, centerId: e.target.value })
              }
              required
            />
          </div>
        </form>
      </Modal>

      {/* Doctor Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Doctor Details"
      >
        {selectedDoctor && (
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">ID</div>
              <div className="detail-value">{selectedDoctor.docId}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Name</div>
              <div className="detail-value">{selectedDoctor.name}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Email</div>
              <div className="detail-value">{selectedDoctor.emailId}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Age</div>
              <div className="detail-value">{selectedDoctor.age}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Gender</div>
              <div className="detail-value">{selectedDoctor.gender}</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
