import React, { useState, useEffect } from "react";
import CreateQuizModal from "./CreateQuizModal";
import TakeQuizModal from "./TakeQuizModal";

const QUIZ_URL = "http://localhost:5000/api/quizzes";
const REVIEWS_URL = "http://localhost:5000/api/reviews";
const WISHLIST_URL = "http://localhost:5000/api/wishlist";
const ANNOUNCEMENTS_URL = "http://localhost:5000/api/announcements";

function resolveThumbnailUrl(thumbnail) {
  if (!thumbnail) return null;
  if (thumbnail.startsWith("http://") || thumbnail.startsWith("https://")) return thumbnail;
  if (thumbnail.startsWith("/uploads")) return `http://localhost:5000${thumbnail}`;
  return `http://localhost:5000/uploads/${thumbnail}`;
}

function CourseHeroImage({ thumbnail, title }) {
  const [failed, setFailed] = useState(false);
  const resolvedUrl = resolveThumbnailUrl(thumbnail);
  return resolvedUrl && !failed ? (
    <img
      src={resolvedUrl}
      alt={title}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
      onError={() => setFailed(true)}
    />
  ) : (
    <svg width="100%" height="100%" viewBox="0 0 800 400" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="400" fill="#eef0f8"/>
      <circle cx="200" cy="120" r="40" fill="#dce1f0"/>
      <path d="M300 400 L500 160 L700 400 Z" fill="#e2e5ef"/>
      <path d="M500 400 L640 240 L800 400 Z" fill="#dce1f0"/>
    </svg>
  );
}

function Stars({ rating }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} style={{ color: n <= rating ? "#f59e0b" : "#d1d5db", fontSize: 15 }}>★</span>
      ))}
    </span>
  );
}

