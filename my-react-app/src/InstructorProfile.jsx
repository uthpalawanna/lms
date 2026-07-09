const S = {
  wrap: 
  { fontFamily: "system-ui, sans-serif" },

  banner: 
  { width: "100%", 
    height: 200, 
    background: "#1a0636", 
    position: "relative", 
    overflow: "hidden" },

  belowBanner: 
  { position: "relative", 
    background: "#fff", 
    borderRadius: 16, 
    border: "1px solid #e5e7eb", 
    paddingTop: 60 },

  avatarWrap: 
  { position: "absolute", 
    top: -48, 
    left: 28 },

  avatar: 
  { width: 96, 
    height: 96, 
    borderRadius: "50%", 
    background: "#4c1d95", 
    border: "4px solid #fff", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    overflow: "hidden" },

  avatarText: 
  { fontSize: 32, 
    fontWeight: 700, 
    color: "#c4b5fd" },

  nameRow: 
  { display: "flex", 
    alignItems: "center", 
    justifyContent: "space-between", 
    padding: "0 28px 20px" },

  nameBlock: 
  { flex: 1 },

  name: 
  { fontSize: 22, 
    fontWeight: 700, 
    color: "#111827", 
    margin: 0 },

  badge: 
  { display: "inline-block", 
    background: "#ede9fe", 
    color: "#6d28d9", 
    fontSize: 10, 
    fontWeight: 700, 
    padding: "2px 10px", 
    borderRadius: 20, 
    marginTop: 6, 
    letterSpacing: 1, 
    textTransform: "uppercase" },

  btnRow: 
  { display: "flex", 
    gap: 8 },

  btnOutline: 
  { background: "#f5f3ff", 
    color: "#6d28d9", 
    border: "1px solid #ddd6fe", 
    borderRadius: 8, padding: "8px 16px", 
    fontSize: 13, 
    fontWeight: 600, 
    cursor: "pointer" },

  btnPrimary: 
  { background: "#6d28d9", 
    color: "#fff", 
    border: "none", 
    borderRadius: 8, 
    padding: "8px 16px", 
    fontSize: 13, 
    fontWeight: 600, 
    cursor: "pointer" },

  statsBar: 
  { display: "flex", 
    borderTop: "1px solid #f3f4f6", 
    borderBottom: "1px solid #f3f4f6" },

  stat: 
  { flex: 1, 
    textAlign: "center", 
    padding: "16px 0", 
    borderRight: "1px solid #f3f4f6" },

  statLast: 
  { flex: 1, 
    textAlign: "center", 
    padding: "16px 0" },

  statNum: 
  { fontSize: 22, 
    fontWeight: 700, 
    color: "#111827", 
    margin: 0 },

  statLabel: 
  { fontSize: 11,
    color: "#9ca3af", 
    textTransform: "uppercase", 
    letterSpacing: 1, 
    marginTop: 4, 
    margin: "4px 0 0" },

  content: 
  { padding: "24px 28px" },

  sectionLabel: 
  { fontSize: 11, 
    fontWeight: 700, 
    color: "#9ca3af", 
    textTransform: "uppercase", 
    letterSpacing: 2, 
    marginBottom: 12, 
    margin: "0 0 12px" },

  emptyBox: 
  { background: "#f9fafb", 
    borderRadius: 12, 
    border: "1.5px dashed #e5e7eb", 
    padding: "28px 20px", 
    textAlign: "center" },

  emptyIcon: 
  { fontSize: 28, 
    marginBottom: 8, 
    opacity: 0.5 },

  emptyText: 
  { fontSize: 13, 
    color: "#9ca3af", 
    margin: 0 },

  emptyCta: 
  { marginTop: 12, 
    display: "inline-block", 
    background: "#6d28d9", 
    color: "#fff", 
    fontSize: 12, 
    fontWeight: 600, 
    padding: "7px 18px", 
    borderRadius: 8, 
    border: "none", 
    cursor: "pointer" },

  divider: 
  { height: 1, 
    background: "#f3f4f6", 
    margin: "20px 0", 
    border: "none" },

  starFilled: 
  { color: "#f59e0b", 
    fontSize: 15 },

  starEmpty: 
  { color: "#d1d5db", 
    fontSize: 15 },

  courseGrid: 
  { display: "grid", 
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", 
    gap: 16 },

  courseCard: 
  { background: "#fff", 
    borderRadius: 12, 
    border: "1px solid #e5e7eb", 
    padding: 16 },
};

