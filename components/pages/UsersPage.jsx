"use client";

import React, { useState } from "react";
import api from "../../lib/axios";
import Card from "../shared/Card";
import Modal from "../shared/Modal";

export default function UsersPage() {
  // Search User state (For Get My Profile ONLY)
  const [searchedUser, setSearchedUser] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Find by Email state (For Admin Search ONLY)
  const [emailSearchedUser, setEmailSearchedUser] = useState(null);
  const [emailSearchLoading, setEmailSearchLoading] = useState(false);
  const [emailSearchError, setEmailSearchError] = useState("");

  // Get Vaccination Date state
  const [vacDateResult, setVacDateResult] = useState(null);
  const [vacDateLoading, setVacDateLoading] = useState(false);
  const [vacDateError, setVacDateError] = useState("");

  // My Vaccine History state
  const [myDosesGroups, setMyDosesGroups] = useState(null);
  const [myDosesLoading, setMyDosesLoading] = useState(false);
  const [myDosesError, setMyDosesError] = useState("");

  // Update Email state
  const [updateEmailUserId, setUpdateEmailUserId] = useState("");
  const [updateEmailNewEmail, setUpdateEmailNewEmail] = useState("");
  const [updateEmailLoading, setUpdateEmailLoading] = useState(false);
  const [updateEmailSuccess, setUpdateEmailSuccess] = useState("");
  const [updateEmailError, setUpdateEmailError] = useState("");
  const [showUpdateEmailModal, setShowUpdateEmailModal] = useState(false);

  // Add User state (two-step OTP flow)
  const [showAddModal, setShowAddModal] = useState(false);
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [addUserError, setAddUserError] = useState("");
  const [addUserSuccess, setAddUserSuccess] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "MALE",
    contactNo: "",
  });

  // Update Profile state (two-step OTP flow)
  const [showUpdateProfileModal, setShowUpdateProfileModal] = useState(false);
  const [updateProfileStep, setUpdateProfileStep] = useState("form"); // 'form' or 'otp'
  const [updateProfileLoading, setUpdateProfileLoading] = useState(false);
  const [updateProfileError, setUpdateProfileError] = useState("");
  const [updateProfileSuccess, setUpdateProfileSuccess] = useState("");
  const [updateFormData, setUpdateFormData] = useState({
    name: "",
    age: "",
    gender: "MALE",
    contactNo: "",
  });
  const [updateProfileOtp, setUpdateProfileOtp] = useState("");
  const [userRole, setUserRole] = useState(null);

  // Sync role only on mount
  React.useEffect(() => {
    const role = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
    setUserRole(role);
  }, []);

  // Get My Profile - GET /user/profile
  const handleGetMyProfile = async () => {
    try {
      setSearchLoading(true);
      setSearchError("");
      setSearchedUser(null);
      const response = await api.get("/user/profile");
      if (response.data) {
        setSearchedUser(response.data);
      } else {
        setSearchError("Profile not found");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      const msg = error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response?.data : "Failed to fetch profile");
      setSearchError(msg);
    } finally {
      setSearchLoading(false);
    }
  };

  // Get Vaccination Date - GET /user/getVaccinationDate
  const handleGetVaccinationDate = async () => {
    try {
      setVacDateLoading(true);
      setVacDateError("");
      setVacDateResult(null);
      const response = await api.get(`/user/getVaccinationDate`);
      if (response.data) {
        setVacDateResult(response.data);
      } else {
        setVacDateError("No vaccination date found");
      }
    } catch (error) {
      console.error("Error fetching vaccination date:", error);
      const msg = error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response?.data : "Dose not taken yet or user not found");
      setVacDateError(msg);
    } finally {
      setVacDateLoading(false);
    }
  };

  // Get My Full Dose History - GET /user/myDoses
  const handleGetMyDoses = async () => {
    try {
      setMyDosesLoading(true);
      setMyDosesError("");
      setMyDosesGroups(null);
      const response = await api.get("/user/myDoses");
      const doses = Array.isArray(response.data) ? response.data : [];
      
      // Group doses by vaccine name
      const grouped = {};
      doses.forEach(dose => {
        const vName = dose.vaccineName || "Unknown Vaccine";
        if (!grouped[vName]) {
          grouped[vName] = {
            name: vName,
            dosesRequired: dose.dosesRequired || 1,
            doses: []
          };
        }
        grouped[vName].doses.push(dose);
      });
      
      setMyDosesGroups(Object.values(grouped));
    } catch (error) {
      console.error("Error fetching dose history:", error);
      const msg = error.response?.data?.message || "Failed to fetch dose history.";
      setMyDosesError(msg);
    } finally {
      setMyDosesLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.age || !formData.contactNo) {
      setAddUserError("Please fill in all required fields");
      return;
    }

    if (!/^[0-9]{10}$/.test(formData.contactNo)) {
      setAddUserError("Mobile number must be exactly 10 digits and contain only numbers.");
      return;
    }
    setAddUserLoading(true);
    setAddUserError("");
    try {
      const payload = {
        name: formData.name,
        age: Number(formData.age),
        gender: formData.gender,
        mobileNo: formData.contactNo,
      };

      const response = await api.post("/user/add", payload);
      const msg = response.data?.message || (typeof response.data === 'string' ? response.data : "User profile completed successfully!");
      setAddUserSuccess(msg);
      // Reset form after successful registration
      setTimeout(() => {
        resetAddUserForm();
      }, 2000);
    } catch (error) {
      console.error("Error adding user:", error);
      let msg = "Failed to add user.";
      if (error.response?.data) {
        if (error.response.data.message) msg = error.response.data.message;
        else if (typeof error.response.data === "string") msg = error.response.data;
        else msg = JSON.stringify(error.response.data);
      } else if (error.message) {
        msg = error.message;
      }
      setAddUserError(msg);
    }
    setAddUserLoading(false);
  };

  const resetAddUserForm = () => {
    setShowAddModal(false);
    setFormData({
      name: "",
      age: "",
      gender: "MALE",
      contactNo: "",
    });
    setAddUserError("");
    setAddUserSuccess("");
  };

  // Request Update Profile OTP
  const handleRequestProfileUpdate = async (e) => {
    e.preventDefault();
    if (!updateFormData.name || !updateFormData.age || !updateFormData.contactNo) {
      setUpdateProfileError("Please fill in all required fields");
      return;
    }
    if (!/^[0-9]{10}$/.test(updateFormData.contactNo)) {
      setUpdateProfileError("Mobile number must be exactly 10 digits and contain only numbers.");
      return;
    }
    setUpdateProfileLoading(true);
    setUpdateProfileError("");
    setUpdateProfileSuccess("");
    try {
      const payload = {
        name: updateFormData.name,
        age: Number(updateFormData.age),
        gender: updateFormData.gender,
        mobileNo: updateFormData.contactNo,
      };
      const response = await api.put("/user/update-request", payload);
      setUpdateProfileSuccess(response.data?.message || "OTP sent to your email!");
      setUpdateProfileStep("otp"); // Move to OTP step
    } catch (error) {
      console.error("Error requesting profile update:", error);
      let msg = error.response?.data?.message || "Failed to initiate update.";
      setUpdateProfileError(msg);
    }
    setUpdateProfileLoading(false);
  };

  // Verify Update Profile OTP
  const handleVerifyProfileUpdate = async (e) => {
    e.preventDefault();
    if (!updateProfileOtp || updateProfileOtp.length !== 6) {
      setUpdateProfileError("Please enter a valid 6-digit OTP.");
      return;
    }
    setUpdateProfileLoading(true);
    setUpdateProfileError("");
    try {
      const response = await api.post("/user/verify-update", { otp: Number(updateProfileOtp) });
      alert(response.data?.message || "Profile updated successfully!");
      resetUpdateProfileForm();
      handleGetMyProfile(); // Refresh profile silently
    } catch (error) {
      console.error("Error verifying profile update:", error);
      let msg = error.response?.data?.message || "Invalid OTP or failure updating profile.";
      setUpdateProfileError(msg);
    }
    setUpdateProfileLoading(false);
  };

  const resetUpdateProfileForm = () => {
    setShowUpdateProfileModal(false);
    setUpdateProfileStep("form");
    setUpdateProfileOtp("");
    setUpdateFormData({
      name: "",
      age: "",
      gender: "MALE",
      contactNo: "",
    });
    setUpdateProfileError("");
    setUpdateProfileSuccess("");
  };



  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Users Management</h1>
          <p className="page-subtitle">
            View your profile, vaccination dates, and manage appointments
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" x2="12" y1="5" y2="19" />
              <line x1="5" x2="19" y1="12" y2="12" />
            </svg>
            Complete Profile
          </button>
          
          <button className="btn btn-primary" onClick={() => {
             if (searchedUser) {
               setUpdateFormData({
                 name: searchedUser.name || "",
                 age: searchedUser.age || "",
                 gender: searchedUser.gender || "MALE",
                 contactNo: searchedUser.mobileNo || "",
               });
             }
             setShowUpdateProfileModal(true);
          }}>
             Update Profile
          </button>
        </div>
      </div>

      {/* Section A: Get My Profile */}
      <Card
        title="My Profile"
        actions={
          <button
            className="btn btn-primary btn-sm"
            onClick={handleGetMyProfile}
            disabled={searchLoading}
          >
            {searchLoading ? "Loading..." : "Get Profile"}
          </button>
        }
      >
        <p style={{ color: "var(--text-secondary)", marginBottom: "16px", fontSize: "14px" }}>
          Click to view your profile details
        </p>

        {searchError && (
          <div className="alert alert-danger" style={{ marginTop: "16px" }}>
            {searchError}
          </div>
        )}

        {searchedUser && (
          <div style={{ marginTop: "24px" }}>
            <h4 style={{ marginBottom: "16px", fontWeight: "600", color: "var(--text-primary)" }}>
              User Details
            </h4>
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">User ID</div>
                <div className="detail-value">{searchedUser.userId}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Name</div>
                <div className="detail-value">{searchedUser.name}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Mobile No</div>
                <div className="detail-value">{searchedUser.mobileNo}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Age</div>
                <div className="detail-value">{searchedUser.age} years</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Gender</div>
                <div className="detail-value">{searchedUser.gender}</div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Section B: Get Vaccination Date */}
      <div style={{ marginTop: "24px" }}>
        <Card
          title="Get My Vaccination Dates"
          actions={
            <button
              className="btn btn-primary btn-sm"
              onClick={handleGetVaccinationDate}
              disabled={vacDateLoading}
            >
              {vacDateLoading ? "Loading..." : "Get My Vaccination Dates"}
            </button>
          }
        >
          {vacDateError && (
            <div className="alert alert-warning" style={{ marginTop: "16px" }}>
              {vacDateError}
            </div>
          )}

          {vacDateResult && (
            <div style={{ marginTop: "16px" }}>
              {(Array.isArray(vacDateResult) && vacDateResult.length === 0) ? (
                <div className="alert alert-info" style={{ color: "var(--text-secondary)", backgroundColor: "var(--background)", border: "1px dashed var(--border)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  No Vaccination Scheduled Yet.
                </div>
              ) : (
                <>
                  <label className="form-label" style={{ marginBottom: "8px", display: "block" }}>Vaccination Dates</label>
                  {Array.isArray(vacDateResult) ? [...new Set(vacDateResult)].map((date, idx) => (
                    <input
                      key={idx}
                      type="text"
                      className="form-input"
                      value={new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      readOnly
                      style={{ backgroundColor: "var(--background)", cursor: "not-allowed", marginBottom: "8px" }}
                    />
                  )) : (
                    <input
                      type="text"
                      className="form-input"
                      value={vacDateResult}
                      readOnly
                      style={{ backgroundColor: "var(--background)", cursor: "not-allowed" }}
                    />
                  )}
                </>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Section C: My Vaccine History (Grouped) */}
      <div style={{ marginTop: "24px" }}>
        <Card
          title="My Vaccine History"
          actions={
            <button
              className="btn btn-primary btn-sm"
              onClick={handleGetMyDoses}
              disabled={myDosesLoading}
            >
              {myDosesLoading ? "Loading..." : "Load My Vaccine History"}
            </button>
          }
        >
          {myDosesError && (
            <div className="alert alert-danger" style={{ marginTop: "16px" }}>{myDosesError}</div>
          )}

          {!myDosesGroups && !myDosesError && (
            <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
              Click the button to view your complete vaccination history grouped by vaccine.
            </p>
          )}

          {myDosesGroups && myDosesGroups.length === 0 && (
            <div className="alert alert-info" style={{ color: "var(--text-secondary)", backgroundColor: "var(--background)", border: "1px dashed var(--border)", marginTop: "16px" }}>
              No doses have been administered to you yet.
            </div>
          )}

          {myDosesGroups && myDosesGroups.length > 0 && (
            <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "24px" }}>
              {myDosesGroups.map((group, gIdx) => {
                const isGroupComplete = group.doses.length >= group.dosesRequired;
                return (
                  <div key={gIdx} style={{
                    background: "var(--background)",
                    borderRadius: "16px",
                    padding: "20px",
                    border: isGroupComplete ? "1px solid rgba(16,185,129,0.3)" : "1px solid var(--border)"
                  }}>
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center", 
                      marginBottom: "16px"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{
                          width: "36px", height: "36px", borderRadius: "50%",
                          background: "rgba(14,165,233,0.15)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: "800", color: "var(--primary)", fontSize: "14px"
                        }}>🧪</div>
                        <span style={{ fontWeight: "800", fontSize: "16px", color: "var(--text-primary)" }}>
                          {group.name} 
                          <span style={{ marginLeft: "8px", color: isGroupComplete ? "#10b981" : "var(--primary)" }}>
                            ({group.doses.length}/{group.dosesRequired})
                          </span>
                        </span>
                      </div>
                      {isGroupComplete ? (
                        <span style={{
                          background: "rgba(16,185,129,0.15)", color: "#10b981",
                          padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700"
                        }}>✅ COMPLETED</span>
                      ) : (
                        <span style={{
                          background: "rgba(245,158,11,0.15)", color: "#f59e0b",
                          padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700"
                        }}>⏳ IN PROGRESS</span>
                      )}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
                      {group.doses.map((dose, idx) => (
                        <div key={idx} style={{
                          background: "var(--surface)",
                          borderRadius: "12px",
                          padding: "12px 16px",
                          border: "1px solid var(--border)",
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "8px"
                        }}>
                          <div style={{ gridColumn: "span 2", display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                            <div style={{ 
                              width: "24px", height: "24px", borderRadius: "50%", 
                              background: "rgba(14,165,233,0.1)", 
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "12px", fontWeight: "800", color: "var(--primary)"
                            }}>#{dose.doseNumber}</div>
                            <span style={{ fontSize: "13px", fontWeight: "700" }}>Dose Administered</span>
                          </div>
                          <div>
                            <div style={{ fontSize: "11px", color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "2px" }}>Batch</div>
                            <div style={{ fontWeight: "600", fontSize: "12px" }}>{dose.batchNumber}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: "11px", color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "2px" }}>Vial</div>
                            <div style={{ fontWeight: "600", fontSize: "12px" }}>{dose.vialSerialNumber}</div>
                          </div>
                          <div style={{ gridColumn: "span 2" }}>
                            <div style={{ fontSize: "11px", color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "2px" }}>Date</div>
                            <div style={{ fontWeight: "600", fontSize: "12px" }}>
                              {dose.vaccinationDate ? new Date(dose.vaccinationDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                            </div>
                          </div>
                          <div style={{ gridColumn: "span 2", paddingTop: "4px", borderTop: "1px dashed var(--border)" }}>
                            <div style={{ fontSize: "11px", color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "2px" }}>Administered By</div>
                            <div style={{ fontWeight: "700", fontSize: "12px", color: "var(--primary)" }}>
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
          )}
        </Card>
      </div>

      {/* Admin Quick Search Section */}
      <div style={{ marginTop: "24px" }}>
        <Card title="Admin: Find User by Email">
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="Enter user email"
                id="search-email-input"
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={async () => {
                const email = document.getElementById("search-email-input").value;
                if (!email) {
                  setEmailSearchError("Please enter an email");
                  return;
                }
                setEmailSearchLoading(true);
                setEmailSearchError("");
                setEmailSearchedUser(null);
                try {
                  const res = await api.get(`/auth/by-email/${email}`);
                  if (res.data) setEmailSearchedUser(res.data);
                  else setEmailSearchError("User not found");
                } catch (err) {
                  console.error(err);
                  if (err.response?.status === 403) {
                    setEmailSearchError("Access Denied: Only Admins can search other users by email.");
                  } else {
                    setEmailSearchError("User not found or error occurred");
                  }
                } finally {
                  setEmailSearchLoading(false);
                }
              }}
              disabled={emailSearchLoading}
            >
              {emailSearchLoading ? "Searching..." : "Search"}
            </button>
          </div>

          {emailSearchError && (
            <div className="alert alert-danger" style={{ marginTop: "16px" }}>{emailSearchError}</div>
          )}

          {emailSearchedUser && (
            <div style={{ marginTop: "24px", padding: "16px", background: "var(--background)", borderRadius: "12px", border: "1px solid var(--border)" }}>
              <h4 style={{ marginBottom: "12px", fontWeight: "600" }}>Account Details</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="detail-label">Email</div>
                  <div className="detail-value">{emailSearchedUser.email}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Role</div>
                  <div className="detail-value">{emailSearchedUser.role}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Verified</div>
                  <div className="detail-value">{emailSearchedUser.emailVerified ? "✅ Yes" : "❌ No"}</div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Update Email Section */}
      <div style={{ marginTop: "24px" }}>
        <Card title="Account Settings: Update Email">
          <div className="form-group">
            <label className="form-label">New Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="Enter new email"
              value={updateEmailNewEmail}
              onChange={(e) => setUpdateEmailNewEmail(e.target.value)}
            />
          </div>
          <button
            className="btn btn-outline"
            onClick={async () => {
              if (!updateEmailNewEmail) {
                setUpdateEmailError("Please enter a new email");
                return;
              }
              setUpdateEmailLoading(true);
              setUpdateEmailError("");
              setUpdateEmailSuccess("");
              try {
                const response = await api.put("/auth/update-email", { newEmail: updateEmailNewEmail });
                setUpdateEmailSuccess(response.data?.message || "OTP sent successfully");
                setShowUpdateEmailModal(true);
              } catch (error) {
                console.error(error);
                setUpdateEmailError(error.response?.data?.message || "Failed to send OTP");
              } finally {
                setUpdateEmailLoading(false);
              }
            }}
            disabled={updateEmailLoading}
          >
            {updateEmailLoading ? "Sending OTP..." : "Request Email Change"}
          </button>

          {updateEmailSuccess && !showUpdateEmailModal && (
            <div className="alert alert-success" style={{ marginTop: "16px" }}>{updateEmailSuccess}</div>
          )}
          {updateEmailError && (
            <div className="alert alert-danger" style={{ marginTop: "16px" }}>{updateEmailError}</div>
          )}
        </Card>
      </div>

      {/* Modal Definitions */}
      <Modal
        isOpen={showUpdateEmailModal}
        onClose={() => setShowUpdateEmailModal(false)}
        title="Verify New Email"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setShowUpdateEmailModal(false)}>Cancel</button>
            <button
              className="btn btn-primary"
              onClick={async () => {
                const otpVal = document.getElementById("modal-update-email-otp").value;
                if (!otpVal) {
                  alert("Please enter OTP");
                  return;
                }
                setUpdateEmailLoading(true);
                try {
                  await api.post("/auth/verify-update-otp", { newEmail: updateEmailNewEmail, otp: Number(otpVal) });
                  alert("Email updated successfully! Please login again.");
                  window.location.href = "/";
                } catch (error) {
                  alert(error.response?.data?.message || "Invalid OTP");
                } finally {
                  setUpdateEmailLoading(false);
                }
              }}
              disabled={updateEmailLoading}
            >
              Verify & Update
            </button>
          </>
        }
      >
        <div className="alert alert-info" style={{ marginBottom: "16px" }}>
          OTP sent to: <strong>{updateEmailNewEmail}</strong>
        </div>
        <div className="form-group">
          <label className="form-label">Enter 6-digit OTP</label>
          <input
            type="text"
            className="form-input"
            placeholder="Enter OTP"
            id="modal-update-email-otp"
            maxLength={6}
          />
        </div>
      </Modal>

      <Modal
        isOpen={showAddModal}
        onClose={resetAddUserForm}
        title="Complete User Profile"
        footer={
          <>
            <button className="btn btn-outline" onClick={resetAddUserForm}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddUser} disabled={addUserLoading}>
              {addUserLoading ? "Saving..." : "Save Profile"}
            </button>
          </>
        }
      >
        {addUserError && <div className="alert alert-danger" style={{ marginBottom: "16px" }}>{addUserError}</div>}
        {addUserSuccess && <div className="alert alert-success" style={{ marginBottom: "16px" }}>{addUserSuccess}</div>}
        <form onSubmit={handleAddUser}>
          <div className="form-group"><label className="form-label">Full Name *</label><input type="text" className="form-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Age *</label><input type="number" className="form-input" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} required /></div>
            <div className="form-group"><label className="form-label">Gender *</label><select className="form-select" value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} required><option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option></select></div>
          </div>
          <div className="form-group"><label className="form-label">Contact No *</label><input type="tel" maxLength={10} className="form-input" value={formData.contactNo} onChange={(e) => setFormData({ ...formData, contactNo: e.target.value.replace(/[^0-9]/g, '') })} required /></div>
        </form>
      </Modal>

      <Modal
        isOpen={showUpdateProfileModal}
        onClose={resetUpdateProfileForm}
        title="Update Profile Securely"
        footer={
          <>
            <button className="btn btn-outline" onClick={resetUpdateProfileForm}>Cancel</button>
            {updateProfileStep === "form" ? (
              <button className="btn btn-warning" onClick={handleRequestProfileUpdate} disabled={updateProfileLoading}>Request Update</button>
            ) : (
              <button className="btn btn-primary" onClick={handleVerifyProfileUpdate} disabled={updateProfileLoading}>Verify OTP</button>
            )}
          </>
        }
      >
        {updateProfileError && <div className="alert alert-danger" style={{ marginBottom: "16px" }}>{updateProfileError}</div>}
        {updateProfileSuccess && <div className="alert alert-success" style={{ marginBottom: "16px" }}>{updateProfileSuccess}</div>}
        {updateProfileStep === "form" ? (
          <form onSubmit={handleRequestProfileUpdate}>
            <div className="form-group"><label className="form-label">Full Name *</label><input type="text" className="form-input" value={updateFormData.name} onChange={(e) => setUpdateFormData({ ...updateFormData, name: e.target.value })} required /></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Age *</label><input type="number" className="form-input" value={updateFormData.age} onChange={(e) => setUpdateFormData({ ...updateFormData, age: e.target.value })} required /></div>
              <div className="form-group"><label className="form-label">Gender *</label><select className="form-select" value={updateFormData.gender} onChange={(e) => setUpdateFormData({ ...updateFormData, gender: e.target.value })} required><option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option></select></div>
            </div>
            <div className="form-group"><label className="form-label">Contact No *</label><input type="tel" maxLength={10} className="form-input" value={updateFormData.contactNo} onChange={(e) => setUpdateFormData({ ...updateFormData, contactNo: e.target.value.replace(/[^0-9]/g, '') })} required /></div>
          </form>
        ) : (
          <div className="form-group"><label className="form-label">Enter 6-digit OTP sent to email</label><input type="text" maxLength={6} className="form-input" value={updateProfileOtp} onChange={(e) => setUpdateProfileOtp(e.target.value.replace(/[^0-9]/g, ''))} required /></div>
        )}
      </Modal>
    </div>
  );
}
