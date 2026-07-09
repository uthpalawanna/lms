import { useState, useEffect } from "react";
import "./Dashboard.css";
import MyProfile from "./myprofile";
import EnrolledCourses from "./EnrolledCourses";
import Reviews from "./reviews";
import Wishlist from "./wishlist";
import MyQuizAttempts from "./myquizattempts";
import OrderHistory from "./orderhistory";
import QuestionAnswer from "./QuestionAnswer";
import MyCourses from "./MyCourses";
import CourseDetails from "./CourseDetail";
import InstructorProfile from "./InstructorProfile";
import Announcements from "./Announcements";
import Withdrawals from "./Withdrawals";
import QuizAttempts from "./QuizAttempts";
import Settings from "./Settings";

const ENROLLMENTS_URL = "http://localhost:5000/api/enrollments";
const INSTRUCTOR_STATS_URL = "http://localhost:5000/api/courses/mine/stats";

const SIDEBAR_MAIN = [
  { id: "dashboard", icon: "📊", label: "Dashboard" },
  { id: "my-profile", icon: "👤", label: "My Profile" },
  { id: "enrolled-courses", icon: "🎓", label: "Enrolled Courses" },
  { id: "reviews", icon: "⭐", label: "Reviews" },
  { id: "quiz-attempts", icon: "🧩", label: "My Quiz Attempts" },
  { id: "wishlist", icon: "🔖", label: "Wishlist" },
  { id: "order-history", icon: "🛒", label: "Order History" },
  { id: "question-answer", icon: "💬", label: "Question & Answer" },
];

const SIDEBAR_INSTRUCTOR = [
  { id: "my-courses", icon: "🚀", label: "My Courses" },
  { id: "announcements", icon: "📢", label: "Announcements" },
  { id: "withdrawals", icon: "💼", label: "Withdrawals" },
  { id: "quiz-inst", icon: "❓", label: "Quiz Attempts" },
];

const SIDEBAR_BOTTOM = [
  { id: "settings", icon: "⚙️", label: "Settings" },
  { id: "logout", icon: "🚪", label: "Logout" },
];