function BannerSVG() {
  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      viewBox="0 0 800 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="rg1" cx="30%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#4c1d95" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#1a0636" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="rg2" cx="78%" cy="35%" r="50%">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#1a0636" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="800" height="200" fill="#1a0636" />
      <rect width="800" height="200" fill="url(#rg1)" />
      <rect width="800" height="200" fill="url(#rg2)" />
      <circle cx="160" cy="90" r="120" fill="none" stroke="#7c3aed" strokeWidth="0.8" opacity="0.45" />
      <circle cx="160" cy="90" r="75" fill="none" stroke="#7c3aed" strokeWidth="0.5" opacity="0.35" />
      <circle cx="160" cy="90" r="38" fill="#2e0f6e" opacity="0.75" />
      <circle cx="630" cy="65" r="150" fill="none" stroke="#6d28d9" strokeWidth="0.8" opacity="0.35" />
      <circle cx="630" cy="65" r="95" fill="none" stroke="#6d28d9" strokeWidth="0.5" opacity="0.28" />
      <circle cx="630" cy="65" r="52" fill="#2e0f6e" opacity="0.55" />
      <text x="28" y="40" fontSize="11" fill="#a78bfa" opacity="0.45" fontFamily="monospace"> </text>
    </svg>
  );
}

function Stars({ rating = 0 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2, justifyContent: "center" }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={i <= Math.floor(rating) ? S.starFilled : S.starEmpty}>★</span>
      ))}
      <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: 4 }}>{Number(rating).toFixed(2)}</span>
    </div>
  );
}

function Empty({ icon, text, cta, onClick }) {
  return (
    <div style={S.emptyBox}>
      <div style={S.emptyIcon}>{icon}</div>
      <p style={S.emptyText}>{text}</p>
      {cta && <button style={S.emptyCta} onClick={onClick}>{cta}</button>}
    </div>
  );
}

export default function InstructorProfile({ user = {}, onNewCourse, onEditProfile, onAddBio }) {
  const name =
    user.name ||
    user.username ||
    user.full_name ||
    user.fullName ||
    (user.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : null) ||
    (user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : null) ||
    "Instructor";

  const avatarUrl = user.avatarUrl || user.avatar || user.profile_picture || user.photo || null;
  const courseCount = user.courseCount ?? user.course_count ?? 0;
  const studentCount = user.studentCount ?? user.student_count ?? 0;
  const reviewCount = user.reviewCount ?? user.review_count ?? 0;
  const rating = user.rating ?? user.average_rating ?? 0;
  const bio = user.bio || user.biography || user.about || "";
  const courses = user.courses || [];

  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div style={S.wrap}>

      <div style={S.banner}>
        <BannerSVG />
      </div>

      <div style={S.belowBanner}>

        <div style={S.avatarWrap}>
          <div style={S.avatar}>
            {avatarUrl
              ? <img src={avatarUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <span style={S.avatarText}>{initials}</span>
            }
          </div>
        </div>

        <div style={S.nameRow}>
          <div style={S.nameBlock}>
            <h1 style={S.name}>{name}</h1>
            <span style={S.badge}>Instructor</span>
          </div>
          <div style={S.btnRow}>
            <button style={S.btnOutline} onClick={onEditProfile}>Edit profile</button>
            <button style={S.btnPrimary} onClick={onNewCourse}>+ New course</button>
          </div>
        </div>

        <div style={S.statsBar}>
          <div style={S.stat}>
            <p style={S.statNum}>{courseCount}</p>
            <p style={S.statLabel}>Courses</p>
          </div>
          <div style={S.stat}>
            <p style={S.statNum}>{studentCount}</p>
            <p style={S.statLabel}>Students</p>
          </div>
          <div style={S.stat}>
            <Stars rating={rating} />
            <p style={S.statLabel}>Rating</p>
          </div>
          <div style={S.statLast}>
            <p style={S.statNum}>{reviewCount}</p>
            <p style={S.statLabel}>Reviews</p>
          </div>
        </div>

        <div style={S.content}>
          <p style={S.sectionLabel}>Biography</p>
          {bio
            ? <p style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.7 }}>{bio}</p>
            : <Empty icon="✍️" text="No bio added yet. Tell students about yourself." cta="Add bio" onClick={onAddBio} />
          }

          <hr style={S.divider} />

          <p style={S.sectionLabel}>Courses</p>
          {courses.length > 0
            ? <div style={S.courseGrid}>
                {courses.map(c => (
                  <div key={c.id} style={S.courseCard}>
                    <p style={{ fontWeight: 600, fontSize: 14, color: "#111827", margin: 0 }}>{c.title}</p>
                    <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 8 }}>{c.studentCount ?? c.student_count ?? 0} students</p>
                  </div>
                ))}
              </div>
            : <Empty icon="📚" text="You haven't created any courses yet." cta="Create first course" onClick={onNewCourse} />
          }
        </div>
      </div>
    </div>
  );
}