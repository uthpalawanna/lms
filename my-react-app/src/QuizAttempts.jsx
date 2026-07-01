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
      <button type="button" className="course-select-trigger" onClick={() => setOpen((o) => !o)}>
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
      <button type="button" className="course-select-trigger" onClick={() => setOpen((o) => !o)}>
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

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function DateField({ value, onChange, placeholder = "Y-M-d" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const wrapRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  let firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  const handlePrevMonth = () => setViewDate(new Date(currentYear, currentMonth - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(currentYear, currentMonth + 1, 1));

  const selectedDate = value ? new Date(value) : null;

  const handleDateClick = (day) => {
    const picked = new Date(currentYear, currentMonth, day);
    const formatted = `${picked.getFullYear()}-${String(picked.getMonth() + 1).padStart(2, "0")}-${String(picked.getDate()).padStart(2, "0")}`;
    onChange(formatted);
    setIsOpen(false);
  };

  return (
    <div className="date-field-wrap" ref={wrapRef}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        readOnly
        onClick={() => setIsOpen((o) => !o)}
        className="date-field-input"
      />
      <span className="date-field-icon" onClick={() => setIsOpen((o) => !o)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a0aabf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      </span>

      {isOpen && (
        <div className="oh-calendar-popup date-field-popup">
          <div className="oh-cal-header">
            <div className="oh-cal-selectors">
              <span className="oh-cal-select">{MONTHS[currentMonth]} <small>▾</small></span>
              <span className="oh-cal-select">{currentYear} <small>▾</small></span>
            </div>
            <div className="oh-cal-arrows">
              <span onClick={handlePrevMonth}>﹀</span>
              <span onClick={handleNextMonth} style={{ transform: "rotate(180deg)", display: "inline-block" }}>﹀</span>
            </div>
          </div>

          <div className="oh-cal-grid">
            <div className="oh-cal-weekdays">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
            <div className="oh-cal-days">
              {[...Array(firstDayIndex)].map((_, i) => (
                <span key={`empty-${i}`} className="oh-cal-day faded"></span>
              ))}
              {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1;
                const isSelected =
                  selectedDate?.getDate() === day &&
                  selectedDate?.getMonth() === currentMonth &&
                  selectedDate?.getFullYear() === currentYear;
                return (
                  <span
                    key={day}
                    className={`oh-cal-day ${isSelected ? "active" : ""}`}
                    onClick={() => handleDateClick(day)}
                  >
                    {day}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CloudSearchEmptyIcon() {
  return (
    <svg width="90" height="90" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M30 62C22 62 16 56 16 48C16 40.5 21.5 34.5 28.5 33.5C30 25 37 19 45.5 19C53 19 59.5 24 62 31C63 30.8 64 30.5 65 30.5C72.5 30.5 78.5 36.5 78.5 44C78.5 50 75 54.5 70 56.5"
        stroke="#dfe3ee"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="#eef0f8"
      />
      <rect x="38" y="42" width="26" height="32" rx="3" fill="#e2e5ef" />
      <rect x="43" y="49" width="16" height="2" rx="1" fill="#ffffff" />
      <rect x="43" y="55" width="16" height="2" rx="1" fill="#ffffff" />
      <rect x="43" y="61" width="10" height="2" rx="1" fill="#ffffff" />
      <circle cx="60" cy="66" r="11" fill="#ffffff" stroke="#c8cdd8" strokeWidth="2.5" />
      <path d="M52 74L44 84" stroke="#c8cdd8" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}


export default function QuizAttempts() {
  const [course, setCourse] = useState("all");
  const [sortBy, setSortBy] = useState("desc");
  const [date, setDate] = useState("");

  return (
    <div className="ec-container">
      <h2 className="db-section-title">Quiz Attempts</h2>

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
          <label>Create Date</label>
          <DateField value={date} onChange={setDate} />
        </div>
      </div>

      <div className="ec-tab-content">
        <div className="ec-empty-state">
          <CloudSearchEmptyIcon />
          <p className="ec-empty-text" style={{ color: "#16a34a", fontWeight: 700 }}>No Data Found.</p>
        </div>
      </div>
    </div>
  );
}