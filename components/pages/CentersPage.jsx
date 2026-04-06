"use client";

import React, { useState, useEffect } from "react";
import { toast } from 'sonner';
import api from "../../lib/axios";
import { useStore } from "../../lib/store";
import Card from "../shared/Card";
import Table from "../shared/Table";
import Modal from "../shared/Modal";
import StatCard from "../shared/StatCard";

export default function CentersPage() {
  const { centers, loadingCenters: loading, fetchCenters } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [formData, setFormData] = useState({
    centreName: "",
    address: "",
    openingTime: "09:00:00",
    closingTime: "17:00:00",
    doseCapacity: "",
  });

  useEffect(() => {
    fetchCenters();
  }, [fetchCenters]);

  const handleAddCenter = async (e) => {
    e.preventDefault();
    try {
      // Ensure times are formatted as HH:mm:ss for LocalTime
      const payload = {
        ...formData,
        // If the input type="time" gives generic 'HH:mm', append ':00' if needed
        openingTime: formData.openingTime.length === 5 ? `${formData.openingTime}:00` : formData.openingTime,
        closingTime: formData.closingTime.length === 5 ? `${formData.closingTime}:00` : formData.closingTime,
        doseCapacity: Number(formData.doseCapacity),
      };

      await api.post("/vaccinationCenter/add", payload);
      toast.success("Vaccination center added successfully");
      setShowAddModal(false);
      setFormData({
        centreName: "",
        address: "",
        openingTime: "09:00:00",
        closingTime: "17:00:00",
        doseCapacity: "",
      });
      fetchCenters(true); // force fetch
    } catch (error) {
      console.error("Full Error Object:", error);
      if (error.response?.status === 403) {
        toast.error("Access Denied", {
          description: "This operation is restricted to Administrators only. Please contact your supervisor.",
          duration: 5000,
        });
        return;
      }
      const data = error.response?.data;
      let msg = "Failed to add vaccination center";
      
      if (data) {
        if (typeof data === 'string' && data.trim() !== "") {
          msg = data;
        } else if (data.message && typeof data.message === 'string' && data.message.trim() !== "") {
          msg = data.message;
        } else if (typeof data === 'object') {
          msg = JSON.stringify(data);
        }
      } else if (error.message) {
        msg = error.message;
      }
      
      toast.error(msg);
    }
  };

  const columns = [
    { key: "centreName", label: "Center Name" },
    { key: "address", label: "Address" },
    { key: "openingTime", label: "Opens At" },
    { key: "closingTime", label: "Closes At" },
    { key: "doseCapacity", label: "Capacity" },
    {
      key: "doctorList",
      label: "Doctors",
      render: (value) => <span className="badge badge-primary">{value ? value.length : 0}</span>,
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Vaccination Centers</h1>
          <p className="page-subtitle">
            Manage vaccination centers and their capacity
          </p>
        </div>
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
          Add Center
        </button>
      </div>

      <div className="stats-grid">
        <StatCard
          icon={
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
              <path d="M9 22v-4h6v4" />
              <path d="M8 6h.01" />
              <path d="M16 6h.01" />
              <path d="M12 6h.01" />
              <path d="M12 10h.01" />
              <path d="M12 14h.01" />
              <path d="M16 10h.01" />
              <path d="M16 14h.01" />
              <path d="M8 10h.01" />
              <path d="M8 14h.01" />
            </svg>
          }
          value={centers.length}
          label="Total Centers"
          variant="primary"
        />
        <StatCard
          icon="doctors"
          value={centers.reduce((acc, c) => acc + (c.doctorList ? c.doctorList.length : 0), 0)}
          label="Total Doctors"
          variant="success"
        />
        <StatCard
          icon="users"
          value={centers.reduce((acc, c) => acc + (c.doseCapacity || 0), 0)}
          label="Total Capacity"
          variant="warning"
        />
      </div>

      <Card title="Centers List">
        {loading ? (
          <div className="loading">
            <div className="spinner" />
          </div>
        ) : (
          <Table
            columns={columns}
            data={centers}
            emptyMessage={
              <div className="flex flex-col items-center gap-4">
                <span>No vaccination centers registered yet</span>
                <button
                  className="text-sm text-primary hover:underline"
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const samples = [
                        { centreName: "Central Hospital", address: "123 Main St, New York", openingTime: "08:00:00", closingTime: "20:00:00", doseCapacity: 500 },
                        { centreName: "City Clinic", address: "456 Park Ave, London", openingTime: "09:00:00", closingTime: "17:00:00", doseCapacity: 200 },
                        { centreName: "Community Health", address: "789 Broadway, Sydney", openingTime: "10:00:00", closingTime: "16:00:00", doseCapacity: 150 }
                      ];

                      await Promise.all(samples.map(data => api.post("/vaccinationCenter/add", data)));
                      toast.success("Sample data loaded successfully");
                      fetchCenters(true); // force fetch
                    } catch (err) {
                      console.error(err);
                      toast.error("Failed to load sample data");
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
                  setSelectedCenter(row);
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

      {/* Add Center Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Vaccination Center"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleAddCenter}>
              Add Center
            </button>
          </>
        }
      >
        <form onSubmit={handleAddCenter}>
          <div className="form-group">
            <label className="form-label">Center Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter center name"
              value={formData.centreName}
              onChange={(e) => setFormData({ ...formData, centreName: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea
              className="form-textarea"
              placeholder="Enter full address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Opening Time</label>
              <input
                type="time"
                step="1"
                className="form-input"
                value={formData.openingTime}
                onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Closing Time</label>
              <input
                type="time"
                step="1"
                className="form-input"
                value={formData.closingTime}
                onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Dose Capacity</label>
            <input
              type="number"
              className="form-input"
              placeholder="Enter daily dose capacity"
              value={formData.doseCapacity}
              onChange={(e) => setFormData({ ...formData, doseCapacity: e.target.value })}
              required
            />
          </div>
        </form>
      </Modal>

      {/* Center Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Center Details"
      >
        {selectedCenter && (
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">Name</div>
              <div className="detail-value">{selectedCenter.centreName}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Address</div>
              <div className="detail-value">{selectedCenter.address}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Timings</div>
              <div className="detail-value">
                {selectedCenter.openingTime} - {selectedCenter.closingTime}
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Capacity</div>
              <div className="detail-value">{selectedCenter.doseCapacity} doses/day</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Assigned Doctors</div>
              <div className="detail-value">
                <span className="badge badge-primary">
                  {selectedCenter.doctorList ? selectedCenter.doctorList.length : 0}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