function StarInput({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          onClick={() => onChange(n)}
          style={{ cursor: "pointer", fontSize: 24, color: n <= value ? "#f59e0b" : "#d1d5db" }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function CourseReviewsTab({ course, token, user }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchReviews = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${REVIEWS_URL}/course/${course._id}`);
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Could not load reviews.");
        setLoading(false);
        return;
      }
      setReviews(data);
    } catch (err) {
      console.error(err);
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (course?._id) fetchReviews();
  }, [course?._id]);

  const myExistingReview = reviews.find(
    (r) => r.student?._id === (user?._id || user?.id) || r.student === (user?._id || user?.id)
  );

  const openForm = () => {
    if (myExistingReview) {
      setRating(myExistingReview.rating);
      setComment(myExistingReview.comment || "");
    } else {
      setRating(0);
      setComment("");
    }
    setShowForm((s) => !s);
  };

  const handleSubmit = async () => {
    setFormError("");
    if (!rating) {
      setFormError("Please choose a star rating.");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(REVIEWS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ course: course._id, rating, comment }),
      });
      const data = await response.json();
      if (!response.ok) {
        setFormError(data.message || "Could not save your review.");
        setSaving(false);
        return;
      }
      setShowForm(false);
      setRating(0);
      setComment("");
      fetchReviews();
    } catch (err) {
      console.error(err);
      setFormError("Could not reach the server. Is the backend running?");
      setSaving(false);
      return;
    }
    setSaving(false);
  };

  return (
    <div className="cd-reviews-section">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 className="cd-section-heading" style={{ margin: 0 }}>Student Ratings & Reviews</h3>
        {token && user?.role !== "instructor" && user?.role !== "admin" && (
          <button className="db-new-course-btn" onClick={openForm}>
            {myExistingReview ? "Edit My Review" : "+ Write a Review"}
          </button>
        )}
      </div>

      {showForm && (
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 16, marginBottom: 20, background: "#f9fafb" }}>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Your Rating</label>
            <StarInput value={rating} onChange={setRating} />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Comment (optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="What did you think of this course?"
              style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #d0d5dd", boxSizing: "border-box" }}
            />
          </div>
          {formError && <p style={{ color: "#dc2626", fontSize: 13, marginBottom: 8 }}>{formError}</p>}
          <button className="modal-publish-btn" onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving..." : myExistingReview ? "Update Review" : "Submit Review"}
          </button>
        </div>
      )}

      {loading ? (
        <p style={{ fontSize: 14, color: "#9ca3af" }}>Loading reviews...</p>
      ) : error ? (
        <p style={{ fontSize: 14, color: "#dc2626" }}>{error}</p>
      ) : reviews.length === 0 ? (
        <div className="ec-empty-state" style={{ marginTop: "1.5rem" }}>
          <svg className="ec-empty-icon" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M40 80C35 80 25 70 25 50C25 30 35 20 40 20L80 20C85 20 95 30 95 50C95 70 85 80 80 80L40 80Z" fill="#E2E5EF"/>
            <path d="M40 80C35 80 25 70 25 50C25 30 35 20 40 20L45 20C40 20 30 30 30 50C30 70 40 80 45 80L40 80Z" fill="#C8CDD8"/>
            <rect x="75" y="10" width="10" height="20" rx="2" fill="#4A60C8" transform="rotate(30 75 10)"/>
            <circle cx="10" cy="40" r="2" fill="#C8CDD8"/>
            <circle cx="20" cy="25" r="1.5" fill="#C8CDD8"/>
            <circle cx="105" cy="60" r="2.5" fill="#C8CDD8"/>
          </svg>
          <p className="ec-empty-text">No Review Yet</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {reviews.map((r) => (
            <div key={r._id} style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: "12px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 6 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>
                  {r.student?.firstName} {r.student?.lastName}
                </span>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              <div style={{ marginTop: 4 }}>
                <Stars rating={r.rating} />
              </div>
              {r.comment && <p style={{ marginTop: 6, marginBottom: 0, fontSize: 14, color: "#374151" }}>{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function QuizzesTab({ course, token, user }) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [takingQuizId, setTakingQuizId] = useState(null);
  const [deletingQuizId, setDeletingQuizId] = useState(null);

  const courseInstructorId = course?.instructor?._id || course?.instructor;
  const currentUserId = user?._id || user?.id;
  const isOwner = !!courseInstructorId && !!currentUserId && String(courseInstructorId) === String(currentUserId);

  const handleDeleteQuiz = async (quizId, quizTitle) => {
    const confirmed = window.confirm(
      `Delete "${quizTitle}" permanently? This will also delete every student's attempt history for this quiz, from both their "My Quiz Attempts" page and your "Quiz Attempts" page. This cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingQuizId(quizId);
    try {
      const response = await fetch(`${QUIZ_URL}/${quizId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setQuizzes((prev) => prev.filter((q) => q._id !== quizId));
      } else {
        const data = await response.json();
        alert(data.message || "Could not delete the quiz.");
      }
    } catch (err) {
      console.error(err);
      alert("Could not reach the server. Is the backend running?");
    } finally {
      setDeletingQuizId(null);
    }
  };

  const fetchQuizzes = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${QUIZ_URL}/course/${course._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Could not load quizzes.");
        setLoading(false);
        return;
      }
      setQuizzes(data);
    } catch (err) {
      console.error(err);
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (course?._id && token) fetchQuizzes();
  }, [course?._id, token]);

  return (
    <div className="cd-reviews-section">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 className="cd-section-heading" style={{ margin: 0 }}>Quizzes</h3>
        {isOwner && (
          <button className="db-new-course-btn" onClick={() => setShowCreateModal(true)}>
            + Create Quiz
          </button>
        )}
      </div>

      {loading ? (
        <p style={{ fontSize: 14, color: "#9ca3af" }}>Loading...</p>
      ) : error ? (
        <p style={{ fontSize: 14, color: "#dc2626" }}>{error}</p>
      ) : quizzes.length === 0 ? (
        <div className="ec-empty-state" style={{ marginTop: "1.5rem" }}>
          <p className="ec-empty-text">No quizzes yet for this course.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {quizzes.map((q) => (
            <div
              key={q._id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: "12px 16px",
              }}
            >
              <div>
                <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>{q.title}</p>
                <p style={{ fontSize: 12, color: "#9ca3af", margin: "4px 0 0" }}>
                  {q.questions.length} question{q.questions.length !== 1 ? "s" : ""}
                </p>
              </div>
              {isOwner ? (
                <button
                  onClick={() => handleDeleteQuiz(q._id, q.title)}
                  disabled={deletingQuizId === q._id}
                  title="Delete this quiz"
                  style={{
                    background: "none",
                    border: "1px solid #fca5a5",
                    color: "#dc2626",
                    borderRadius: 6,
                    padding: "6px 12px",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {deletingQuizId === q._id ? "Deleting..." : "Delete"}
                </button>
              ) : (
                <button className="modal-publish-btn" onClick={() => setTakingQuizId(q._id)}>
                  Take Quiz
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateQuizModal
          token={token}
          courseId={course._id}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            fetchQuizzes();
          }}
        />
      )}

      {takingQuizId && (
        <TakeQuizModal
          token={token}
          quizId={takingQuizId}
          onClose={() => setTakingQuizId(null)}
        />
      )}
    </div>
  );
}

function AnnouncementsTab({ course, token, isOwner }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${ANNOUNCEMENTS_URL}/course/${course._id}`);
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Could not load announcements.");
        setLoading(false);
        return;
      }
      setAnnouncements(data);
    } catch (err) {
      console.error(err);
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (course?._id) fetchAnnouncements();
  }, [course?._id]);

  const openForm = () => {
    setTitle("");
    setSummary("");
    setFormError("");
    setShowForm((s) => !s);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setFormError("Please enter an announcement title.");
      return;
    }
    setFormError("");
    setSaving(true);
    try {
      const response = await fetch(ANNOUNCEMENTS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ course: course._id, title, summary }),
      });
      const data = await response.json();
      if (!response.ok) {
        setFormError(data.message || "Could not publish the announcement.");
        setSaving(false);
        return;
      }
      setAnnouncements((prev) => [data, ...prev]);
      setShowForm(false);
      setTitle("");
      setSummary("");
    } catch (err) {
      console.error(err);
      setFormError("Could not reach the server. Is the backend running?");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cd-reviews-section">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 className="cd-section-heading" style={{ margin: 0 }}>Announcements</h3>
        {token && isOwner && (
          <button className="db-new-course-btn" onClick={openForm}>
            + Add Announcement
          </button>
        )}
      </div>

      {showForm && (
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 16, marginBottom: 20, background: "#f9fafb" }}>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Title</label>
            <input
              type="text"
              placeholder="Announcement title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #d1d5db" }}
            />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Summary (optional)</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={4}
              style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #d1d5db" }}
            />
          </div>
          {formError && <p style={{ color: "#dc2626", fontSize: 13, marginBottom: 10 }}>{formError}</p>}
          <div style={{ display: "flex", gap: 8 }}>
            <button className="db-new-course-btn" onClick={handleSubmit} disabled={saving}>
              {saving ? "Publishing..." : "Publish"}
            </button>
            <button className="cd-action-btn" onClick={() => setShowForm(false)} disabled={saving}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ fontSize: 14, color: "#9ca3af" }}>Loading announcements...</p>
      ) : error ? (
        <p style={{ fontSize: 14, color: "#dc2626" }}>{error}</p>
      ) : announcements.length === 0 ? (
        <div className="ec-empty-state" style={{ marginTop: "3rem" }}>
          <svg className="ec-empty-icon" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M40 80C35 80 25 70 25 50C25 30 35 20 40 20L80 20C85 20 95 30 95 50C95 70 85 80 80 80L40 80Z" fill="#E2E5EF"/>
            <path d="M40 80C35 80 25 70 25 50C25 30 35 20 40 20L45 20C40 20 30 30 30 50C30 70 40 80 45 80L40 80Z" fill="#C8CDD8"/>
            <rect x="75" y="10" width="10" height="20" rx="2" fill="#4A60C8" transform="rotate(30 75 10)"/>
            <circle cx="10" cy="40" r="2" fill="#C8CDD8"/>
            <circle cx="20" cy="25" r="1.5" fill="#C8CDD8"/>
            <circle cx="105" cy="60" r="2.5" fill="#C8CDD8"/>
          </svg>
          <p className="ec-empty-text">No Announcements Yet</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {announcements.map((a) => (
            <div key={a._id} style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: "12px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 6 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{a.title}</span>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>{new Date(a.createdAt).toLocaleDateString()}</span>
              </div>
              {a.summary && (
                <p style={{ marginTop: 6, marginBottom: 0, fontSize: 14, color: "#374151" }}>{a.summary}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CurriculumTab({ course, token, enrollment, isOwner, onLessonToggled }) {
  const topics = course?.curriculum || [];
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);

  const hasAccess = !!enrollment || !!isOwner;
  const completedLessons = enrollment?.completedLessons || [];

  useEffect(() => {
    if (!selected && topics.length > 0 && topics[0].lessons?.length > 0) {
      setSelected({ t: 0, l: 0 });
    }
  }, [topics.length]);

  const selectedKey = selected ? `${selected.t}-${selected.l}` : null;
  const selectedLesson = selected ? topics[selected.t]?.lessons?.[selected.l] : null;
  const selectedDone = selectedKey ? completedLessons.includes(selectedKey) : false;

  const embedUrl = (() => {
    const url = selectedLesson?.videoUrl || "";
    if (!url) return null;
    const ytMatch = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{6,})/
    );
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    return null;
  })();

  const resolvedVideoSrc = (() => {
    const url = selectedLesson?.videoUrl || "";
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("/uploads")) return `http://localhost:5000${url}`;
    return url;
  })();

  const handleToggleComplete = async () => {
    if (!enrollment || !selectedKey || busy) return;
    setBusy(true);
    try {
      const res = await fetch(`http://localhost:5000/api/enrollments/${enrollment._id}/lesson`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ lessonKey: selectedKey, completed: !selectedDone }),
      });
      const data = await res.json();
      if (res.ok) onLessonToggled(data);
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  if (topics.length === 0) {
    return (
      <div className="ec-empty-state">
        <p className="ec-empty-text">This course doesn't have any lessons yet.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        {topics.map((topic, tIndex) => (
          <div key={tIndex} style={{ marginBottom: 16 }}>
            <p style={{ fontWeight: 700, fontSize: 13, color: "#374151", margin: "0 0 8px" }}>{topic.title}</p>
            {(topic.lessons || []).map((lesson, lIndex) => {
              const key = `${tIndex}-${lIndex}`;
              const isSelected = selectedKey === key;
              const done = completedLessons.includes(key);
              return (
                <div
                  key={key}
                  onClick={() => setSelected({ t: tIndex, l: lIndex })}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 12px", borderRadius: 8, marginBottom: 6,
                    border: `1px solid ${isSelected ? "#4a60c8" : "#e5e7eb"}`,
                    background: isSelected ? "#f5f7ff" : "#fff",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: 15 }}>{done ? "✅" : "▶️"}</span>
                  <span style={{ fontSize: 13, flex: 1 }}>{lesson.title}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 20 }}>
        {!hasAccess ? (
          <div className="ec-empty-state">
            <p className="ec-empty-text">Enroll in this course to unlock lessons and track your progress.</p>
          </div>
        ) : selectedLesson ? (
          <>
            <h3 className="cd-section-heading">{selectedLesson.title}</h3>
            {embedUrl ? (
              <div style={{ marginBottom: 16, position: "relative", paddingTop: "56.25%" }}>
                <iframe
                  src={embedUrl}
                  title={selectedLesson.title}
                  allowFullScreen
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0, borderRadius: 10 }}
                />
              </div>
            ) : selectedLesson.videoUrl ? (
              <video controls style={{ width: "100%", borderRadius: 10, background: "#000", marginBottom: 16 }} src={resolvedVideoSrc} />
            ) : null}
            {selectedLesson.content && (
              <p style={{ fontSize: 14, lineHeight: 1.7, color: "#374151", whiteSpace: "pre-wrap" }}>{selectedLesson.content}</p>
            )}
            <button
              className="cd-complete-btn"
              onClick={handleToggleComplete}
              disabled={busy}
              style={{ marginTop: 12, display: enrollment ? "inline-block" : "none" }}
            >
              {busy ? "Saving..." : selectedDone ? "✓ Completed — Mark Incomplete" : "Mark as Complete"}
            </button>
          </>
        ) : (
          <p style={{ fontSize: 14, color: "#9ca3af" }}>Select a lesson to begin.</p>
        )}
      </div>
    </div>
  );
}