export default function Dashboard({ user, token, onLogout }) {
  const [currentUser, setCurrentUser] = useState(user);
  const [active, setActive] = useState("dashboard");
  const [settingsTab, setSettingsTab] = useState("Profile");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showNewCourseModal, setShowNewCourseModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [statsLoading, setStatsLoading] = useState(true);
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [activeCount, setActiveCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalCourses, setTotalCourses] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  useEffect(() => {
    if (!isMobile) setDrawerOpen(false);
  }, [isMobile]);

  const fetchDashboardStats = async () => {
    if (!token) return;
    setStatsLoading(true);
    try {
      if (currentUser?.role === "admin") {
        const instructorRes = await fetch(INSTRUCTOR_STATS_URL, { headers: { Authorization: `Bearer ${token}` } });
        if (instructorRes.ok) {
          const stats = await instructorRes.json();
          setTotalStudents(stats.totalStudents || 0);
          setTotalCourses(stats.totalCourses || 0);
          setTotalEarnings(stats.totalRevenue || 0);
        }
      } else {
        const enrollRes = await fetch(ENROLLMENTS_URL, { headers: { Authorization: `Bearer ${token}` } });
        if (enrollRes.ok) {
          const enrollments = await enrollRes.json();
          setEnrolledCount(enrollments.length);
          setActiveCount(enrollments.filter((e) => e.status === "active").length);
          setCompletedCount(enrollments.filter((e) => e.status === "completed").length);
          setEnrolledCourses(enrollments);
        }
      }
    } catch (err) {
      console.error("Could not load dashboard stats:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (active === "dashboard" && token) {
      fetchDashboardStats();
    }
  }, [active, token]);

  const STUDENT_STATS = [
    {
      icon: "📖",
      label: "Enrolled Courses",
      value: statsLoading ? "…" : String(enrolledCount),
      accent: false,
    },
    {
      icon: "🎓",
      label: "Active Courses",
      value: statsLoading ? "…" : String(activeCount),
      accent: false,
    },
    {
      icon: "🏆",
      label: "Completed Courses",
      value: statsLoading ? "…" : String(completedCount),
      accent: false,
    },
  ];

  const INSTRUCTOR_STATS = [
    {
      icon: "👥",
      label: "Total Students",
      value: statsLoading ? "…" : String(totalStudents),
      accent: true,
    },
    {
      icon: "📚",
      label: "Total Courses",
      value: statsLoading ? "…" : String(totalCourses),
      accent: true,
    },
    {
      icon: "💰",
      label: "Total Earnings",
      value: statsLoading ? "…" : `Rs${totalEarnings.toFixed(2)}`,
      accent: false,
    },
  ];

  const STATS =
    currentUser?.role === "admin" ? INSTRUCTOR_STATS : STUDENT_STATS;

  const handleNav = (id) => {
    if (id === "logout") {
      setDrawerOpen(false);
      onLogout?.();
      return;
    }
    setActive(id);
    if (id === "settings") setSettingsTab("Profile");
    setDrawerOpen(false);
  };

  const handleNavigateToWithdraw = () => {
    setSettingsTab("Withdraw");
    setActive("settings");
    setDrawerOpen(false);
  };

  const handleNewCourseClick = () => {
    setActive("my-courses");
    setShowNewCourseModal(true);
    setDrawerOpen(false);
  };

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setActive("course-details");
  };

  const handleOpenFromDashboard = async (courseId) => {
    if (!courseId || !token) return;
    try {
      const response = await fetch(`http://localhost:5000/api/courses/${courseId}`);
      const data = await response.json();
      if (response.ok) handleCourseClick(data);
    } catch (err) {
      console.error("Could not open course:", err);
    }
  };

  const displayName =
    (currentUser?.firstName ? currentUser.firstName.toUpperCase() : null) ||
    (currentUser?.username ? currentUser.username.toUpperCase() : null) ||
    "USER";
  const avatarLetter = displayName.charAt(0);

  const SidebarContent = () => (
    <>
      {(currentUser?.role === "admin"
        ? SIDEBAR_MAIN.filter((item) => ["dashboard", "reviews", "question-answer"].includes(item.id))
        : SIDEBAR_MAIN
      ).map(({ id, icon, label }) => (
        <button
          key={id}
          className={`db-sidebar-item${active === id ? " active" : ""}`}
          onClick={() => handleNav(id)}
        >
          <span className="db-si-icon">{icon}</span>
          {label}
        </button>
      ))}

      {currentUser?.role === "admin" && (
        <>
          <div className="db-sidebar-divider" />
          <div className="db-sidebar-section-label">Instructor</div>

          {SIDEBAR_INSTRUCTOR.map(({ id, icon, label }) => (
            <button
              key={id}
              className={`db-sidebar-item${active === id ? " active" : ""}`}
              onClick={() => handleNav(id)}
            >
              <span className="db-si-icon">{icon}</span>
              {label}
            </button>
          ))}
        </>
      )}

      <div className="db-sidebar-divider" />

      {SIDEBAR_BOTTOM.map(({ id, icon, label }) => (
        <button
          key={id}
          className={`db-sidebar-item${active === id ? " active" : ""}`}
          onClick={() => handleNav(id)}
        >
          <span className="db-si-icon">{icon}</span>
          {label}
        </button>
      ))}
    </>
  );

  return (
    <div className="db-page">

      <div className="db-profile-bar">
        <div className="db-profile-left">
          {isMobile && (
            <button className="db-hamburger" onClick={() => setDrawerOpen(true)}>
              ☰
            </button>
          )}
          <div className="db-avatar">{avatarLetter}</div>
          <div>
            <div className="db-username">{displayName}</div>
            <div className="db-stars">
              {[1,2,3,4,5].map((i) => (
                <span key={i} className="db-star">☆</span>
              ))}
            </div>
          </div>
        </div>
        {currentUser?.role === "admin" && (
          <button className="db-new-course-btn" onClick={handleNewCourseClick}>＋ New Course</button>
        )}
      </div>

      <hr className="db-divider" />

      {isMobile && (
        <>
          <div
            className={`db-drawer-overlay${drawerOpen ? " open" : ""}`}
            onClick={() => setDrawerOpen(false)}
          />
          <aside className={`db-drawer${drawerOpen ? " open" : ""}`}>
            <div className="db-drawer-header">
              <div className="db-avatar" style={{ width: 36, height: 36, fontSize: 16 }}>{avatarLetter}</div>
              <span style={{ fontWeight: 600, fontSize: 14, marginLeft: 10 }}>{displayName}</span>
              <button className="db-drawer-close" onClick={() => setDrawerOpen(false)}>✕</button>
            </div>
            <div className="db-drawer-body">
              <SidebarContent />
            </div>
          </aside>
        </>
      )}

      <div className="db-body">
        {!isMobile && (
          <aside className="db-sidebar">
            <SidebarContent />
          </aside>
        )}

        <main className="db-main">
          {active === "dashboard" && (
            <>
              <h2 className="db-section-title">Dashboard</h2>
              <div className="db-stats-grid">
                {STATS.map(({ icon, label, value, accent }) => (
                  <div key={label} className="db-stat-card">
                    <div className="db-stat-icon-wrap">{icon}</div>
                    <div className={`db-stat-value${accent ? " accent" : ""}`}>{value}</div>
                    <div className={`db-stat-label${accent ? " accent" : ""}`}>{label}</div>
                  </div>
                ))}
              </div>

              {currentUser?.role !== "admin" && !statsLoading && enrolledCourses.length > 0 && (
                <>
                  <h3 style={{ fontSize: 14, fontWeight: 600, margin: "1.5rem 0 0.75rem" }}>
                    Continue learning
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {enrolledCourses.map((enrollment) => (
                      <div
                        key={enrollment._id}
                        onClick={() =>
                          enrollment.course?._id && handleOpenFromDashboard(enrollment.course._id)
                        }
                        style={{
                          background: "#fff",
                          border: "1px solid #e2e5ef",
                          borderRadius: 10,
                          padding: "12px 14px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          cursor: enrollment.course ? "pointer" : "default",
                        }}
                      >
                        <div>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>
                            {enrollment.course?.title || "Untitled course"}
                          </p>
                          <p style={{ margin: "2px 0 0", fontSize: 11, color: "#6b7280" }}>
                            {enrollment.progress}% complete · {enrollment.status}
                          </p>
                        </div>
                        <div style={{ width: 70, height: 5, background: "#e2e5ef", borderRadius: 4 }}>
                          <div
                            style={{
                              width: `${enrollment.progress}%`,
                              height: 5,
                              background: "#3d56c8",
                              borderRadius: 4,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
          {active === "my-profile" && (
            <MyProfile token={token} onProfileUpdate={setCurrentUser} />
          )}
          {active === "enrolled-courses" && (
            <EnrolledCourses token={token} user={currentUser} onCourseClick={handleCourseClick} />
          )}
          {active === "reviews" && <Reviews token={token} />}
          {active === "wishlist" && (
            <Wishlist token={token} onCourseClick={handleCourseClick} />
          )}
          {active === "quiz-attempts" && <MyQuizAttempts token={token} />}
          {active === "order-history" && <OrderHistory token={token} />}
          {active === "question-answer" && <QuestionAnswer token={token} user={currentUser} />}
          {active === "my-courses" && (
            <MyCourses
              token={token}
              user={currentUser}
              onCourseClick={handleCourseClick}
              showModal={showNewCourseModal}
              setShowModal={setShowNewCourseModal}
            />
          )}
          {active === "course-details" && (
            <CourseDetails
              course={selectedCourse}
              token={token}
              user={currentUser}
              onBack={() => setActive("my-courses")}
              onAuthorClick={() => setActive("instructor-profile")}
            />
          )}
          {active === "instructor-profile" && (
            <InstructorProfile
              user={currentUser}
              token={token}
              onNewCourse={handleNewCourseClick}
              onEditProfile={() => setActive("my-profile")}
            />
          )}
          {active === "announcements" && <Announcements token={token} />}
          {active === "withdrawals" && (
            <Withdrawals token={token} onNavigateToWithdraw={handleNavigateToWithdraw} />
          )}
          {active === "quiz-inst" && <QuizAttempts token={token} />}
          {active === "settings" && (
            <Settings
              token={token}
              initialTab={settingsTab}
              onProfileUpdate={setCurrentUser}
            />
          )}
        </main>
      </div>
    </div>
  );
}