import React from "react";

export default function Announcements() {
  return (
    <div className="ec-container">
      <h2 className="db-section-title">Announcements</h2>

      <div className="empty-box">
        <svg 
          width="60" 
          height="60" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="#C8CDD8" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        <p className="empty-text">No Announcements Available</p>
      </div>
    </div>
  );
}