function CertificateTab({ course, user, enrollment }) {
  if (!enrollment || enrollment.status !== "completed") {
    return (
      <div className="ec-empty-state">
        <p className="ec-empty-text">Complete every lesson in this course to unlock your certificate.</p>
      </div>
    );
  }

  const studentName = user?.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : user?.username || "Student";
  const completedDate = enrollment.updatedAt
    ? new Date(enrollment.updatedAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })
    : "";
  const instructorName = course?.instructor
    ? `${course.instructor.firstName || ""} ${course.instructor.lastName || ""}`.trim() || "Instructor"
    : "Instructor";

  return (
    <div>
      <div style={{
        border: "10px solid #4a60c8", borderRadius: 12, padding: "48px 40px",
        textAlign: "center", background: "#fff", fontFamily: "Georgia, serif",
      }}>
        <p style={{ letterSpacing: 4, fontSize: 12, color: "#9ca3af", textTransform: "uppercase", margin: 0 }}>SHRI Learning Management System</p>
        <h1 style={{ fontSize: 30, margin: "16px 0 4px", color: "#111827" }}>Certificate of Completion</h1>
        <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 20px" }}>This certifies that</p>
        <h2 style={{ fontSize: 26, color: "#4a60c8", margin: "0 0 20px", fontFamily: "system-ui, sans-serif" }}>{studentName}</h2>
        <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 8px" }}>has successfully completed the course</p>
        <h3 style={{ fontSize: 19, color: "#111827", margin: "0 0 32px" }}>{course?.title}</h3>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40, fontSize: 13, color: "#6b7280" }}>
          <span>Instructor: {instructorName}</span>
          <span>Completed: {completedDate}</span>
        </div>
      </div>
      <button
        className="cd-complete-btn"
        style={{ marginTop: 16 }}
        onClick={() => window.print()}
      >
        Download / Print Certificate
      </button>
    </div>
  );
}

