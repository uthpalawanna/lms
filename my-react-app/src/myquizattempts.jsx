import React, { useState, useEffect } from "react";

const ENROLLMENTS_URL = "http://localhost:5000/api/enrollments";
const QUIZZES_URL = "http://localhost:5000/api/quizzes";
const ATTEMPTS_URL = "http://localhost:5000/api/quiz-attempts";

function PuzzleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4a60c8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 10h-1a2 2 0 1 1 0-4h1a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-3a1 1 0 0 1-1-1 2 2 0 1 0-4 0 1 1 0 0 1-1 1H7a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1 2 2 0 1 0 0 4 1 1 0 0 1 1 1v3a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a2 2 0 1 1 4 0v1a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1z"></path>
    </svg>
  );
}

function EmptyIcon() {
  return (
    <svg
      className="w-24 h-24 mx-auto"
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

function ResultPill({ percentage, prefix }) {
  const passed = percentage >= 50;
  return (
    <span
      className={`text-xs font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap ${
        passed ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
      }`}
    >
      {prefix ? `${prefix} ${percentage}%` : `${passed ? "Passed" : "Failed"} · ${percentage}%`}
    </span>
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
      <div className="modal-box max-w-[560px]" onClick={(e) => e.stopPropagation()}>
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
            <div className="text-center py-4">
              <h2 className="m-0 text-[#4a60c8] text-3xl font-bold">
                {result.attempt.score} / {result.attempt.totalQuestions}
              </h2>
              <p className="text-lg font-semibold mt-1.5">{result.attempt.percentage}%</p>
              <p className="text-slate-500 mt-2 text-sm">
                Your result has been saved to My Attempts.
              </p>
            </div>
          ) : (
            <>
              {quiz.questions.map((q, qIndex) => (
                <div key={qIndex} className="modal-field">
                  <label>{qIndex + 1}. {q.questionText}</label>
                  <div className="flex flex-col gap-1.5 mt-1.5">
                    {q.options.map((option, oIndex) => (
                      <label
                        key={oIndex}
                        className={`flex items-center gap-2 px-2.5 py-2 border border-[#e2e5ef] rounded-lg cursor-pointer text-sm ${
                          answers[qIndex] === oIndex ? "bg-[#eef0fb]" : "bg-white"
                        }`}
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
              {error && <p className="text-red-600 text-[13px] mt-2">{error}</p>}
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

export default function MyQuizAttempts({ token, onNavigateToCourses }) {
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

  const bestByQuiz = {};
  attempts.forEach((a) => {
    const quizId = a.quiz?._id || a.quiz;
    if (!quizId) return;
    if (bestByQuiz[quizId] === undefined || a.percentage > bestByQuiz[quizId]) {
      bestByQuiz[quizId] = a.percentage;
    }
  });

  const totalAttempts = attempts.length;
  const averageScore =
    totalAttempts === 0
      ? 0
      : Math.round(attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / totalAttempts);
  const bestScore =
    totalAttempts === 0 ? 0 : Math.max(...attempts.map((a) => a.percentage || 0));

  const estimatedMinutes = (questionCount) => Math.max(1, Math.round(questionCount * 0.5));

  const STATS = [
    { label: "Total Attempts", value: String(totalAttempts) },
    { label: "Average Score", value: totalAttempts ? `${averageScore}%` : "—" },
    {
      label: "Best Result",
      value: totalAttempts ? `${bestScore}%` : "—",
      highlight: totalAttempts > 0 && bestScore >= 50,
    },
    { label: "Available Quizzes", value: String(availableQuizzes.length) },
  ];

  return (
    <div className="quiz-container">
      <h2 className="db-section-title">My Quiz Attempts</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {STATS.map((s) => (
          <div key={s.label} className="bg-white border border-[#e2e5ef] rounded-[10px] px-4 py-3.5">
            <p className="m-0 text-[13px] text-slate-500">{s.label}</p>
            <p
              className={`mt-1 mb-0 text-2xl font-bold ${
                s.highlight ? "text-green-600" : "text-gray-900"
              }`}
            >
              {loading ? "…" : s.value}
            </p>
          </div>
        ))}
      </div>

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
          <p className="text-center py-8 text-slate-500">Loading...</p>
        ) : error ? (
          <p className="text-center py-8 text-red-600">{error}</p>
        ) : activeTab === "available" ? (
          availableQuizzes.length === 0 ? (
            <div className="flex flex-col items-center py-12 px-4">
              <EmptyIcon />
              <p className="mt-3 mb-0 text-[15px] font-bold text-gray-900">
                No quizzes available yet
              </p>
              <p className="mt-1.5 mb-0 text-[13px] text-slate-500 max-w-[340px] text-center">
                Quizzes appear here when the courses you're enrolled in add them.
              </p>
              {onNavigateToCourses && (
                <button className="db-new-course-btn mt-3.5" onClick={onNavigateToCourses}>
                  Browse Courses
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 p-4">
              {availableQuizzes.map((quiz) => {
                const best = bestByQuiz[quiz._id];
                const attempted = best !== undefined;
                return (
                  <div
                    key={quiz._id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-[#e2e5ef] rounded-[10px] px-4 py-3.5 bg-white transition hover:border-indigo-200 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-[38px] h-[38px] rounded-lg bg-[#eef0fb] flex items-center justify-center shrink-0">
                        <PuzzleIcon />
                      </div>
                      <div className="min-w-0">
                        <h4 className="m-0 text-sm font-semibold text-gray-900 truncate">
                          {quiz.title}
                        </h4>
                        <p className="mt-0.5 mb-0 text-xs text-slate-500">
                          {quiz.courseTitle} · {quiz.questions.length} question
                          {quiz.questions.length !== 1 ? "s" : ""} · ~
                          {estimatedMinutes(quiz.questions.length)} min
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0 justify-between sm:justify-end">
                      {attempted && <ResultPill percentage={best} prefix="Best" />}
                      <button
                        className="db-new-course-btn px-4 py-[7px] text-[13px]"
                        onClick={() => setActiveQuiz(quiz)}
                      >
                        {attempted ? "Retake" : "Take Quiz"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : attempts.length === 0 ? (
          <div className="flex flex-col items-center py-12 px-4">
            <EmptyIcon />
            <p className="mt-3 mb-0 text-[15px] font-bold text-gray-900">No attempts yet</p>
            <p className="mt-1.5 mb-0 text-[13px] text-slate-500 max-w-[340px] text-center">
              Take a quiz from the Available Quizzes tab and your results will show up here.
            </p>
            <button
              className="db-new-course-btn mt-3.5"
              onClick={() => setActiveTab("available")}
            >
              View Available Quizzes
            </button>
          </div>
        ) : (
          <div className="flex flex-col">
            {attempts.map((attempt) => (
              <div
                key={attempt._id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-5 py-3.5 border-b border-[#f0f2f8] last:border-b-0"
              >
                <div className="min-w-0">
                  <h4 className="m-0 text-sm font-semibold text-gray-900 truncate">
                    {attempt.quiz?.title || "Quiz"}
                  </h4>
                  <p className="mt-0.5 mb-0 text-xs text-slate-500">
                    {attempt.course?.title || "Unknown course"} ·{" "}
                    {new Date(attempt.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[13px] font-semibold text-slate-500">
                    {attempt.score}/{attempt.totalQuestions}
                  </span>
                  <ResultPill percentage={attempt.percentage} />
                </div>
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