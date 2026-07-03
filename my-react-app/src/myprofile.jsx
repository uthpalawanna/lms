import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:5000/api/auth/me";

function EditProfileModal({ user, token, onClose, onSaved }) {
  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [username, setUsername] = useState(user.username || "");
  const [email, setEmail] = useState(user.email || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [skill, setSkill] = useState(user.skill || "");
  const [bio, setBio] = useState(user.bio || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError("First and last name can't be empty.");
      return;
    }
    if (!username.trim()) {
      setError("Username can't be empty.");
      return;
    }
    if (!email.trim()) {
      setError("Email can't be empty.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const response = await fetch(API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ firstName, lastName, username, email, phone, skill, bio }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Could not save your profile.");
        setSaving(false);
        return;
      }
      onSaved(data);
    } catch (err) {
      console.error(err);
      setError("Could not reach the server. Is the backend running?");
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Profile</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-field">
            <label>First Name</label>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>

          <div className="modal-field">
            <label>Last Name</label>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>

          <div className="modal-field">
            <label>Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>

          <div className="modal-field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="modal-field">
            <label>Phone Number</label>
            <input
              type="text"
              placeholder="Not provided"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="modal-field">
            <label>Skill / Occupation</label>
            <input
              type="text"
              placeholder="e.g. Web Developer"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
            />
          </div>

          <div className="modal-field">
            <label>Biography</label>
            <textarea
              placeholder="Tell us about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={5}
            />
          </div>

          {error && (
            <p style={{ color: "#dc2626", fontSize: 13, marginTop: "0.5rem" }}>{error}</p>
          )}
        </div>

        <div className="modal-footer">
          <button className="modal-cancel-btn" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="modal-publish-btn" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MyProfile({ token, onProfileUpdate }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Could not load your profile.");
        setLoading(false);
        return;
      }
      setUser(data);
      onProfileUpdate?.(data);
    } catch (err) {
      console.error(err);
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchProfile();
  }, [token]);

  const handleSaved = (updatedUser) => {
    setUser(updatedUser);
    setShowEditModal(false);
    onProfileUpdate?.(updatedUser);
  };

  if (loading) {
    return (
      <div className="profile-container">
        <p style={{ padding: "2rem" }}>Loading your profile...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="profile-container">
        <p style={{ padding: "2rem", color: "#dc2626" }}>{error || "Profile unavailable."}</p>
      </div>
    );
  }

  const fullName = `${user.firstName} ${user.lastName}`;
  const initial = (user.firstName || "?").charAt(0).toUpperCase();
  const registrationDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Unknown";

  const PROFILE_DATA = [
    { id: "fn", icon: "👤", label: "First Name", value: user.firstName },
    { id: "ln", icon: "👤", label: "Last Name", value: user.lastName },
    { id: "user", icon: "🆔", label: "Username", value: user.username },
    { id: "reg", icon: "📅", label: "Registration Date", value: registrationDate },
    { id: "email", icon: "✉️", label: "Email", value: user.email },
    { id: "phone", icon: "📞", label: "Phone Number", value: user.phone || "Not provided" },
    { id: "skill", icon: "💼", label: "Skill/Occupation", value: user.skill || "Not provided" },
    { id: "bio", icon: "📝", label: "Biography", value: user.bio || "No biography added yet." },
  ];

  return (
    <div className="profile-container">

      <div className="profile-header-card">
        <div className="profile-cover-banner"></div>
        <div className="profile-header-content">
          <div className="profile-avatar-large">{initial}</div>
          <div className="profile-header-info">
            <h3 className="profile-name-title">{fullName}</h3>
            <p className="profile-handle">@{user.username}</p>
          </div>
          <button className="profile-edit-btn" onClick={() => setShowEditModal(true)}>
            Edit Profile
          </button>
        </div>
      </div>

      <div className="profile-details-card">
        <h4 className="profile-section-title">Personal Information</h4>
        <div className="profile-info-grid">
          {PROFILE_DATA.map((item) => (
            <div key={item.id} className="profile-info-box">
              <div className="profile-info-icon">{item.icon}</div>
              <div className="profile-info-text">
                <span className="profile-info-label">{item.label}</span>
                <span className="profile-info-value">{item.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showEditModal && (
        <EditProfileModal
          user={user}
          token={token}
          onClose={() => setShowEditModal(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}