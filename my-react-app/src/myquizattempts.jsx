import React from "react";

export default function MyQuizAttempts() {
  return (
    <div className="quiz-container">
      <h2 className="db-section-title">My Quiz Attempts</h2>

      <div className="quiz-card">
        <div className="quiz-empty-state">
          <svg
            className="quiz-empty-icon"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M38 34C38 27 44 22 50 22C55 22 59 25 61 29C62 29 63 29 64 29C69 29 73 33 73 38C73 42 70 45 67 46"
              stroke="#e2e5ef"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            <rect x="42" y="32" width="28" height="34" rx="4" fill="#e2e5ef" />
            <rect x="48" y="40" width="16" height="2" rx="1" fill="#ffffff" />
            <rect x="48" y="46" width="16" height="2" rx="1" fill="#ffffff" />
            <rect x="48" y="52" width="10" height="2" rx="1" fill="#ffffff" />
            <circle cx="62" cy="58" r="10" fill="#ffffff" stroke="#c8cdd8" strokeWidth="2" />
            <path
              d="M55 65L48 74"
              stroke="#c8cdd8"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          
          <p className="quiz-empty-text">No Data Found.</p>
        </div>
      </div>
    </div>
  );
}