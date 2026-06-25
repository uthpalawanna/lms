import React from "react";

const PROFILE_DATA = [
  { label: "Registration Date", value: "January 26, 2026 2:13 am" },
  { label: "First Name", value: "Kapila" },
  { label: "Last Name", value: "Perera" },
  { label: "Username", value: "DINESHAN" },
  { label: "Email", value: "dineshanrana2000@yahoo.com" },
  { label: "Phone Number", value: "-" },
  { label: "Skill/Occupation", value: "-" },
  { label: "Biography", value: "-" },
];

export default function MyProfile() {
  return (
    <div className="db-profile-content">
      <h3 className="db-profile-subtitle">My Profile</h3>
      
      <div className="db-profile-list">
        {PROFILE_DATA.map((item, index) => (
          <div key={index} className="db-profile-row">
            <div className="db-profile-label">{item.label}</div>
            <div className="db-profile-value">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}