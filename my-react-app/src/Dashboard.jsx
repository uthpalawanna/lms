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

const ENROLLMENTS_URL = "http://localhost:5000/api/enrollments";
const INSTRUCTOR_STATS_URL = "http://localhost:5000/api/courses/mine/stats";

export default function Dashboard({ user, token, onLogout }) {
  const [currentUser, setCurrentUser] = useState(user);
  const [active, setActive] = useState("dashboard");
  const [settingsTab, setSettingsTab] = useState("Profile");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showNewCourseModal, setShowNewCourseModal] = useState(false);
  const [stats, setStats] = useState({
    enrolled: 0,
    active: 0,
    completed: 0,
    totalCourses: 0,
    totalStudents: 0,
    totalEarnings: 0,
    loading: true,
  });

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    async function loadStats() {
      try {
        const [enrollRes, instructorStatsRes] = await Promise.all([
          fetch(ENROLLMENTS_URL, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(INSTRUCTOR_STATS_URL, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const enrollments = enrollRes.ok ? await enrollRes.json() : [];
        const instructorStats = instructorStatsRes.ok
          ? await instructorStatsRes.json()
          : { totalCourses: 0, totalStudents: 0, totalEarnings: 0 };

        if (cancelled) return;
        setStats({
          enrolled: Array.isArray(enrollments) ? enrollments.length : 0,
          active: Array.isArray(enrollments)
            ? enrollments.filter((e) => e.status === "active").length
            : 0,
          completed: Array.isArray(enrollments)
            ? enrollments.filter((e) => e.status === "completed").length
            : 0,
          totalCourses: instructorStats.totalCourses || 0,
          totalStudents: instructorStats.totalStudents || 0,
          totalEarnings: instructorStats.totalEarnings || 0,
          loading: false,
        });
      } catch (err) {
        console.error(err);
        if (!cancelled) setStats((prev) => ({ ...prev, loading: false }));
      }
    }

    loadStats();
    return () => {
      cancelled = true;
    };
  }, [token, active]);

  const STATS = [
    { icon: "📖", label: "Enrolled Courses", value: stats.loading ? "…" : String(stats.enrolled), accent: false },
    { icon: "🎓", label: "Active Courses", value: stats.loading ? "…" : String(stats.active), accent: false },
    { icon: "🏆", label: "Completed Courses", value: stats.loading ? "…" : String(stats.completed), accent: false },
    { icon: "👥", label: "Total Students", value: stats.loading ? "…" : String(stats.totalStudents), accent: true },
    { icon: "📚", label: "Total Courses", value: stats.loading ? "…" : String(stats.totalCourses), accent: true },
    { icon: "💰", label: "Total Earnings", value: stats.loading ? "…" : `Rs${stats.totalEarnings.toFixed(2)}`, accent: false },
  ];

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  useEffect(() => {
    if (!isMobile) setDrawerOpen(false);
  }, [isMobile]);

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

  const displayName =
    (currentUser?.firstName ? currentUser.firstName.toUpperCase() : null) ||
    (currentUser?.username ? currentUser.username.toUpperCase() : null) ||
    "USER";
  const avatarLetter = displayName.charAt(0);

  const SidebarContent = () => (
    <>
      {SIDEBAR_MAIN.map(({ id, icon, label }) => (
        <button
          key={id}
          className={`db-sidebar-item${active === id ? " active" : ""}`}
          onClick={() => handleNav(id)}
        >
          <span className="db-si-icon">{icon}</span>
          {label}
        </button>
      ))}

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
        <button className="db-new-course-btn" onClick={handleNewCourseClick}>＋ New Course</button>
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
            </>
          )}
          {active === "my-profile" && (
            <MyProfile token={token} onProfileUpdate={setCurrentUser} />
          )}
          {active === "enrolled-courses" && <EnrolledCourses token={token} />}
          {active === "reviews" && <Reviews token={token} />}
          {active === "wishlist" && <Wishlist />}
          {active === "quiz-attempts" && <MyQuizAttempts token={token} />}
          {active === "order-history" && <OrderHistory />}
          {active === "question-answer" && <QuestionAnswer />}
          {active === "my-courses" && (
            <MyCourses
              token={token}
              onCourseClick={() => setActive("course-details")}
              showModal={showNewCourseModal}
              setShowModal={setShowNewCourseModal}
            />
          )}
          {active === "course-details" && (
            <CourseDetails
              onBack={() => setActive("my-courses")}
              onAuthorClick={() => setActive("instructor-profile")}
            />
          )}
          {active === "instructor-profile" && <InstructorProfile />}
          {active === "announcements" && <Announcements token={token} />}
          {active === "withdrawals" && (
            <Withdrawals token={token} onNavigateToWithdraw={handleNavigateToWithdraw} />
          )}
          {active === "quiz-inst" && <QuizAttempts token={token} />}
          {active === "settings" && <Settings initialTab={settingsTab} />}
        </main>
      </div>
    </div>
  );
}