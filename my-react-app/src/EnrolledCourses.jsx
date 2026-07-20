import React, { useState, useEffect } from "react";
import CheckoutModal from "./CheckoutModal";
import "./Dashboard.css";

const COURSES_URL = "http://localhost:5000/api/courses";
const ENROLLMENTS_URL = "http://localhost:5000/api/enrollments";
const CHECKOUT_URL = "http://localhost:5000/api/orders/checkout";

const TABS = [
  { id: "browse", label: "Browse Courses" },
  { id: "all", label: "Enrolled Courses" },
  { id: "active", label: "Active Courses" },
  { id: "completed", label: "Completed Courses" },
];

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

export default function EnrolledCourses({ token, user, onCourseClick }) {
  const [activeTab, setActiveTab] = useState("browse");

  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrollingId, setEnrollingId] = useState(null);
  const [unenrollingId, setUnenrollingId] = useState(null);
  const [openingId, setOpeningId] = useState(null);
  const [message, setMessage] = useState("");
  const [checkoutCourse, setCheckoutCourse] = useState(null);
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const fetchAll = async () => {
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
      if (enrollmentsRes.ok) setEnrollments(enrollmentsData);
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

  const isEnrolled = (courseId) =>
    enrollments.some((e) => e.course?._id === courseId || e.course === courseId);

  const handleEnroll = async (courseId) => {
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
      setEnrollments((prev) => [...prev, data]);
      setMessage("Enrolled successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Could not reach the server. Is the backend running?");
    } finally {
      setEnrollingId(null);
    }
  };

  const handleCheckoutConfirm = async (paymentDetails) => {
    if (!checkoutCourse) return;
    setCheckoutSubmitting(true);
    setCheckoutError("");
    try {
      const response = await fetch(CHECKOUT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ course: checkoutCourse._id, ...paymentDetails }),
      });
      const data = await response.json();
      if (!response.ok) {
        setCheckoutError(data.message || "Payment failed.");
        setCheckoutSubmitting(false);
        return;
      }
      setEnrollments((prev) => [...prev, data.enrollment]);
      setMessage("Payment successful, you're enrolled!");
      setCheckoutCourse(null);
    } catch (err) {
      console.error(err);
      setCheckoutError("Could not reach the server. Is the backend running?");
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  const handleUnenroll = async (enrollmentId, courseTitle) => {
    const confirmed = window.confirm(
      `Unenroll from "${courseTitle}"? Your progress on this course will be lost.`
    );
    if (!confirmed) return;

    setUnenrollingId(enrollmentId);
    try {
      const response = await fetch(`${ENROLLMENTS_URL}/${enrollmentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setEnrollments((prev) => prev.filter((e) => e._id !== enrollmentId));
      } else {
        const data = await response.json();
        alert(data.message || "Could not unenroll from this course.");
      }
    } catch (err) {
      console.error(err);
      alert("Could not reach the server. Is the backend running?");
    } finally {
      setUnenrollingId(null);
    }
  };

  const handleOpenEnrolledCourse = async (courseId) => {
    if (!courseId) return;
    setOpeningId(courseId);
    try {
      const response = await fetch(`${COURSES_URL}/${courseId}`);
      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "Could not open this course.");
        return;
      }
      onCourseClick?.(data);
    } catch (err) {
      console.error(err);
      alert("Could not reach the server. Is the backend running?");
    } finally {
      setOpeningId(null);
    }
  };

  const visibleEnrollments =
    activeTab === "all" ? enrollments : enrollments.filter((e) => e.status === activeTab);

  return (
    <div className="ec-container">
      <h2 className="db-section-title">
        {TABS.find((t) => t.id === activeTab)?.label}
      </h2>

      <div className="ec-tabs-header">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`ec-tab-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "browse" && message && (
        <p style={{ color: message.includes("success") ? "#16a34a" : "#dc2626", fontWeight: 600 }}>
          {message}
        </p>
      )}

      <div className="ec-tab-content">
        {loading ? (
          <EmptyState text="Loading..." />
        ) : error ? (
          <EmptyState text={error} color="#dc2626" />
        ) : activeTab === "browse" ? (
          courses.length === 0 ? (
            <EmptyState text="No published courses available yet." />
          ) : (
            <div className="course-grid">
              {courses.map((course) => {
                const enrolled = isEnrolled(course._id);
                return (
                  <div key={course._id} className="course-card">
                    <div onClick={() => onCourseClick?.(course)} style={{ cursor: "pointer" }}>
                      <CourseThumbnail thumbnail={course.thumbnail} title={course.title} />
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
                      {course.instructor && (
                        <p style={{ fontSize: 12, color: "#5c6b8a", marginTop: 4 }}>
                          By {course.instructor.firstName} {course.instructor.lastName}
                        </p>
                      )}
                    </div>

                    <div className="course-footer" style={{ gap: 8 }}>
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
          )
        ) : visibleEnrollments.length === 0 ? (
          <EmptyState text="No Data Available in this Section" />
        ) : (
          <div className="course-grid">
            {visibleEnrollments.map((enrollment) => {
              const courseId = enrollment.course?._id;
              const isOpening = openingId === courseId;
              return (
                <div key={enrollment._id} className="course-card">
                  <div
                    onClick={() => handleOpenEnrolledCourse(courseId)}
                    style={{ cursor: "pointer" }}
                  >
                    <CourseThumbnail
                      thumbnail={enrollment.course?.thumbnail}
                      title={enrollment.course?.title}
                    />
                  </div>
                  <div className="course-content">
                    <p className="course-date">{enrollment.course?.category}</p>
                    <h3
                      className="course-title"
                      onClick={() => handleOpenEnrolledCourse(courseId)}
                      style={{ cursor: "pointer" }}
                    >
                      {isOpening ? "Opening..." : enrollment.course?.title}
                    </h3>
                  </div>
                  <div className="course-footer" style={{ flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <span className="course-price">{enrollment.progress}% complete</span>
                      <span style={{ fontSize: 12, color: "#5c6b8a", textTransform: "capitalize", marginLeft: 8 }}>
                        {enrollment.status}
                      </span>
                    </div>
                    <button
                      onClick={() => handleUnenroll(enrollment._id, enrollment.course?.title)}
                      disabled={unenrollingId === enrollment._id}
                      style={{
                        background: "none",
                        border: "1px solid #fca5a5",
                        color: "#dc2626",
                        borderRadius: 6,
                        padding: "5px 12px",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {unenrollingId === enrollment._id ? "Removing..." : "Unenroll"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {checkoutCourse && (
        <CheckoutModal
          course={checkoutCourse}
          onClose={() => { setCheckoutCourse(null); setCheckoutError(""); }}
          onConfirm={handleCheckoutConfirm}
          submitting={checkoutSubmitting}
          errorMessage={checkoutError}
        />
      )}
    </div>
  );
}