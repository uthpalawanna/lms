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

const STATS = [
  { icon: "📖", label: "Enrolled Courses", value: "0", accent: false },
  { icon: "🎓", label: "Active Courses", value: "0", accent: false },
  { icon: "🏆", label: "Completed Courses", value: "0", accent: false },
  { icon: "👥", label: "Total Students", value: "0", accent: true },
  { icon: "📚", label: "Total Courses", value: "0", accent: true },
  { icon: "💰", label: "Total Earnings", value: "Rs0.00", accent: false },
];

export default function Dashboard({ user, token, onLogout }) {
  const [active, setActive] = useState("dashboard");
  const [settingsTab, setSettingsTab] = useState("Profile");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showNewCourseModal, setShowNewCourseModal] = useState(false);

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
    (user?.firstName ? user.firstName.toUpperCase() : null) ||
    (user?.username ? user.username.toUpperCase() : null) ||
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
          {active === "my-profile" && <MyProfile />}
          {active === "enrolled-courses" && <EnrolledCourses />}
          {active === "reviews" && <Reviews />}
          {active === "wishlist" && <Wishlist />}
          {active === "quiz-attempts" && <MyQuizAttempts />}
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
            <Withdrawals onNavigateToWithdraw={handleNavigateToWithdraw} />
          )}
          {active === "quiz-inst" && <QuizAttempts />}
          {active === "settings" && <Settings initialTab={settingsTab} />}
        </main>
      </div>
    </div>
  );
}