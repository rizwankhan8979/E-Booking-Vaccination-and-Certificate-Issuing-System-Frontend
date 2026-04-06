"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "../../../lib/axios";
import Card from "../../../components/shared/Card";
import Modal from "../../../components/shared/Modal";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    mobileNo: "",
  });

  const fetchProfile = async () => {
    try {
      const response = await api.get("/user/profile");
      setProfile(response.data);
      setFormData({
        name: response.data.name || "",
        age: response.data.age || "",
        gender: response.data.gender || "",
        mobileNo: response.data.mobileNo || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateClick = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.age || !formData.gender || !formData.mobileNo) {
      toast.error("All fields are required");
      return;
    }
    setLoading(true);
    try {
      const response = await api.put("/user/update-request", formData);
      toast.success(response.data.message || "OTP sent to your email!");
      setShowOtpModal(true);
    } catch (error) {
      console.error("Update request error:", error);
      toast.error(error.response?.data?.message || "Failed to initiate update");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const response = await api.post("/user/verify-update", { otp: Number(otp) });
      toast.success(response.data.message || "Profile updated successfully!");
      setShowOtpModal(false);
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      console.error("OTP verification error:", error);
      toast.error(error.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your personal information and account settings</p>
        </div>
      </div>

      <Card title="Personal Information" className="mb-4">
        {!isEditing ? (
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">Full Name</div>
              <div className="detail-value">{profile?.name || "N/A"}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Age</div>
              <div className="detail-value">{profile?.age || "N/A"}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Gender</div>
              <div className="detail-value">{profile?.gender || "N/A"}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Mobile Number</div>
              <div className="detail-value">{profile?.mobileNo || "N/A"}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Account Role</div>
              <div className="detail-value">
                <span className={`badge ${profile?.role === "ADMIN" ? "badge-primary" : "badge-success"}`}>
                  {profile?.role || "USER"}
                </span>
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Vaccination Status</div>
              <div className="detail-value">
                <span className={`badge ${profile?.isVaccinated ? "badge-success" : "badge-warning"}`}>
                  {profile?.isVaccinated ? "Fully Vaccinated" : "Pending Doses"}
                </span>
              </div>
            </div>
            <div style={{ marginTop: "24px", gridColumn: "1 / -1" }}>
              <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                Edit Profile
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdateClick}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Age</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  className="form-select"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHERS">Other</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <input
                type="text"
                className="form-input"
                value={formData.mobileNo}
                onChange={(e) => setFormData({ ...formData, mobileNo: e.target.value })}
                required
              />
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? "Sending OTP..." : "Save Changes"}
              </button>
              <button className="btn btn-outline" type="button" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </Card>

      {/* OTP Verification Modal */}
      <Modal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        title="Verify Profile Update"
        footer={
          <button className="btn btn-primary" onClick={handleVerifyOtp} disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        }
      >
        <div style={{ textAlign: "center", padding: "10px 0" }}>
          <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>
            A 6-digit OTP has been sent to your email. Please enter it below to confirm your profile changes.
          </p>
          <div className="form-group">
            <input
              type="text"
              className="form-input"
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              style={{ textAlign: "center", fontSize: "24px", letterSpacing: "8px", fontWeight: "bold" }}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
