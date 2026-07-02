import React, { useState } from "react";

export default function CourseDetails({ onBack, onAuthorClick }) {
  const [activeTab, setActiveTab] = useState("info");

  return (
    <div className="cd-container">
      <div className="cd-header">
        <div className="cd-header-left">
          <div className="cd-stars">
            <span className="db-star">☆</span>
            <span className="db-star">☆</span>
            <span className="db-star">☆</span>
            <span className="db-star">☆</span>
            <span className="db-star">☆</span>
          </div>
          <h1 className="cd-title">New Course</h1>
          <p className="cd-category">Uncategorized</p>
        </div>

        <div className="cd-header-right">
          <button className="cd-action-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
            Wishlist
          </button>
          <button className="cd-action-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
            Share
          </button>
        </div>
      </div>

      <div className="cd-layout">
        <div className="cd-main-content">
          <div className="cd-hero-image">
            <svg width="100%" height="100%" viewBox="0 0 800 400" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="800" height="400" fill="#eef0f8"/>
              <circle cx="200" cy="120" r="40" fill="#dce1f0"/>
              <path d="M300 400 L500 160 L700 400 Z" fill="#e2e5ef"/>
              <path d="M500 400 L640 240 L800 400 Z" fill="#dce1f0"/>
            </svg>
          </div>

          <div className="cd-tabs-bar">
            {[
              { id: "info", label: "Course Info" },
              { id: "reviews", label: "Reviews" },
              { id: "announcements", label: "Announcements" }
            ].map(tab => (
              <button
                key={tab.id}
                className={`cd-tab-btn ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="cd-tab-content-area">
            {activeTab === "reviews" && (
              <div className="cd-reviews-section">
                <h3 className="cd-section-heading">Student Ratings & Reviews</h3>
                <div className="ec-empty-state" style={{ marginTop: "3rem" }}>
                  <svg className="ec-empty-icon" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M40 80C35 80 25 70 25 50C25 30 35 20 40 20L80 20C85 20 95 30 95 50C95 70 85 80 80 80L40 80Z" fill="#E2E5EF"/>
                    <path d="M40 80C35 80 25 70 25 50C25 30 35 20 40 20L45 20C40 20 30 30 30 50C30 70 40 80 45 80L40 80Z" fill="#C8CDD8"/>
                    <rect x="75" y="10" width="10" height="20" rx="2" fill="#4A60C8" transform="rotate(30 75 10)"/>
                    <circle cx="10" cy="40" r="2" fill="#C8CDD8"/>
                    <circle cx="20" cy="25" r="1.5" fill="#C8CDD8"/>
                    <circle cx="105" cy="60" r="2.5" fill="#C8CDD8"/>
                  </svg>
                  <p className="ec-empty-text">No Review Yet</p>
                </div>
              </div>
            )}

            {activeTab === "announcements" && (
              <div className="cd-reviews-section">
                <div className="ec-empty-state" style={{ marginTop: "3rem" }}>
                  <svg className="ec-empty-icon" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M40 80C35 80 25 70 25 50C25 30 35 20 40 20L80 20C85 20 95 30 95 50C95 70 85 80 80 80L40 80Z" fill="#E2E5EF"/>
                    <path d="M40 80C35 80 25 70 25 50C25 30 35 20 40 20L45 20C40 20 30 30 30 50C30 70 40 80 45 80L40 80Z" fill="#C8CDD8"/>
                    <rect x="75" y="10" width="10" height="20" rx="2" fill="#4A60C8" transform="rotate(30 75 10)"/>
                    <circle cx="10" cy="40" r="2" fill="#C8CDD8"/>
                    <circle cx="20" cy="25" r="1.5" fill="#C8CDD8"/>
                    <circle cx="105" cy="60" r="2.5" fill="#C8CDD8"/>
                  </svg>
                  <p className="ec-empty-text">No Review Yet</p>
                </div>
              </div>
            )}
            


            {activeTab === "info" && (
              <div className="cd-info-section">
                <h3 className="cd-section-heading">Course Description</h3>
                <p>Welcome to this course! Add your course description content here.</p>
              </div>
            )}
          </div>
        </div>

        <div className="cd-sidebar">
          <div className="cd-card">
            <h3 className="cd-card-title">Course Progress</h3>
            <div className="cd-progress-stats">
              <span>0/0</span>
              <span>0% Complete</span>
            </div>
            <div className="cd-progress-track">
              <div className="cd-progress-fill" style={{ width: "0%" }}></div>
            </div>
            <button className="cd-complete-btn">Complete Course</button>
            <div className="cd-meta-list">
              <div className="cd-meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
                0 Total Enrolled
              </div>
              <div className="cd-meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-10.43l5.25 5.25"></path></svg>
                June 26, 2026 Last Updated
              </div>
            </div>
          </div>

          <div className="cd-card">
            <h3 className="cd-card-title" style={{ fontSize: "14px", marginBottom: "1rem" }}>A course by</h3>
            <div className="cd-instructor">
              <div className="cd-avatar">D</div>
              <span className="cd-author-name" onClick={onAuthorClick} style={{ cursor: "pointer" }}>
                DINESHAN
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}