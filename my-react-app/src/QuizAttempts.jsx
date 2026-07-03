import React, { useState, useEffect } from "react";

const COURSES_URL = "http://localhost:5000/api/courses/mine";
const QUIZZES_URL = "http://localhost:5000/api/quizzes";
const ATTEMPTS_URL = "http://localhost:5000/api/quiz-attempts";

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

function CreateQuizModal({ token, courses, onClose, onCreated }) {
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([
    { questionText: "", options: ["", ""], correctOptionIndex: 0 },
  ]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const updateQuestion = (qIndex, field, value) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[qIndex] = { ...next[qIndex], [field]: value };
      return next;
    });
  };

  const updateOption = (qIndex, oIndex, value) => {
    setQuestions((prev) => {
      const next = [...prev];
      const options = [...next[qIndex].options];
      options[oIndex] = value;
      next[qIndex] = { ...next[qIndex], options };
      return next;
    });
  };

  const addOption = (qIndex) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[qIndex] = { ...next[qIndex], options: [...next[qIndex].options, ""] };
      return next;
    });
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { questionText: "", options: ["", ""], correctOptionIndex: 0 },
    ]);
  };

  const removeQuestion = (qIndex) => {
    setQuestions((prev) => prev.filter((_, i) => i !== qIndex));
  };

  const handleSubmit = async () => {
    if (!courseId) {
      setError("Please select a course.");
      return;
    }
    if (!title.trim()) {
      setError("Please enter a quiz title.");
      return;
    }
    for (const q of questions) {
      if (!q.questionText.trim() || q.options.some((o) => !o.trim())) {
        setError("Every question and option needs text filled in.");
        return;
      }
    }
    setError("");
    setSaving(true);
    try {
      const response = await fetch(QUIZZES_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ course: courseId, title, questions }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Could not create the quiz.");
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
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
        <div className="modal-header">
          <h3>Create Quiz</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-field">
            <label>Course</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d0d5dd", fontSize: 14 }}
            >
              <option value="">Select a course...</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>{c.title}</option>
              ))}
            </select>
          </div>

          <div className="modal-field">
            <label>Quiz Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          {questions.map((q, qIndex) => (
            <div
              key={qIndex}
              style={{ border: "1px solid #e2e5ef", borderRadius: 10, padding: "1rem", marginTop: "1rem" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontWeight: 600 }}>Question {qIndex + 1}</label>
                {questions.length > 1 && (
                  <button
                    onClick={() => removeQuestion(qIndex)}
                    style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: 13 }}
                  >
                    Remove
                  </button>
                )}
              </div>
              <input
                type="text"
                placeholder="Question text"
                value={q.questionText}
                onChange={(e) => updateQuestion(qIndex, "questionText", e.target.value)}
                style={{ marginTop: 8 }}
              />

              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                {q.options.map((option, oIndex) => (
                  <div key={oIndex} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="radio"
                      name={`correct-${qIndex}`}
                      checked={q.correctOptionIndex === oIndex}
                      onChange={() => updateQuestion(qIndex, "correctOptionIndex", oIndex)}
                      title="Mark as correct answer"
                    />
                    <input
                      type="text"
                      placeholder={`Option ${oIndex + 1}`}
                      value={option}
                      onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                      style={{ flex: 1 }}
                    />
                  </div>
                ))}
                <button
                  onClick={() => addOption(qIndex)}
                  style={{ alignSelf: "flex-start", background: "none", border: "none", color: "#4a60c8", cursor: "pointer", fontSize: 13, marginTop: 4 }}
                >
                  ＋ Add option
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={addQuestion}
            className="modal-cancel-btn"
            style={{ marginTop: "1rem", width: "100%" }}
          >
            ＋ Add Question
          </button>

          {error && (
            <p style={{ color: "#dc2626", fontSize: 13, marginTop: "0.75rem" }}>{error}</p>
          )}
        </div>

        <div className="modal-footer">
          <button className="modal-cancel-btn" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="modal-publish-btn" onClick={handleSubmit} disabled={saving}>
            {saving ? "Creating..." : "Create Quiz"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function QuizAttempts({ token }) {
  const [courses, setCourses] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [courseFilter, setCourseFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [coursesRes, attemptsRes] = await Promise.all([
        fetch(COURSES_URL, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${ATTEMPTS_URL}/received`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const coursesData = await coursesRes.json();
      const attemptsData = await attemptsRes.json();

      if (coursesRes.ok) setCourses(coursesData);
      if (attemptsRes.ok) setAttempts(attemptsData);
      if (!attemptsRes.ok) setError(attemptsData.message || "Could not load quiz attempts.");
    } catch (err) {
      console.error(err);
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAll();
  }, [token]);

  const handleCreated = () => {
    setShowModal(false);
    setMessage("Quiz created successfully!");
  };

  const visible =
    courseFilter === "all"
      ? attempts
      : attempts.filter((a) => a.course?._id === courseFilter);

  return (
    <div className="ec-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
        <h2 className="db-section-title">Quiz Attempts</h2>
        <button className="db-new-course-btn" onClick={() => setShowModal(true)}>
          ＋ Create Quiz
        </button>
      </div>

      {message && (
        <p style={{ color: "#16a34a", fontWeight: 600 }}>{message}</p>
      )}

      <div className="announcement-filters">
        <div className="filter-group">
          <label>Courses</label>
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #d0d5dd", fontSize: 14 }}
          >
            <option value="all">All</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>{c.title}</option>
            ))}
          </select>
        </div>
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
        ) : visible.length === 0 ? (
          <div className="ec-empty-state">
            <CloudSearchEmptyIcon />
            <p className="ec-empty-text" style={{ color: "#16a34a", fontWeight: 700 }}>No Data Found.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {visible.map((attempt) => (
              <div
                key={attempt._id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "#fff",
                  border: "1px solid #e2e5ef",
                  borderRadius: 10,
                  padding: "1rem 1.25rem",
                }}
              >
                <div>
                  <h4 style={{ margin: 0 }}>{attempt.quiz?.title || "Quiz"}</h4>
                  <p style={{ fontSize: 12, color: "#5c6b8a", margin: "4px 0 0" }}>
                    {attempt.course?.title} · {attempt.student?.firstName} {attempt.student?.lastName} ·{" "}
                    {new Date(attempt.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  style={{
                    fontWeight: 700,
                    color: attempt.percentage >= 50 ? "#16a34a" : "#dc2626",
                  }}
                >
                  {attempt.score}/{attempt.totalQuestions} ({attempt.percentage}%)
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <CreateQuizModal
          token={token}
          courses={courses}
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}