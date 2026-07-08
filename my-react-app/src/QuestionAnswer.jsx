import React, { useState, useEffect, useCallback } from "react";
import "./Dashboard.css";

const QUESTIONS_URL = "http://localhost:5000/api/questions";
const ENROLLMENTS_URL = "http://localhost:5000/api/enrollments";
const COURSES_MINE_URL = "http://localhost:5000/api/courses/mine";

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

function StatusPill({ answered }) {
  return (
    <span
      className={`text-xs font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
        answered ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-700"
      }`}
    >
      {answered ? "Answered" : "Awaiting reply"}
    </span>
  );
}

function AskQuestionModal({ courses, onClose, onSubmit, submitting, error }) {
  const [courseId, setCourseId] = useState(courses[0]?._id || "");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const handleSubmit = () => {
    onSubmit({ course: courseId, title, body });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Ask a Question</h3>
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
            {courses.length === 0 ? (
              <p className="text-[13px] text-slate-500">
                You need to be enrolled in a course before you can ask a question.
              </p>
            ) : (
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-[#d0d5dd] text-sm"
              >
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="modal-field">
            <label>Question Title</label>
            <input
              type="text"
              placeholder="What's your question?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="modal-field">
            <label>Details (optional)</label>
            <textarea
              placeholder="Add any extra detail that helps the instructor answer..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
            />
          </div>

          {error && <p className="text-red-600 text-[13px] mt-2">{error}</p>}
        </div>

        <div className="modal-footer">
          <button className="modal-cancel-btn" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            className="modal-publish-btn"
            onClick={handleSubmit}
            disabled={submitting || courses.length === 0}
          >
            {submitting ? "Posting..." : "Post Question"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function QuestionAnswer({ token }) {
  const [isInstructor, setIsInstructor] = useState(false);

  const [courses, setCourses] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showAskModal, setShowAskModal] = useState(false);
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");

  const [deletingId, setDeletingId] = useState(null);
  const [answerDrafts, setAnswerDrafts] = useState({});
  const [answeringId, setAnsweringId] = useState(null);

  const fetchCourses = useCallback(async () => {
    if (!token) return;
    try {
      if (isInstructor) {
        const res = await fetch(COURSES_MINE_URL, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (res.ok) setCourses(Array.isArray(data) ? data : []);
      } else {
        const res = await fetch(ENROLLMENTS_URL, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (res.ok) {
          const enrolledCourses = (Array.isArray(data) ? data : [])
            .map((e) => e.course)
            .filter(Boolean);
          setCourses(enrolledCourses);
        }
      }
    } catch (err) {
      console.error("Failed to load courses:", err);
    }
  }, [token, isInstructor]);

  const fetchQuestions = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const url = isInstructor ? `${QUESTIONS_URL}/received` : `${QUESTIONS_URL}/mine`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Could not load questions.");
        setQuestions([]);
        return;
      }
      setQuestions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, [token, isInstructor]);

  useEffect(() => {
    setCourseFilter("all");
    setStatusFilter("all");
    fetchCourses();
    fetchQuestions();
  }, [isInstructor, fetchCourses, fetchQuestions]);

  const handleAsk = async ({ course, title, body }) => {
    if (!course) {
      setPostError("Please select a course.");
      return;
    }
    if (!title.trim()) {
      setPostError("Please enter a question title.");
      return;
    }
    setPostError("");
    setPosting(true);
    try {
      const res = await fetch(QUESTIONS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ course, title, body }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPostError(data.message || "Could not submit your question.");
        setPosting(false);
        return;
      }
      setQuestions((prev) => [data, ...prev]);
      setShowAskModal(false);
    } catch (err) {
      console.error(err);
      setPostError("Could not reach the server. Is the backend running?");
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (questionId) => {
    const confirmed = window.confirm("Delete this question? This cannot be undone.");
    if (!confirmed) return;

    setDeletingId(questionId);
    try {
      const res = await fetch(`${QUESTIONS_URL}/${questionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setQuestions((prev) => prev.filter((q) => q._id !== questionId));
      } else {
        const data = await res.json();
        alert(data.message || "Could not delete the question.");
      }
    } catch (err) {
      console.error(err);
      alert("Could not reach the server. Is the backend running?");
    } finally {
      setDeletingId(null);
    }
  };

  const handleAnswer = async (questionId) => {
    const text = (answerDrafts[questionId] || "").trim();
    if (!text) return;

    setAnsweringId(questionId);
    try {
      const res = await fetch(`${QUESTIONS_URL}/${questionId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Could not submit your answer.");
        return;
      }
      setQuestions((prev) => prev.map((q) => (q._id === questionId ? data : q)));
      setAnswerDrafts((prev) => ({ ...prev, [questionId]: "" }));
    } catch (err) {
      console.error(err);
      alert("Could not reach the server. Is the backend running?");
    } finally {
      setAnsweringId(null);
    }
  };

  let visible = questions.filter((q) => {
    if (courseFilter !== "all" && (q.course?._id || q.course) !== courseFilter) return false;
    const answered = (q.answers?.length || 0) > 0;
    if (statusFilter === "answered" && !answered) return false;
    if (statusFilter === "unanswered" && answered) return false;
    return true;
  });
  visible = [...visible].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const answeredCount = questions.filter((q) => (q.answers?.length || 0) > 0).length;
  const unansweredCount = questions.length - answeredCount;
  const filtersActive = courseFilter !== "all" || statusFilter !== "all";

  const FILTERS = [
    { id: "all", label: `All (${questions.length})` },
    { id: "answered", label: `Answered (${answeredCount})` },
    { id: "unanswered", label: `Awaiting reply (${unansweredCount})` },
  ];

  return (
    <div className="qa-container">
      <div className="qa-header">
        <h2 className="db-section-title" style={{ marginBottom: 0 }}>
          Question & Answer
        </h2>

        <div className="qa-toggle-wrapper">
          <span className={`qa-toggle-label ${!isInstructor ? "active-blue" : ""}`}>Student</span>
          <label className="qa-switch">
            <input
              type="checkbox"
              checked={isInstructor}
              onChange={() => setIsInstructor((prev) => !prev)}
            />
            <span className="qa-slider"></span>
          </label>
          <span className={`qa-toggle-label ${isInstructor ? "active" : ""}`}>Instructor</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 mt-4 mb-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setStatusFilter(f.id)}
            className={`text-[13px] px-3 py-1.5 rounded-full border transition ${
              statusFilter === f.id
                ? "bg-[#eef0fb] border-[#c7d2fe] text-[#3d56c8] font-semibold"
                : "bg-white border-[#e2e5ef] text-slate-500 hover:border-indigo-200"
            }`}
          >
            {f.label}
          </button>
        ))}

        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="ml-auto bg-white border border-[#dfe2ec] rounded-lg px-3 py-1.5 text-[13px] text-gray-900 cursor-pointer"
        >
          <option value="all">All courses</option>
          {courses.map((c) => (
            <option key={c._id} value={c._id}>
              {c.title}
            </option>
          ))}
        </select>

        {!isInstructor && (
          <button
            className="db-new-course-btn"
            onClick={() => {
              setPostError("");
              setShowAskModal(true);
            }}
          >
            + Ask a Question
          </button>
        )}
      </div>

      <div className="quiz-card mt-4">
        {loading ? (
          <p className="text-center py-12 text-slate-400">Loading...</p>
        ) : error ? (
          <p className="text-center py-12 text-red-600">{error}</p>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center py-14 px-4">
            <EmptyIcon />
            {filtersActive ? (
              <>
                <p className="mt-3 mb-0 text-[15px] font-bold text-gray-900">
                  No results match your filters
                </p>
                <p className="mt-1.5 mb-0 text-[13px] text-slate-500 max-w-[340px] text-center">
                  Try a different course or status.
                </p>
                <button
                  className="db-new-course-btn mt-3.5"
                  onClick={() => {
                    setCourseFilter("all");
                    setStatusFilter("all");
                  }}
                >
                  Clear Filters
                </button>
              </>
            ) : isInstructor ? (
              <>
                <p className="mt-3 mb-0 text-[15px] font-bold text-gray-900">No questions yet</p>
                <p className="mt-1.5 mb-0 text-[13px] text-slate-500 max-w-[340px] text-center">
                  Questions from students in your courses will appear here.
                </p>
              </>
            ) : (
              <>
                <p className="mt-3 mb-0 text-[15px] font-bold text-gray-900">No questions yet</p>
                <p className="mt-1.5 mb-0 text-[13px] text-slate-500 max-w-[340px] text-center">
                  Ask your instructor anything about a course you're enrolled in.
                </p>
                <button
                  className="db-new-course-btn mt-3.5"
                  onClick={() => {
                    setPostError("");
                    setShowAskModal(true);
                  }}
                >
                  Ask a Question
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 p-4">
            {visible.map((q) => {
              const answered = (q.answers?.length || 0) > 0;
              const studentName = `${q.student?.firstName || ""} ${q.student?.lastName || ""}`.trim();
              return (
                <div
                  key={q._id}
                  className="border border-[#e2e5ef] rounded-[10px] bg-white px-4 py-3.5"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0">
                      <h4 className="m-0 text-sm font-semibold text-gray-900">{q.title}</h4>
                      <p className="mt-1 mb-0 text-xs text-slate-500">
                        {q.course?.title || "Unknown course"}
                        {isInstructor && studentName ? ` · ${studentName}` : ""} ·{" "}
                        {new Date(q.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusPill answered={answered} />
                      {!isInstructor && (
                        <button
                          onClick={() => handleDelete(q._id)}
                          disabled={deletingId === q._id}
                          title="Delete question"
                          className="text-red-600 bg-transparent border-none cursor-pointer p-1"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {q.body && (
                    <p className="mt-2 mb-0 text-sm text-gray-700">{q.body}</p>
                  )}

                  {q.answers?.map((a) => (
                    <div
                      key={a._id}
                      className="mt-3 pt-3 border-t border-[#f0f2f8] flex gap-2.5"
                    >
                      <div className="w-7 h-7 rounded-full bg-[#eef0fb] text-[#3d56c8] flex items-center justify-center text-[11px] font-semibold shrink-0">
                        {(a.responder?.firstName?.[0] || "I").toUpperCase()}
                      </div>
                      <div>
                        <p className="m-0 text-xs text-slate-500">
                          {a.responder?.firstName
                            ? `${a.responder.firstName} ${a.responder.lastName || ""}`.trim()
                            : "Instructor"}{" "}
                          · Instructor
                        </p>
                        <p className="mt-1 mb-0 text-[13px] text-gray-800">{a.text}</p>
                      </div>
                    </div>
                  ))}

                  {isInstructor && !answered && (
                    <div className="mt-3 pt-3 border-t border-[#f0f2f8] flex gap-2 items-start">
                      <textarea
                        rows={2}
                        placeholder="Write a reply..."
                        value={answerDrafts[q._id] || ""}
                        onChange={(e) =>
                          setAnswerDrafts((prev) => ({ ...prev, [q._id]: e.target.value }))
                        }
                        className="flex-1 px-3 py-2 rounded-lg border border-[#d0d5dd] text-[13px] resize-none"
                      />
                      <button
                        className="db-new-course-btn shrink-0"
                        style={{ padding: "7px 14px", fontSize: 13 }}
                        onClick={() => handleAnswer(q._id)}
                        disabled={answeringId === q._id || !(answerDrafts[q._id] || "").trim()}
                      >
                        {answeringId === q._id ? "Sending..." : "Reply"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAskModal && (
        <AskQuestionModal
          courses={courses}
          onClose={() => setShowAskModal(false)}
          onSubmit={handleAsk}
          submitting={posting}
          error={postError}
        />
      )}
    </div>
  );
}