import React, { useState } from "react";

const TABS = [
  { id: "publish", label: "Publish (0)" },
  { id: "pending", label: "Pending (0)" },
  { id: "draft", label: "Draft (3)" },
  { id: "schedule", label: "Schedule (0)" },
];

const INITIAL_COURSES = [
  { id: 1, date: "June 25, 2026 9:51 am", title: "New Course", price: "Free" },
  { id: 2, date: "June 25, 2026 7:21 am", title: "New Course", price: "Free" },
  { id: 3, date: "June 1, 2026 2:35 pm", title: "New Course", price: "Free" },
];

export default function MyCourses({ onCourseClick }) {
  const [activeTab, setActiveTab] = useState("draft");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [courses, setCourses] = useState(INITIAL_COURSES);

  const handleDelete = (id) => {
    setCourses(courses.filter((course) => course.id !== id));
    setOpenMenuId(null);
  };

  return (
    <div className="ec-container">
      <h2 className="db-section-title">My Courses</h2>

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
        {activeTab === "draft" ? (
          <div className="course-grid">
            {courses.map((course) => (
              <div key={course.id} className="course-card">
                
                <div className="course-img-placeholder">
                  <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="400" height="200" fill="#f0f2f8"/>
                    <circle cx="100" cy="60" r="20" fill="#dce1f0"/>
                    <path d="M150 200 L250 80 L350 200 Z" fill="#e2e5ef"/>
                    <path d="M250 200 L320 120 L400 200 Z" fill="#dce1f0"/>
                  </svg>
                </div>

                <div className="course-content">
                  <p className="course-date">{course.date}</p>
                  <h3 className="course-title" onClick={onCourseClick} style={{ cursor: "pointer" }}>
                    {course.title}
                  </h3>
                </div>

                <div className="course-footer">
                  <span className="course-price">{course.price}</span>
                  
                  <div className="course-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    
                    <button className="course-menu-btn" onClick={() => console.log("Edit course:", course.id)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5c6b8a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>

                    <div className="course-menu-wrapper">
                      <button 
                        className="course-menu-btn" 
                        onClick={() => setOpenMenuId(openMenuId === course.id ? null : course.id)}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5c6b8a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="1"></circle>
                          <circle cx="12" cy="5" r="1"></circle>
                          <circle cx="12" cy="19" r="1"></circle>
                        </svg>
                      </button>

                      {openMenuId === course.id && (
                        <div className="course-menu-popup">
                          <button className="delete-btn" onClick={() => handleDelete(course.id)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="ec-empty-state">
            <p className="ec-empty-text">No Data Available in this Section</p>
          </div>
        )}
      </div>
    </div>
  );
}