import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:5000/api/auth/me";

export default function MyProfile({ token }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
  const handle = user.displayName || user.username;
  const registrationDate = user.updatedAt
    ? new Date(user.updatedAt).toLocaleDateString(undefined, {
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
          <div className="profile-avatar-large">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl.startsWith("/uploads") ? `http://localhost:5000${user.avatarUrl}` : user.avatarUrl}
                alt={fullName}
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
              />
            ) : (
              initial
            )}
          </div>
          <div className="profile-header-info">
            <h3 className="profile-name-title">{fullName}</h3>
            <p className="profile-handle">@{handle}</p>
          </div>
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

    </div>
  );
}