import React, { useState, useEffect } from "react";
import CreateQuizModal from "./CreateQuizModal";
import TakeQuizModal from "./TakeQuizModal";

const QUIZ_URL = "http://localhost:5000/api/quizzes";
const REVIEWS_URL = "http://localhost:5000/api/reviews";
const WISHLIST_URL = "http://localhost:5000/api/wishlist";

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

  const myExistingReview = reviews.find((r) => r.student?._id === user?.id || r.student === user?.id);

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
        {token && (
          <button className="db-new-course-btn" onClick={() => setShowForm((s) => !s)}>
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
            {saving ? "Saving..." : "Submit Review"}
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

  const isOwner = course?.instructor && (course.instructor._id || course.instructor) === user?.id;

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
              {!isOwner && (
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

export default function CourseDetails({ course, token, user, onBack, onAuthorClick }) {
  const [activeTab, setActiveTab] = useState("info");
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistBusy, setWishlistBusy] = useState(false);

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
    : "DINESHAN";

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
            <svg width="100%" height="100%" viewBox="0 0 800 400" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="800" height="400" fill="#eef0f8"/>
              <circle cx="200" cy="120" r="40" fill="#dce1f0"/>
              <path d="M300 400 L500 160 L700 400 Z" fill="#e2e5ef"/>
              <path d="M500 400 L640 240 L800 400 Z" fill="#dce1f0"/>
            </svg>
          </div>

          <div className="cd-tabs-bar">
            {[
              { id: "info", label: "Course Info" },
              { id: "reviews", label: "Reviews" },
              { id: "announcements", label: "Announcements" },
              { id: "quizzes", label: "Quizzes" },
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
            {activeTab === "reviews" && (
              <CourseReviewsTab course={course} token={token} user={user} />
            )}

            {activeTab === "announcements" && (
              <div className="cd-reviews-section">
                <div className="ec-empty-state" style={{ marginTop: "3rem" }}>
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
              </div>
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
            <div className="cd-progress-stats">
              <span>0/0</span>
              <span>0% Complete</span>
            </div>
            <div className="cd-progress-track">
              <div className="cd-progress-fill" style={{ width: "0%" }}></div>
            </div>
            <button className="cd-complete-btn">Complete Course</button>
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
              <span className="cd-author-name" onClick={onAuthorClick} style={{ cursor: "pointer" }}>
                {instructorName}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}