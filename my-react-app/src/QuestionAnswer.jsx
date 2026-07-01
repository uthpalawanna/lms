import React, { useState } from "react";
import "./Dashboard.css"; 

const SORT_OPTIONS = [
  "All(0)",
  "Read(0)",
  "Unread(0)",
  "Important(0)",
  "Archived(0)"
];

export default function QuestionAnswer() {
  const [isInstructor, setIsInstructor] = useState(false);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState(SORT_OPTIONS[0]);

  return (
    <div className="qa-container">
      
      <div className="qa-header">
        <h2 className="db-section-title" style={{ marginBottom: 0 }}>
          Question & Answer
        </h2>
        
        <div className="qa-toggle-wrapper">
          <span className={`qa-toggle-label ${!isInstructor ? 'active-blue' : ''}`}>
            Student
          </span>
          <label className="qa-switch">
            <input 
              type="checkbox" 
              checked={isInstructor} 
              onChange={() => setIsInstructor(!isInstructor)} 
            />
            <span className="qa-slider"></span>
          </label>
          <span className={`qa-toggle-label ${isInstructor ? 'active' : ''}`}>
            Instructor
          </span>
        </div>
      </div>

      <div className="qa-toolbar">
        <span className="qa-sort-label">Sort By:</span>
        
        <div className="qa-dropdown-container">
          <button 
            className="qa-dropdown-trigger"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {selectedSort}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          {isDropdownOpen && (
            <div className="qa-dropdown-menu">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option}
                  className={`qa-dropdown-item ${selectedSort === option ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedSort(option);
                    setIsDropdownOpen(false);
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="quiz-card">
        <div className="quiz-empty-state">
          <svg
            className="quiz-empty-icon"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M38 34C38 27 44 22 50 22C55 22 59 25 61 29C62 29 63 29 64 29C69 29 73 33 73 38C73 42 70 45 67 46" stroke="#e2e5ef" strokeWidth="2" strokeLinecap="round" fill="none"/>
            <rect x="42" y="32" width="28" height="34" rx="4" fill="#e2e5ef" />
            <rect x="48" y="40" width="16" height="2" rx="1" fill="#ffffff" />
            <rect x="48" y="46" width="16" height="2" rx="1" fill="#ffffff" />
            <rect x="48" y="52" width="10" height="2" rx="1" fill="#ffffff" />
            <circle cx="62" cy="58" r="10" fill="#ffffff" stroke="#c8cdd8" strokeWidth="2" />
            <path d="M55 65L48 74" stroke="#c8cdd8" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <p className="quiz-empty-text">No Data Found.</p>
        </div>
      </div>
      
    </div>
  );
}