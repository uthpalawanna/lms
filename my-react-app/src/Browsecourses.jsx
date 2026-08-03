import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import CheckoutModal from "./CheckoutModal";
import { API_URL } from "./api/config";

const COURSES_URL = `${API_URL}/api/courses`;
const ENROLLMENTS_URL = `${API_URL}/api/enrollments`;
const CART_URL = `${API_URL}/api/cart`;

function resolveThumbnailUrl(thumbnail) {
  if (!thumbnail) return null;
  if (thumbnail.startsWith("http://") || thumbnail.startsWith("https://")) return thumbnail;
  if (thumbnail.startsWith("/uploads")) return `${API_URL}${thumbnail}`;
  return `${API_URL}/uploads/${thumbnail}`;
}

function CourseThumbnail({ thumbnail, title }) {
  const [failed, setFailed] = useState(false);
  const resolvedUrl = resolveThumbnailUrl(thumbnail);
  return (
    <div className="course-img-placeholder">
      {resolvedUrl && !failed ? (
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
      )}
    </div>
  );
}

export default function BrowseCourses({ token }) {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrollingId, setEnrollingId] = useState(null);
  const [message, setMessage] = useState("");
  const [checkoutCourse, setCheckoutCourse] = useState(null);
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [addingToCartId, setAddingToCartId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const PAGE_SIZE = 12;

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const requests = [fetch(`${COURSES_URL}?page=1&limit=${PAGE_SIZE}`)];
      if (token) {
        requests.push(fetch(ENROLLMENTS_URL, { headers: { Authorization: `Bearer ${token}` } }));
        requests.push(fetch(`${CART_URL}/mine`, { headers: { Authorization: `Bearer ${token}` } }));
      }
      const [coursesRes, enrollmentsRes, cartRes] = await Promise.all(requests);
      const coursesData = await coursesRes.json();

      if (!coursesRes.ok) {
        setError(coursesData.message || "Could not load courses.");
        setLoading(false);
        return;
      }
      setCourses(coursesData.courses || []);
      setTotalPages(coursesData.pages || 1);
      setPage(1);
      if (enrollmentsRes?.ok) {
        const enrollmentsData = await enrollmentsRes.json();
        setMyEnrollments(enrollmentsData);
      }
      if (cartRes?.ok) {
        const cartData = await cartRes.json();
        setCartItems(cartData);
      }
    } catch (err) {
      console.error(err);
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(`${COURSES_URL}?page=${nextPage}&limit=${PAGE_SIZE}`);
      const data = await res.json();
      if (res.ok) {
        setCourses((prev) => [...prev, ...(data.courses || [])]);
        setPage(nextPage);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const isEnrolled = (courseId) =>
    myEnrollments.some((e) => e.course?._id === courseId || e.course === courseId);

  const isInCart = (courseId) =>
    cartItems.some((item) => item.course?._id === courseId || item.course === courseId);

  const handleAddToCart = async (courseId) => {
    if (!token) {
      navigate("/signin");
      return;
    }
    setAddingToCartId(courseId);
    setMessage("");
    try {
      const response = await fetch(CART_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ course: courseId }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.message || "Could not add this course to your cart.");
        return;
      }
      setCartItems(data);
      setMessage("Added to cart! Check out from Order History.");
    } catch (err) {
      console.error(err);
      setMessage("Could not reach the server. Is the backend running?");
    } finally {
      setAddingToCartId(null);
    }
  };

  const handleEnroll = async (courseId) => {
    if (!token) {
      navigate("/signin");
      return;
    }
    const course = courses.find((c) => c._id === courseId);
    const isPaid = course && course.price > 0;

    if (isPaid) {
      
      setCheckoutError("");
      setCheckoutCourse(course);
      return;
    }

    setEnrollingId(courseId);
    setMessage("");
    try {
      const response = await fetch(ENROLLMENTS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ course: courseId }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.message || "Could not enroll in this course.");
        setEnrollingId(null);
        return;
      }
      setMyEnrollments((prev) => [...prev, data]);
      setMessage("Enrolled successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Could not reach the server. Is the backend running?");
    } finally {
      setEnrollingId(null);
    }
  };


  return (
    <div className="ec-container">
      <h2 className="db-section-title">Browse Courses</h2>

      {message && (
        <p style={{ color: message.includes("success") ? "#16a34a" : "#dc2626", fontWeight: 600 }}>
          {message}
        </p>
      )}

      <div className="ec-tab-content">
        {loading ? (
          <div className="ec-empty-state">
            <p className="ec-empty-text"><span className="db-spinner" />Loading courses...</p>
          </div>
        ) : error ? (
          <div className="ec-empty-state">
            <p className="ec-empty-text" style={{ color: "#dc2626" }}>{error}</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="ec-empty-state">
            <p className="ec-empty-text">No published courses available yet.</p>
          </div>
        ) : (
          <div className="course-grid">
            {courses.map((course) => {
              const enrolled = isEnrolled(course._id);
              return (
                <div key={course._id} className="course-card">
                  <CourseThumbnail thumbnail={course.thumbnail} title={course.title} />

                  <div className="course-content">
                    <p className="course-date">{course.category}</p>
                    <h3 className="course-title">{course.title}</h3>
                    {course.instructor && (
                      <p style={{ fontSize: 12, color: "#5c6b8a", marginTop: 4 }}>
                        By {course.instructor.firstName} {course.instructor.lastName}
                      </p>
                    )}
                  </div>

                  <div className="course-footer">
                    <span className="course-price">
                      {course.price > 0 ? `Rs${course.price}` : "Free"}
                    </span>

                    <div style={{ display: "flex", gap: 8 }}>
                      {course.price > 0 && !enrolled && (
                        <button
                          className="db-new-course-btn"
                          style={{
                            padding: "6px 14px",
                            fontSize: 13,
                            background: "transparent",
                            color: "#14b8a6",
                            border: "1px solid #14b8a6",
                          }}
                          disabled={isInCart(course._id) || addingToCartId === course._id}
                          onClick={() => handleAddToCart(course._id)}
                        >
                          {isInCart(course._id)
                            ? "In Cart"
                            : addingToCartId === course._id
                            ? "Adding…"
                            : "Add to Cart"}
                        </button>
                      )}
                      <button
                        className="db-new-course-btn"
                        style={{ padding: "6px 14px", fontSize: 13 }}
                        disabled={enrolled || enrollingId === course._id}
                        onClick={() => handleEnroll(course._id)}
                      >
                        {enrolled ? "Enrolled" : enrollingId === course._id ? "Enrolling..." : "Enroll"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {!loading && page < totalPages && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: "1.5rem" }}>
            <button
              className="db-new-course-btn"
              style={{ padding: "8px 22px" }}
              onClick={loadMore}
              disabled={loadingMore}
            >
              {loadingMore ? "Loading..." : "Load more"}
            </button>
          </div>
        )}
      </div>

      {checkoutCourse && (
        <CheckoutModal
          course={checkoutCourse}
          token={token}
          onClose={() => { setCheckoutCourse(null); setCheckoutError(""); }}
          onPaid={() => {
            setMessage("Payment successful, you're enrolled!");
            setCheckoutCourse(null);
            setCheckoutError("");
            fetchData();
          }}
          onError={(msg) => setCheckoutError(msg)}
          errorMessage={checkoutError}
        />
      )}
    </div>
  );
}