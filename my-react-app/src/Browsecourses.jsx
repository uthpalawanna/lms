import React, { useState, useEffect } from "react";

const COURSES_URL = "http://localhost:5000/api/courses";
const ENROLLMENTS_URL = "http://localhost:5000/api/enrollments";
const CHECKOUT_URL = "http://localhost:5000/api/orders/checkout";

function resolveThumbnailUrl(thumbnail) {
  if (!thumbnail) return null;
  if (thumbnail.startsWith("http://") || thumbnail.startsWith("https://")) return thumbnail;
  if (thumbnail.startsWith("/uploads")) return `http://localhost:5000${thumbnail}`;
  return `http://localhost:5000/uploads/${thumbnail}`;
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
  const [courses, setCourses] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrollingId, setEnrollingId] = useState(null);
  const [message, setMessage] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [coursesRes, enrollmentsRes] = await Promise.all([
        fetch(COURSES_URL),
        fetch(ENROLLMENTS_URL, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const coursesData = await coursesRes.json();
      const enrollmentsData = await enrollmentsRes.json();

      if (!coursesRes.ok) {
        setError(coursesData.message || "Could not load courses.");
        setLoading(false);
        return;
      }
      setCourses(coursesData);
      if (enrollmentsRes.ok) setMyEnrollments(enrollmentsData);
    } catch (err) {
      console.error(err);
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const isEnrolled = (courseId) =>
    myEnrollments.some((e) => e.course?._id === courseId || e.course === courseId);

  const handleEnroll = async (courseId) => {
    setEnrollingId(courseId);
    setMessage("");
    const course = courses.find((c) => c._id === courseId);
    const isPaid = course && course.price > 0;
    const url = isPaid ? CHECKOUT_URL : ENROLLMENTS_URL;
    const body = isPaid ? { course: courseId, paymentMethod: "Credit Card" } : { course: courseId };
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.message || "Could not enroll in this course.");
        setEnrollingId(null);
        return;
      }
      setMyEnrollments((prev) => [...prev, isPaid ? data.enrollment : data]);
      setMessage(isPaid ? "Payment successful, you're enrolled!" : "Enrolled successfully!");
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
            <p className="ec-empty-text">Loading courses...</p>
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}