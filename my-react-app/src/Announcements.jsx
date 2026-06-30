import React, { useState, useRef, useEffect } from "react";

const COURSES = [];

function CourseSelect({ value, onChange, showAllOption = true }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = COURSES.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase())
  );

  let selectedLabel;
  if (showAllOption && value === "all") {
    selectedLabel = "All";
  } else {
    const found = COURSES.find((c) => c.id === value)?.title;
    selectedLabel = found || (COURSES.length === 0 ? "No course found" : "Select a course");
  }

  const handleSelect = (id) => {
    onChange(id);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="course-select" ref={wrapRef}>
      <button
        type="button"
        className="course-select-trigger"
        onClick={() => setOpen((o) => !o)}
      >
        <span>{selectedLabel}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {open && (
        <div className="course-select-panel">
          <div className="course-select-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search ..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>

          <div className="course-select-list">
            {showAllOption && (
              <div
                className={`course-select-item${value === "all" ? " active" : ""}`}
                onClick={() => handleSelect("all")}
              >
                All
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="course-select-empty">No course found</div>
            ) : (
              filtered.map((c) => (
                <div
                  key={c.id}
                  className={`course-select-item${value === c.id ? " active" : ""}`}
                  onClick={() => handleSelect(c.id)}
                >
                  {c.title}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SimpleSelect({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find((o) => o.value === value)?.label || "";

  const handleSelect = (val) => {
    onChange(val);
    setOpen(false);
  };

  return (
    <div className="simple-select" ref={wrapRef}>
      <button
        type="button"
        className="course-select-trigger"
        onClick={() => setOpen((o) => !o)}
      >
        <span>{selectedLabel}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {open && (
        <div className="course-select-panel">
          <div className="course-select-list">
            {options.map((o) => (
              <div
                key={o.value}
                className={`course-select-item${value === o.value ? " active" : ""}`}
                onClick={() => handleSelect(o.value)}
              >
                {o.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CreateAnnouncementModal({ onClose }) {
  const [modalCourse, setModalCourse] = useState("none");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");

  const handlePublish = () => {
    console.log({ course: modalCourse, title, summary });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create Announcement</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-field">
            <label>Select Course</label>
            <CourseSelect value={modalCourse} onChange={setModalCourse} showAllOption={false} />
          </div>

          <div className="modal-field">
            <label>Announcement Title</label>
            <input
              type="text"
              placeholder="Announcement title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="modal-field">
            <label>Summary</label>
            <textarea
              placeholder="Summary..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={6}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-cancel-btn" onClick={onClose}>Cancel</button>
          <button className="modal-publish-btn" onClick={handlePublish}>Publish</button>
        </div>
      </div>
    </div>
  );
}

export default function Announcements() {
  const [showModal, setShowModal] = useState(false);
  const [course, setCourse] = useState("all");
  const [sortBy, setSortBy] = useState("desc");
  const [date, setDate] = useState("");

  return (
    <div className="ec-container">
      <h2 className="db-section-title">Announcements</h2>

      <div className="announcement-header-box">
        <div className="announcement-info">
          <div className="announcement-icon-circle">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4a60c8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 11l18-5v12L3 14v-3z"></path>
              <path d="M11.6 16.8a3 3 0 1 1-5.2 3"></path>
            </svg>
          </div>
          <div>
            <h3 className="announcement-info-title">Create Announcement</h3>
            <p className="announcement-info-subtitle">Notify all students of your course</p>
          </div>
        </div>
        <button className="db-new-course-btn" onClick={() => setShowModal(true)}>
          Add New Announcement
        </button>
      </div>

      <div className="announcement-filters">
        <div className="filter-group">
          <label>Courses</label>
          <CourseSelect value={course} onChange={setCourse} />
        </div>
        <div className="filter-group">
          <label>Sort By</label>
          <SimpleSelect
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: "asc", label: "ASC" },
              { value: "desc", label: "DESC" },
            ]}
          />
        </div>
        <div className="filter-group">
          <label>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      <div className="ec-tab-content">
        <div className="ec-empty-state">
          <svg className="ec-empty-icon" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M40 80C35 80 25 70 25 50C25 30 35 20 40 20L80 20C85 20 95 30 95 50C95 70 85 80 80 80L40 80Z" fill="#E2E5EF"/>
            <path d="M40 80C35 80 25 70 25 50C25 30 35 20 40 20L45 20C40 20 30 30 30 50C30 70 40 80 45 80L40 80Z" fill="#C8CDD8"/>
            <rect x="75" y="10" width="10" height="20" rx="2" fill="#4A60C8" transform="rotate(30 75 10)"/>
            <circle cx="10" cy="40" r="2" fill="#C8CDD8"/>
            <circle cx="20" cy="25" r="1.5" fill="#C8CDD8"/>
            <circle cx="105" cy="60" r="2.5" fill="#C8CDD8"/>
          </svg>
          <p className="ec-empty-text" style={{ color: "#16a34a", fontWeight: 700 }}>No Data Found.</p>
        </div>
      </div>

      {showModal && <CreateAnnouncementModal onClose={() => setShowModal(false)} />}
    </div>
  );
}