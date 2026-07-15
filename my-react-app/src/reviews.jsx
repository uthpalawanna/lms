import React, { useState, useEffect } from "react";

const REVIEWS_URL = "http://localhost:5000/api/reviews";
const ENROLLMENTS_URL = "http://localhost:5000/api/enrollments";

const TABS = [
  { id: "given", label: "Given" },
  { id: "received", label: "Received" },
];

function StarInput({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          onClick={() => onChange(n)}
          style={{
            cursor: "pointer",
            fontSize: 26,
            color: n <= value ? "#f59e0b" : "#d1d5db",
          }}
        >
          ★
        </span>
      ))}
    </div>
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

function WriteReviewModal({ token, enrollments, onClose, onSaved }) {
  const [courseId, setCourseId] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!courseId) {
      setError("Please select a course.");
      return;
    }
    if (!rating) {
      setError("Please choose a star rating.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const response = await fetch(REVIEWS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ course: courseId, rating, comment }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Could not save your review.");
        setSaving(false);
        return;
      }
      onSaved(data);
    } catch (err) {
      console.error(err);
      setError("Could not reach the server. Is the backend running?");
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Write a Review</h3>
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
            {enrollments.length === 0 ? (
              <p style={{ fontSize: 13, color: "#5c6b8a" }}>
                You need to be enrolled in a course before you can review it.
              </p>
            ) : (
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #d0d5dd",
                  fontSize: 14,
                }}
              >
                <option value="">Select a course...</option>
                {enrollments.map((e) => (
                  <option key={e.course._id} value={e.course._id}>
                    {e.course.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="modal-field">
            <label>Rating</label>
            <StarInput value={rating} onChange={setRating} />
          </div>

          <div className="modal-field">
            <label>Comment (optional)</label>
            <textarea
              placeholder="What did you think of this course?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
            />
          </div>

          {error && (
            <p style={{ color: "#dc2626", fontSize: 13, marginTop: "0.5rem" }}>{error}</p>
          )}
        </div>

        <div className="modal-footer">
          <button className="modal-cancel-btn" onClick={onClose} disabled={saving}>Cancel</button>
          <button
            className="modal-publish-btn"
            onClick={handleSubmit}
            disabled={saving || enrollments.length === 0}
          >
            {saving ? "Saving..." : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Reviews({ token }) {
  const [activeTab, setActiveTab] = useState("given");
  const [given, setGiven] = useState([]);
  const [received, setReceived] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [givenRes, receivedRes, enrollmentsRes] = await Promise.all([
        fetch(`${REVIEWS_URL}/mine`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${REVIEWS_URL}/received`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(ENROLLMENTS_URL, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const givenData = await givenRes.json();
      const receivedData = await receivedRes.json();
      const enrollmentsData = await enrollmentsRes.json();

      if (givenRes.ok) setGiven(givenData);
      if (receivedRes.ok) setReceived(receivedData);
      if (enrollmentsRes.ok) setEnrollments(enrollmentsData);

      if (!givenRes.ok) setError(givenData.message || "Could not load reviews.");
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

  const handleSaved = (review) => {
    setGiven((prev) => {
      const withoutOld = prev.filter((r) => r.course?._id !== review.course?._id);
      return [review, ...withoutOld];
    });
    setShowModal(false);
  };

  const handleDelete = async (reviewId) => {
    try {
      const response = await fetch(`${REVIEWS_URL}/${reviewId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const data = await response.json();
        alert(data.message || "Could not delete the review.");
        return;
      }
      setGiven((prev) => prev.filter((r) => r._id !== reviewId));
      setReceived((prev) => prev.filter((r) => r._id !== reviewId));
    } catch (err) {
      console.error(err);
      alert("Could not reach the server. Is the backend running?");
    }
  };

  const list = activeTab === "given" ? given : received;

  return (
    <div className="ec-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
        <h2 className="db-section-title">Reviews</h2>
      </div>

      <div className="ec-tabs-header">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`ec-tab-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label} ({tab.id === "given" ? given.length : received.length})
          </button>
        ))}
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
        ) : list.length === 0 ? (
          <div className="ec-empty-state">
            <svg
              className="ec-empty-icon"
              viewBox="0 0 120 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M40 80C35 80 25 70 25 50C25 30 35 20 40 20L80 20C85 20 95 30 95 50C95 70 85 80 80 80L40 80Z" fill="#E2E5EF"/>
              <path d="M40 80C35 80 25 70 25 50C25 30 35 20 40 20L45 20C40 20 30 30 30 50C30 70 40 80 45 80L40 80Z" fill="#C8CDD8"/>
              <rect x="75" y="10" width="10" height="20" rx="2" fill="#4A60C8" transform="rotate(30 75 10)"/>
              <circle cx="10" cy="40" r="2" fill="#C8CDD8"/>
              <circle cx="20" cy="25" r="1.5" fill="#C8CDD8"/>
              <circle cx="105" cy="60" r="2.5" fill="#C8CDD8"/>
            </svg>
            <p className="ec-empty-text">No Data Available in this Section</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {list.map((review) => (
              <div
                key={review._id}
                style={{
                  background: "#fff",
                  border: "1px solid #e2e5ef",
                  borderRadius: 10,
                  padding: "1rem 1.25rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "0.5rem" }}>
                  <h4 style={{ margin: 0 }}>{review.course?.title || "Unknown course"}</h4>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 12, color: "#5c6b8a" }}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                    <button
                        onClick={() => handleDelete(review._id)}
                        title="Delete review"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#dc2626",
                          padding: 4,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                  </div>
                </div>
                <div style={{ marginTop: 6 }}>
                  <Stars rating={review.rating} />
                </div>
                {activeTab === "received" && review.student && (
                  <p style={{ fontSize: 12, color: "#5c6b8a", marginTop: 4 }}>
                    By {review.student.firstName} {review.student.lastName}
                  </p>
                )}
                {review.comment && (
                  <p style={{ marginTop: "0.5rem", marginBottom: 0, color: "#374151" }}>{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}