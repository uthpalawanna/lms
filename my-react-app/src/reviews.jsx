import React, { useState, useEffect } from "react";
import { API_URL } from "./api/config";

const REVIEWS_URL = `${API_URL}/api/reviews`;

function Stars({ rating }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} style={{ color: n <= rating ? "#f59e0b" : "#d1d5db", fontSize: 15 }}>★</span>
      ))}
    </span>
  );
}

export default function Reviews({ token }) {
  const [received, setReceived] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const receivedRes = await fetch(`${REVIEWS_URL}/received`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const receivedData = await receivedRes.json();

      if (receivedRes.ok) {
        setReceived(receivedData);
      } else {
        setError(receivedData.message || "Could not load reviews.");
      }
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
      setReceived((prev) => prev.filter((r) => r._id !== reviewId));
    } catch (err) {
      console.error(err);
      alert("Could not reach the server. Is the backend running?");
    }
  };

  return (
    <div className="ec-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
        <h2 className="db-section-title">Reviews</h2>
      </div>

      <div className="ec-tab-content" style={{ marginTop: "1rem" }}>
        {loading ? (
          <div className="ec-empty-state">
            <p className="ec-empty-text">Loading...</p>
          </div>
        ) : error ? (
          <div className="ec-empty-state">
            <p className="ec-empty-text" style={{ color: "#dc2626" }}>{error}</p>
          </div>
        ) : received.length === 0 ? (
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
            {received.map((review) => (
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
                {review.student && (
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