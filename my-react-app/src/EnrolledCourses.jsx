import React, { useState } from "react";

const TABS = [
  { id: "enrolled", label: "Enrolled Courses" },
  { id: "active", label: "Active Courses" },
  { id: "completed", label: "Completed Courses" },
];

export default function EnrolledCourses() {
  const [activeTab, setActiveTab] = useState("enrolled");

  const activeTabLabel = TABS.find((tab) => tab.id === activeTab)?.label;

  return (
    <div className="ec-container">
      <h2 className="db-section-title">{activeTabLabel}</h2>

      <div className="ec-tabs-header">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`ec-tab-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="ec-tab-content">
        <div className="ec-empty-state">
          <svg
            className="ec-empty-icon"
            viewBox="0 0 120 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M40 80C35 80 25 70 25 50C25 30 35 20 40 20L80 20C85 20 95 30 95 50C95 70 85 80 80 80L40 80Z" fill="#E2E5EF"/>
            <path d="M40 80C35 80 25 70 25 50C25 30 35 20 40 20L45 20C40 20 30 30 30 50C30 70 40 80 45 80L40 80Z" fill="#C8CDD8"/>
            <rect x="75" y="10" width="10" height="20" rx="2" fill="#4A60C8" transform="rotate(30 75 10)"/>
            <circle cx="10" cy="40" r="2" fill="#C8CDD8"/>
            <circle cx="20" cy="25" r="1.5" fill="#C8CDD8"/>
            <circle cx="105" cy="60" r="2.5" fill="#C8CDD8"/>
          </svg>
          <p className="ec-empty-text">No Data Available in this Section</p>
        </div>
      </div>
    </div>
  );
}