export default function CourseDetails({ course, token, user, onBack, onAuthorClick }) {
  const [activeTab, setActiveTab] = useState("info");
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistBusy, setWishlistBusy] = useState(false);
  const [enrollment, setEnrollment] = useState(null);

  const fetchEnrollment = () => {
    if (!token || !course?._id) return;
    fetch(`http://localhost:5000/api/enrollments?course=${course._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setEnrollment(Array.isArray(data) && data.length > 0 ? data[0] : null);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchEnrollment();
  }, [token, course?._id]);

  useEffect(() => {
    if (!token || !course?._id) return;
    let cancelled = false;
    fetch(WISHLIST_URL, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : []))
      .then((items) => {
        if (cancelled) return;
        const found = items.some(
          (item) => (item.course?._id || item.course) === course._id
        );
        setInWishlist(found);
      })
      .catch((err) => console.error(err));
    return () => {
      cancelled = true;
    };
  }, [token, course?._id]);

  const handleToggleWishlist = async () => {
    if (!token || !course?._id || wishlistBusy) return;
    setWishlistBusy(true);
    try {
      if (inWishlist) {
        const response = await fetch(`${WISHLIST_URL}/${course._id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) setInWishlist(false);
      } else {
        const response = await fetch(WISHLIST_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ course: course._id }),
        });
        if (response.ok) setInWishlist(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setWishlistBusy(false);
    }
  };

  const title = course?.title || "New Course";
  const category = course?.category || "Uncategorized";
  const description = course?.description || "Welcome to this course! Add your course description content here.";
  const instructorName = course?.instructor
    ? `${course.instructor.firstName || ""} ${course.instructor.lastName || ""}`.trim() || "Instructor"
    : "Instructor";
  const courseInstructorId = course?.instructor?._id || course?.instructor;
  const currentUserId = user?._id || user?.id;
  const isOwner = !!courseInstructorId && !!currentUserId && String(courseInstructorId) === String(currentUserId);
  console.log("[CourseDetail owner check]", { courseInstructorId, currentUserId, isOwner });

  return (
    <div className="cd-container">
      <div className="cd-header">
        <div className="cd-header-left">
          <div className="cd-stars">
            <span className="db-star">☆</span>
            <span className="db-star">☆</span>
            <span className="db-star">☆</span>
            <span className="db-star">☆</span>
            <span className="db-star">☆</span>
          </div>
          <h1 className="cd-title">{title}</h1>
          <p className="cd-category">{category}</p>
        </div>

        <div className="cd-header-right">
          <button
            className="cd-action-btn"
            onClick={handleToggleWishlist}
            disabled={wishlistBusy || !token}
            style={inWishlist ? { color: "#dc2626", borderColor: "#fca5a5" } : undefined}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={inWishlist ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
            {inWishlist ? "Wishlisted" : "Wishlist"}
          </button>
          <button className="cd-action-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
            Share
          </button>
        </div>
      </div>

      <div className="cd-layout">
        <div className="cd-main-content">
          <div className="cd-hero-image">
            <CourseHeroImage thumbnail={course?.thumbnail} title={title} />
          </div>

          <div className="cd-tabs-bar">
            {[
              { id: "curriculum", label: "Curriculum" },
              { id: "info", label: "Course Info" },
              { id: "reviews", label: "Reviews" },
              { id: "announcements", label: "Announcements" },
              { id: "quizzes", label: "Quizzes" },
              { id: "certificate", label: "Certificate" },
            ].map(tab => (
              <button
                key={tab.id}
                className={`cd-tab-btn ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="cd-tab-content-area">
            {activeTab === "curriculum" && (
              <CurriculumTab
                course={course}
                token={token}
                enrollment={enrollment}
                isOwner={isOwner}
                onLessonToggled={(updated) => setEnrollment(updated)}
              />
            )}

            {activeTab === "certificate" && (
              <CertificateTab course={course} user={user} enrollment={enrollment} />
            )}

            {activeTab === "reviews" && (
              <CourseReviewsTab course={course} token={token} user={user} />
            )}

            {activeTab === "announcements" && (
              <AnnouncementsTab course={course} token={token} isOwner={isOwner} />
            )}

            {activeTab === "quizzes" && (
              <QuizzesTab course={course} token={token} user={user} />
            )}

            {activeTab === "info" && (
              <div className="cd-info-section">
                <h3 className="cd-section-heading">Course Description</h3>
                <p>{description}</p>
              </div>
            )}
          </div>
        </div>

        <div className="cd-sidebar">
          <div className="cd-card">
            <h3 className="cd-card-title">Course Progress</h3>
            {(() => {
              const totalLessons = (course?.curriculum || []).reduce(
                (sum, t) => sum + (t.lessons?.length || 0), 0
              );
              const doneLessons = enrollment?.completedLessons?.length || 0;
              const pct = enrollment?.progress ?? 0;
              return (
                <>
                  <div className="cd-progress-stats">
                    <span>{doneLessons}/{totalLessons}</span>
                    <span>{pct}% Complete</span>
                  </div>
                  <div className="cd-progress-track">
                    <div className="cd-progress-fill" style={{ width: `${pct}%` }}></div>
                  </div>
                  {enrollment ? (
                    enrollment.status === "completed" ? (
                      <button className="cd-complete-btn" onClick={() => setActiveTab("certificate")}>
                        🎓 View Certificate
                      </button>
                    ) : (
                      <button className="cd-complete-btn" onClick={() => setActiveTab("curriculum")}>
                        Continue Learning
                      </button>
                    )
                  ) : (
                    <button className="cd-complete-btn" disabled>
                      Enroll to Start
                    </button>
                  )}
                </>
              );
            })()}
            <div className="cd-meta-list">
              <div className="cd-meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
                0 Total Enrolled
              </div>
              <div className="cd-meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-10.43l5.25 5.25"></path></svg>
                {course?.createdAt ? new Date(course.createdAt).toLocaleDateString() : "—"} Last Updated
              </div>
            </div>
          </div>

          <div className="cd-card">
            <h3 className="cd-card-title" style={{ fontSize: "14px", marginBottom: "1rem" }}>A course by</h3>
            <div className="cd-instructor">
              <div className="cd-avatar">{instructorName[0] || "D"}</div>
              <span
                className="cd-author-name"
                onClick={() => onAuthorClick && onAuthorClick(course?.instructor?._id || course?.instructor)}
                style={{ cursor: "pointer" }}
              >
                {instructorName}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}