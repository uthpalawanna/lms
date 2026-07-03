import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:5000/api/courses";

const TABS = [
  { id: "publish", label: "Publish" },
  { id: "pending", label: "Pending" },
  { id: "draft", label: "Draft" },
  { id: "schedule", label: "Schedule" },
];

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }) + " " + d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function NewCourseModal({ token, onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreate = async (status) => {
    if (!title.trim()) {
      setError("Please enter a course title.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          category: category || "Uncategorized",
          price: price ? Number(price) : 0,
          description,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Could not create the course.");
        setSaving(false);
        return;
      }

      onCreated(data);
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
          <h3>New Course</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-field">
            <label>Course Title</label>
            <input
              type="text"
              placeholder="e.g. Introduction to React"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="modal-field">
            <label>Category</label>
            <input
              type="text"
              placeholder="e.g. Web Development"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div className="modal-field">
            <label>Price (leave blank for Free)</label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div className="modal-field">
            <label>Description</label>
            <textarea
              placeholder="What will students learn?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
            />
          </div>

          {error && (
            <p style={{ color: "#dc2626", fontSize: 13, marginTop: "0.5rem" }}>{error}</p>
          )}
        </div>

        <div className="modal-footer">
          <button className="modal-cancel-btn" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button
            className="modal-cancel-btn"
            onClick={() => handleCreate("draft")}
            disabled={saving}
          >
            Save as Draft
          </button>
          <button className="modal-publish-btn" onClick={() => handleCreate("publish")} disabled={saving}>
            {saving ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MyCourses({
  token,
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
  const showNewCourseModal = showModalProp !== undefined ? showModalProp : localShowModal;
  const setShowNewCourseModal = setShowModalProp || setLocalShowModal;

  const fetchCourses = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Could not load your courses.");
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
    if (token) fetchCourses();
  }, [token]);

  const handleDelete = async (id) => {
    setOpenMenuId(null);
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const data = await response.json();
        alert(data.message || "Could not delete the course.");
        return;
      }
      setCourses((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error(err);
      alert("Could not reach the server. Is the backend running?");
    }
  };

  const handleCourseCreated = (newCourse) => {
    setCourses((prev) => [newCourse, ...prev]);
    setShowNewCourseModal(false);
    setActiveTab(newCourse.status);
  };

  const visibleCourses = courses.filter((c) => c.status === activeTab);
  const countFor = (statusId) => courses.filter((c) => c.status === statusId).length;

  return (
    <div className="ec-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
        <h2 className="db-section-title">My Courses</h2>
        <button className="db-new-course-btn" onClick={() => setShowNewCourseModal(true)}>
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
            <p className="ec-empty-text">Loading your courses...</p>
          </div>
        ) : error ? (
          <div className="ec-empty-state">
            <p className="ec-empty-text" style={{ color: "#dc2626" }}>{error}</p>
          </div>
        ) : visibleCourses.length === 0 ? (
          <div className="ec-empty-state">
            <p className="ec-empty-text">No Data Available in this Section</p>
          </div>
        ) : (
          <div className="course-grid">
            {visibleCourses.map((course) => (
              <div key={course._id} className="course-card">

                <div className="course-img-placeholder">
                  <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="400" height="200" fill="#f0f2f8"/>
                    <circle cx="100" cy="60" r="20" fill="#dce1f0"/>
                    <path d="M150 200 L250 80 L350 200 Z" fill="#e2e5ef"/>
                    <path d="M250 200 L320 120 L400 200 Z" fill="#dce1f0"/>
                  </svg>
                </div>

                <div className="course-content">
                  <p className="course-date">{formatDate(course.createdAt)}</p>
                  <h3 className="course-title" onClick={() => onCourseClick?.(course)} style={{ cursor: "pointer" }}>
                    {course.title}
                  </h3>
                </div>

                <div className="course-footer">
                  <span className="course-price">
                    {course.price > 0 ? `Rs${course.price}` : "Free"}
                  </span>

                  <div className="course-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>

                    <button className="course-menu-btn" onClick={() => console.log("Edit course:", course._id)}>
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

      {showNewCourseModal && (
        <NewCourseModal
          token={token}
          onClose={() => setShowNewCourseModal(false)}
          onCreated={handleCourseCreated}
        />
      )}
    </div>
  );
}