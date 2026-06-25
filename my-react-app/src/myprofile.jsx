import React from "react";

const PROFILE_DATA = [
  { id: "fn", icon: "👤", label: "First Name", value: "Kapila" },
  { id: "ln", icon: "👤", label: "Last Name", value: "Perera" },
  { id: "user", icon: "🆔", label: "Username", value: "DINESHAN" },
  { id: "reg", icon: "📅", label: "Registration Date", value: "January 26, 2026" },
  { id: "email", icon: "✉️", label: "Email", value: "dineshanrana2000@yahoo.com" },
  { id: "phone", icon: "📞", label: "Phone Number", value: "Not provided" },
  { id: "skill", icon: "💼", label: "Skill/Occupation", value: "Not provided" },
  { id: "bio", icon: "📝", label: "Biography", value: "No biography added yet." },
];

export default function MyProfile() {
  return (
    <div className="profile-container">
      
      <div className="profile-header-card">
        <div className="profile-cover-banner"></div>
        <div className="profile-header-content">
          <div className="profile-avatar-large">D</div>
          <div className="profile-header-info">
            <h3 className="profile-name-title">Kapila Perera</h3>
            <p className="profile-handle">@DINESHAN</p>
          </div>
          <button className="profile-edit-btn">Edit Profile</button>
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