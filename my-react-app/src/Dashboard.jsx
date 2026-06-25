import { useState } from "react";
import "./Dashboard.css";

const SIDEBAR_MAIN = [
  { id: "dashboard",        icon: "📊", label: "Dashboard" },
  { id: "my-profile",       icon: "👤", label: "My Profile" },
  { id: "enrolled-courses", icon: "🎓", label: "Enrolled Courses" },
  { id: "reviews",          icon: "⭐", label: "Reviews" },
  { id: "quiz-attempts",    icon: "🧩", label: "My Quiz Attempts" },
  { id: "wishlist",         icon: "🔖", label: "Wishlist" },
  { id: "order-history",    icon: "🛒", label: "Order History" },
  { id: "qa",               icon: "💬", label: "Question & Answer" },
];

const SIDEBAR_INSTRUCTOR = [
  { id: "my-courses",    icon: "🚀", label: "My Courses" },
  { id: "announcements", icon: "📢", label: "Announcements" },
  { id: "withdrawals",   icon: "💼", label: "Withdrawals" },
  { id: "quiz-inst",     icon: "❓", label: "Quiz Attempts" },
];

const SIDEBAR_BOTTOM = [
  { id: "settings", icon: "⚙️", label: "Settings" },
  { id: "logout",   icon: "🚪", label: "Logout"   },
];

const STATS = [
  { icon: "📖", label: "Enrolled Courses",  value: "0",      accent: false },
  { icon: "🎓", label: "Active Courses",    value: "0",      accent: false },
  { icon: "🏆", label: "Completed Courses", value: "0",      accent: false },
  { icon: "👥", label: "Total Students",    value: "0",      accent: true  },
  { icon: "📚", label: "Total Courses",     value: "0",      accent: true  },
  { icon: "💰", label: "Total Earnings",    value: "Rs0.00", accent: false },
];

export default function Dashboard() {
  const [active, setActive] = useState("dashboard");

  return (
    <div className="db-page">

      <div className="db-profile-bar">
        <div className="db-profile-left">
          <div className="db-avatar">D</div>
          <div>
            <div className="db-username">DINESHAN</div>
            <div className="db-stars">
              {[1, 2, 3, 4, 5].map(i => (
                <span key={i} className="db-star">☆</span>
              ))}
            </div>
          </div>
        </div>
        <button className="db-new-course-btn">＋ New Course</button>
      </div>

      <hr className="db-divider" />

      <div className="db-body">

        <aside className="db-sidebar">

          {SIDEBAR_MAIN.map(({ id, icon, label }) => (
            <button
              key={id}
              className={`db-sidebar-item${active === id ? " active" : ""}`}
              onClick={() => setActive(id)}
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
              onClick={() => setActive(id)}
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
              onClick={() => setActive(id)}
            >
              <span className="db-si-icon">{icon}</span>
              {label}
            </button>
          ))}

        </aside>

        <main className="db-main">
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
        </main>

      </div>
    </div>
  );
}