import React, { useState, useEffect } from "react";
import CourseBuilderModal from "./CourseBuilderModal";

const API_URL = "http://localhost:5000/api/courses";

const TABS = [
  { id: "publish", label: "Publish" },
  { id: "pending", label: "Pending" },
  { id: "draft", label: "Draft" },
  { id: "schedule", label: "Schedule" },
];

function formatDate(dateString) {
  const d = new Date(dateString);
  return d.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatPrice(price) {
  return price === 0 || price === undefined ? "Free" : `Rs${price}`;
}

export default function MyCourses({
  token,
  user,
  refreshKey,
  onCourseClick,
  showModal: showModalProp,
  setShowModal: setShowModalProp,
}) {
  const [activeTab, setActiveTab] = useState("draft");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [localShowModal, setLocalShowModal] = useState(false);
  const showBuilder = showModalProp !== undefined ? showModalProp : localShowModal;
  const setShowBuilder = setShowModalProp || setLocalShowModal;

  const fetchCourses = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Could not load courses.");
        setLoading(false);
        return;
      }
      setCourses(data);
    } catch (err) {
      console.error(err);
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [token, refreshKey]);

  const handleDelete = async (id) => {
    setOpenMenuId(null);
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setCourses((prev) => prev.filter((course) => course._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCourseSaved = (newCourse) => {
    setCourses((prev) => [newCourse, ...prev]);
    setShowBuilder(false);
    setActiveTab(newCourse.status);
  };

  const coursesForTab = courses.filter((c) => c.status === activeTab);
  const countFor = (status) => courses.filter((c) => c.status === status).length;

  return (
    <div className="ec-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
        <h2 className="db-section-title">My Courses</h2>
        <button className="db-new-course-btn" onClick={() => setShowBuilder(true)}>
          ＋ Add New Course
        </button>
      </div>

      <div className="ec-tabs-header">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`ec-tab-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label} ({countFor(tab.id)})
          </button>
        ))}
      </div>

      <div className="ec-tab-content">
        {loading ? (
          <div className="ec-empty-state">
            <p className="ec-empty-text">Loading...</p>
          </div>
        ) : error ? (
          <div className="ec-empty-state">
            <p className="ec-empty-text" style={{ color: "#dc2626" }}>{error}</p>
          </div>
        ) : coursesForTab.length === 0 ? (
          <div className="ec-empty-state">
            <p className="ec-empty-text">No Data Available in this Section</p>
          </div>
        ) : (
          <div className="course-grid">
            {coursesForTab.map((course) => (
              <div key={course._id} className="course-card">

                <div className="course-img-placeholder">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail.startsWith("/uploads") ? `http://localhost:5000${course.thumbnail}` : course.thumbnail}
                      alt={course.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="400" height="200" fill="#f0f2f8"/>
                      <circle cx="100" cy="60" r="20" fill="#dce1f0"/>
                      <path d="M150 200 L250 80 L350 200 Z" fill="#e2e5ef"/>
                      <path d="M250 200 L320 120 L400 200 Z" fill="#dce1f0"/>
                    </svg>
                  )}
                </div>

                <div className="course-content">
                  <p className="course-date">{formatDate(course.createdAt)}</p>
                  <h3 className="course-title" onClick={() => onCourseClick?.(course)} style={{ cursor: "pointer" }}>
                    {course.title}
                  </h3>
                  {course.category && (
                    <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>{course.category}</p>
                  )}
                </div>

                <div className="course-footer">
                  <span className="course-price">{formatPrice(course.price)}</span>

                  <div className="course-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>

                    <button className="course-menu-btn" onClick={() => onCourseClick?.(course)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5c6b8a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>

                    <div className="course-menu-wrapper">
                      <button
                        className="course-menu-btn"
                        onClick={() => setOpenMenuId(openMenuId === course._id ? null : course._id)}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5c6b8a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="1"></circle>
                          <circle cx="12" cy="5" r="1"></circle>
                          <circle cx="12" cy="19" r="1"></circle>
                        </svg>
                      </button>

                      {openMenuId === course._id && (
                        <div className="course-menu-popup">
                          <button className="delete-btn" onClick={() => handleDelete(course._id)}>
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
        )}
      </div>

      {showBuilder && (
        <CourseBuilderModal
          token={token}
          user={user}
          onClose={() => setShowBuilder(false)}
          onSaved={handleCourseSaved}
        />
      )}
    </div>
  );
}