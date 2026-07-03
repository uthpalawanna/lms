import React, { useState, useEffect } from "react";

export default function Wishlist({ token }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/wishlist", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        setItems(data);
      } catch (err) {
        console.error("Failed to fetch wishlist:", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchWishlist();
  }, [token]);

  const handleRemove = async (courseId) => {
    try {
      await fetch(`http://localhost:5000/api/wishlist/${courseId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems((prev) => prev.filter((item) => item.course._id !== courseId));
    } catch (err) {
      console.error("Failed to remove item:", err);
    }
  };

  return (
    <div className="ec-container">
      <h2 className="db-section-title">Wishlist</h2>

      <div className="ec-tab-content">
        {loading ? (
          <div className="ec-empty-state"><p>Loading...</p></div>
        ) : items.length === 0 ? (
          <div className="ec-empty-state">
            <svg className="ec-empty-icon" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M40 80C35 80 25 70 25 50C25 30 35 20 40 20L80 20C85 20 95 30 95 50C95 70 85 80 80 80L40 80Z" fill="#E2E5EF"/>
              <path d="M40 80C35 80 25 70 25 50C25 30 35 20 40 20L45 20C40 20 30 30 30 50C30 70 40 80 45 80L40 80Z" fill="#C8CDD8"/>
              <rect x="75" y="10" width="10" height="20" rx="2" fill="#4A60C8" transform="rotate(30 75 10)"/>
            </svg>
            <p className="ec-empty-text">No Data Available in this Section</p>
          </div>
        ) : (
          <div className="course-grid">
            {items.map((item) => (
              <div key={item._id} className="course-card">
                <div className="course-content">
                  <h3 className="course-title">{item.course.title}</h3>
                </div>
                <div className="course-footer">
                  <button 
                    className="db-new-course-btn" 
                    onClick={() => handleRemove(item.course._id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}