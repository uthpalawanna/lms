import React, { useState, useEffect } from "react";

const ENROLLMENTS_URL = "http://localhost:5000/api/enrollments";
const QUIZZES_URL = "http://localhost:5000/api/quizzes";
const ATTEMPTS_URL = "http://localhost:5000/api/quiz-attempts";

function EmptyIcon() {
  return (
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
      <path d="M55 65L48 74" stroke="#c8cdd8" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function TakeQuizModal({ token, quiz, onClose, onSubmitted }) {
  const [answers, setAnswers] = useState(Array(quiz.questions.length).fill(-1));
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const selectAnswer = (qIndex, optionIndex) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[qIndex] = optionIndex;
      return next;
    });
  };

  const handleSubmit = async () => {
    if (answers.some((a) => a === -1)) {
      setError("Please answer every question before submitting.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch(ATTEMPTS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quiz: quiz._id, answers }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Could not submit your attempt.");
        setSubmitting(false);
        return;
      }
      setResult(data);
      onSubmitted(data.attempt);
    } catch (err) {
      console.error(err);
      setError("Could not reach the server. Is the backend running?");
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={result ? onClose : undefined}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <h3>{quiz.title}</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {result ? (
            <div style={{ textAlign: "center", padding: "1rem 0" }}>
              <h2 style={{ margin: 0, color: "#4a60c8" }}>
                {result.attempt.score} / {result.attempt.totalQuestions}
              </h2>
              <p style={{ fontSize: 18, fontWeight: 600, marginTop: 6 }}>
                {result.attempt.percentage}%
              </p>
              <p style={{ color: "#5c6b8a", marginTop: 8 }}>
                Correct answers have been recorded in My Quiz Attempts.
              </p>
            </div>
          ) : (
            <>
              {quiz.questions.map((q, qIndex) => (
                <div key={qIndex} className="modal-field">
                  <label>{qIndex + 1}. {q.questionText}</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
                    {q.options.map((option, oIndex) => (
                      <label
                        key={oIndex}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "8px 10px",
                          border: "1px solid #e2e5ef",
                          borderRadius: 8,
                          cursor: "pointer",
                          background: answers[qIndex] === oIndex ? "#eef0fb" : "#fff",
                        }}
                      >
                        <input
                          type="radio"
                          name={`q-${qIndex}`}
                          checked={answers[qIndex] === oIndex}
                          onChange={() => selectAnswer(qIndex, oIndex)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              {error && (
                <p style={{ color: "#dc2626", fontSize: 13, marginTop: "0.5rem" }}>{error}</p>
              )}
            </>
          )}
        </div>

        <div className="modal-footer">
          {result ? (
            <button className="modal-publish-btn" onClick={onClose}>Close</button>
          ) : (
            <>
              <button className="modal-cancel-btn" onClick={onClose} disabled={submitting}>Cancel</button>
              <button className="modal-publish-btn" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Quiz"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MyQuizAttempts({ token }) {
  const [activeTab, setActiveTab] = useState("available");
  const [enrollments, setEnrollments] = useState([]);
  const [quizzesByCourse, setQuizzesByCourse] = useState({});
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeQuiz, setActiveQuiz] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [enrollRes, attemptsRes] = await Promise.all([
        fetch(ENROLLMENTS_URL, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${ATTEMPTS_URL}/mine`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const enrollData = await enrollRes.json();
      const attemptsData = await attemptsRes.json();

      if (enrollRes.ok) {
        setEnrollments(enrollData);
        const quizMap = {};
        await Promise.all(
          enrollData.map(async (enr) => {
            const courseId = enr.course?._id;
            if (!courseId) return;
            const res = await fetch(`${QUIZZES_URL}/course/${courseId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) quizMap[courseId] = data;
          })
        );
        setQuizzesByCourse(quizMap);
      }
      if (attemptsRes.ok) setAttempts(attemptsData);
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

  const handleSubmitted = () => {
    fetchAll();
  };

  const availableQuizzes = enrollments.flatMap((enr) => {
    const courseId = enr.course?._id;
    const quizzes = quizzesByCourse[courseId] || [];
    return quizzes.map((q) => ({ ...q, courseTitle: enr.course?.title }));
  });

  return (
    <div className="quiz-container">
      <h2 className="db-section-title">My Quiz Attempts</h2>

      <div className="ec-tabs-header">
        <button
          className={`ec-tab-btn ${activeTab === "available" ? "active" : ""}`}
          onClick={() => setActiveTab("available")}
        >
          Available Quizzes ({availableQuizzes.length})
        </button>
        <button
          className={`ec-tab-btn ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          My Attempts ({attempts.length})
        </button>
      </div>

      <div className="quiz-card">
        {loading ? (
          <p style={{ textAlign: "center", padding: "2rem" }}>Loading...</p>
        ) : error ? (
          <p style={{ textAlign: "center", padding: "2rem", color: "#dc2626" }}>{error}</p>
        ) : activeTab === "available" ? (
          availableQuizzes.length === 0 ? (
            <div className="quiz-empty-state">
              <EmptyIcon />
              <p className="quiz-empty-text">No Data Found.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", padding: "1rem" }}>
              {availableQuizzes.map((quiz) => (
                <div
                  key={quiz._id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    border: "1px solid #e2e5ef",
                    borderRadius: 10,
                    padding: "1rem",
                  }}
                >
                  <div>
                    <h4 style={{ margin: 0 }}>{quiz.title}</h4>
                    <p style={{ fontSize: 12, color: "#5c6b8a", margin: "4px 0 0" }}>
                      {quiz.courseTitle} · {quiz.questions.length} questions
                    </p>
                  </div>
                  <button className="db-new-course-btn" onClick={() => setActiveQuiz(quiz)}>
                    Take Quiz
                  </button>
                </div>
              ))}
            </div>
          )
        ) : attempts.length === 0 ? (
          <div className="quiz-empty-state">
            <EmptyIcon />
            <p className="quiz-empty-text">No Data Found.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", padding: "1rem" }}>
            {attempts.map((attempt) => (
              <div
                key={attempt._id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  border: "1px solid #e2e5ef",
                  borderRadius: 10,
                  padding: "1rem",
                }}
              >
                <div>
                  <h4 style={{ margin: 0 }}>{attempt.quiz?.title || "Quiz"}</h4>
                  <p style={{ fontSize: 12, color: "#5c6b8a", margin: "4px 0 0" }}>
                    {attempt.course?.title} · {new Date(attempt.createdAt).toLocaleDateString()}
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

      {activeQuiz && (
        <TakeQuizModal
          token={token}
          quiz={activeQuiz}
          onClose={() => setActiveQuiz(null)}
          onSubmitted={handleSubmitted}
        />
      )}
    </div>
  );
}