import React, { useState, useEffect } from "react";

const WISHLIST_URL = "http://localhost:5000/api/wishlist";

function resolveThumbnailUrl(thumbnail) {
  if (!thumbnail) return null;
  if (thumbnail.startsWith("http://") || thumbnail.startsWith("https://")) return thumbnail;
  if (thumbnail.startsWith("/uploads")) return `http://localhost:5000${thumbnail}`;
  return `http://localhost:5000/uploads/${thumbnail}`;
}

function CourseThumbnail({ thumbnail, title }) {
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
    <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="200" fill="#f0f2f8"/>
      <circle cx="100" cy="60" r="20" fill="#dce1f0"/>
      <path d="M150 200 L250 80 L350 200 Z" fill="#e2e5ef"/>
      <path d="M250 200 L320 120 L400 200 Z" fill="#dce1f0"/>
    </svg>
  );
}

function EmptyState({ text, color }) {
  return (
    <div className="ec-empty-state">
      <svg className="ec-empty-icon" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M40 80C35 80 25 70 25 50C25 30 35 20 40 20L80 20C85 20 95 30 95 50C95 70 85 80 80 80L40 80Z" fill="#E2E5EF"/>
        <path d="M40 80C35 80 25 70 25 50C25 30 35 20 40 20L45 20C40 20 30 30 30 50C30 70 40 80 45 80L40 80Z" fill="#C8CDD8"/>
        <rect x="75" y="10" width="10" height="20" rx="2" fill="#4A60C8" transform="rotate(30 75 10)"/>
        <circle cx="10" cy="40" r="2" fill="#C8CDD8"/>
        <circle cx="20" cy="25" r="1.5" fill="#C8CDD8"/>
        <circle cx="105" cy="60" r="2.5" fill="#C8CDD8"/>
      </svg>
      <p className="ec-empty-text" style={color ? { color } : undefined}>{text}</p>
    </div>
  );
}

export default function Wishlist({ token, onCourseClick }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);

  const fetchWishlist = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(WISHLIST_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Could not load your wishlist.");
        setLoading(false);
        return;
      }
      setItems(data);
    } catch (err) {
      console.error(err);
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchWishlist();
  }, [token]);

  const handleRemove = async (courseId) => {
    setRemovingId(courseId);
    try {
      const response = await fetch(`${WISHLIST_URL}/${courseId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setItems((prev) =>
          prev.filter((item) => (item.course?._id || item.course) !== courseId)
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="ec-container">
      <h2 className="db-section-title">Wishlist</h2>

      <div className="ec-tab-content">
        {loading ? (
          <EmptyState text="Loading..." />
        ) : error ? (
          <EmptyState text={error} color="#dc2626" />
        ) : items.length === 0 ? (
          <EmptyState text="No Data Available in this Section" />
        ) : (
          <div className="course-grid">
            {items.map((item) => {
              const course = item.course || {};
              return (
                <div key={item._id} className="course-card">
                  <div
                    className="course-img-placeholder"
                    style={{ position: "relative", cursor: "pointer" }}
                    onClick={() => onCourseClick?.(course)}
                  >
                    <CourseThumbnail thumbnail={course.thumbnail} title={course.title} />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(course._id);
                      }}
                      disabled={removingId === course._id}
                      title="Remove from wishlist"
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        border: "none",
                        background: "rgba(255,255,255,0.92)",
                        color: "#dc2626",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {removingId === course._id ? (
                        "…"
                      ) : (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 21s-6.716-4.35-9.428-8.06C.94 10.42 1.2 6.94 4.05 5.06c2.28-1.5 4.9-.86 6.4.9L12 7.8l1.55-1.84c1.5-1.76 4.12-2.4 6.4-.9 2.85 1.88 3.11 5.36 1.48 7.88C18.716 16.65 12 21 12 21z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  <div className="course-content">
                    <p className="course-date">{course.category}</p>
                    <h3
                      className="course-title"
                      onClick={() => onCourseClick?.(course)}
                      style={{ cursor: "pointer" }}
                    >
                      {course.title}
                    </h3>
                  </div>

                  <div className="course-footer">
                    <span className="course-price">
                      {course.price > 0 ? `Rs${course.price}` : "Free"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}