import React, { useState, useEffect } from "react";

const COURSES_URL = "http://localhost:5000/api/courses/mine";
const ATTEMPTS_URL = "http://localhost:5000/api/quiz-attempts/course";

function CourseSelect({ value, onChange, courses }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: "10px 14px",
        fontSize: 14,
        border: "1px solid #d0d5dd",
        borderRadius: 8,
        color: "#333",
        fontFamily: "inherit",
        background: "#fff",
        minWidth: 220,
      }}
    >
      <option value="">Select a course</option>
      {courses.map((c) => (
        <option key={c._id} value={c._id}>{c.title}</option>
      ))}
    </select>
  );
}

export default function QuizAttempts({ token }) {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    async function fetchCourses() {
      try {
        const response = await fetch(COURSES_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) setCourses(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchCourses();
  }, [token]);

  useEffect(() => {
    if (!selectedCourse || !token) {
      setAttempts([]);
      return;
    }

    async function fetchAttempts() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${ATTEMPTS_URL}/${selectedCourse}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) {
          setError(data.message || "Could not load attempts.");
          setLoading(false);
          return;
        }
        setAttempts(data);
      } catch (err) {
        console.error(err);
        setError("Could not reach the server. Is the backend running?");
      } finally {
        setLoading(false);
      }
    }

    fetchAttempts();
  }, [selectedCourse, token]);

  return (
    <div className="ec-container">
      <h2 className="db-section-title">Quiz Attempts</h2>

      <div className="announcement-filters">
        <div className="filter-group">
          <label>Course</label>
          <CourseSelect value={selectedCourse} onChange={setSelectedCourse} courses={courses} />
        </div>
      </div>

      <div className="ec-tab-content">
        {!selectedCourse ? (
          <div className="ec-empty-state">
            <p className="ec-empty-text">Select a course to view quiz attempts.</p>
          </div>
        ) : loading ? (
          <div className="ec-empty-state">
            <p className="ec-empty-text">Loading...</p>
          </div>
        ) : error ? (
          <div className="ec-empty-state">
            <p className="ec-empty-text" style={{ color: "#dc2626" }}>{error}</p>
          </div>
        ) : attempts.length === 0 ? (
          <div className="ec-empty-state">
            <p className="ec-empty-text" style={{ color: "#16a34a", fontWeight: 700 }}>No Data Found.</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 12, overflow: "hidden" }}>
            <thead>
              <tr style={{ background: "#f5f6fb", textAlign: "left" }}>
                <th style={thStyle}>Student</th>
                <th style={thStyle}>Quiz</th>
                <th style={thStyle}>Score</th>
                <th style={thStyle}>Date</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((a) => (
                <tr key={a._id} style={{ borderTop: "1px solid #eef0f8" }}>
                  <td style={tdStyle}>
                    {a.student ? `${a.student.firstName} ${a.student.lastName}` : "—"}
                  </td>
                  <td style={tdStyle}>{a.quiz?.title || "—"}</td>
                  <td style={tdStyle}>{a.score} / {a.totalQuestions}</td>
                  <td style={tdStyle}>{new Date(a.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const thStyle = { padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "#374151" };
const tdStyle = { padding: "12px 16px", fontSize: 14, color: "#111827" };