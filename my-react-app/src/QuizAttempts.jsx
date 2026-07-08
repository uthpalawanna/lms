import React, { useState, useEffect, useCallback, useRef } from "react";

const COURSES_MINE_URL = "http://localhost:5000/api/courses/mine";
const RECEIVED_ATTEMPTS_URL = "http://localhost:5000/api/quiz-attempts/received";
const COURSE_ATTEMPTS_URL = "http://localhost:5000/api/quiz-attempts/course";

const AVATAR_COLORS = [
  { bg: "#eef0fb", text: "#3d56c8" },
  { bg: "#e1f5ee", text: "#0f6e56" },
  { bg: "#fbeaf0", text: "#993556" },
  { bg: "#faeeda", text: "#854f0b" },
  { bg: "#eeedfe", text: "#534ab7" },
  { bg: "#e6f1fb", text: "#185fa5" },
];

function avatarColor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) % 997;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function initials(student) {
  const first = student?.firstName?.[0] || "";
  const last = student?.lastName?.[0] || "";
  return (first + last).toUpperCase() || "?";
}

function NoDataIllustration() {
  return (
    <svg width="140" height="120" viewBox="0 0 140 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="45" cy="55" rx="30" ry="18" fill="#EEF0F8" />
      <ellipse cx="70" cy="45" rx="22" ry="14" fill="#EEF0F8" />
      <rect x="52" y="35" width="40" height="55" rx="4" fill="#ffffff" stroke="#DCE1F0" strokeWidth="2" />
      <rect x="60" y="46" width="24" height="3" rx="1.5" fill="#C8CDD8" />
      <rect x="60" y="55" width="24" height="3" rx="1.5" fill="#C8CDD8" />
      <rect x="60" y="64" width="16" height="3" rx="1.5" fill="#C8CDD8" />
      <circle cx="95" cy="88" r="14" fill="none" stroke="#4A60C8" strokeWidth="4" />
      <line x1="105" y1="98" x2="115" y2="108" stroke="#4A60C8" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function ResultPill({ percentage }) {
  const passed = percentage >= 50;
  return (
    <span
      className={`text-xs font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap ${
        passed ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
      }`}
    >
      {passed ? "Passed" : "Failed"}
    </span>
  );
}

function ScoreBar({ score, totalQuestions, percentage }) {
  const passed = percentage >= 50;
  return (
    <div className="flex items-center gap-2 min-w-[110px]">
      <div className="flex-1 h-[5px] rounded-full bg-[#eef0f8] overflow-hidden">
        <div
          className={`h-full rounded-full ${passed ? "bg-green-500" : "bg-red-500"}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-slate-500 shrink-0 font-semibold">
        {score}/{totalQuestions}
      </span>
    </div>
  );
}

function CourseSearchSelect({ courses, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef(null);

  const selectedLabel =
    value === "all" ? "All courses" : courses.find((c) => c._id === value)?.title || "All courses";

  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (id) => {
    onChange(id);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 bg-white border border-[#dfe2ec] rounded-lg px-3 py-2 text-[13px] text-gray-900 cursor-pointer hover:border-indigo-300 transition max-w-[220px]"
      >
        <span className="truncate">{selectedLabel}</span>
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className="shrink-0">
          <path d="M5 8l5 5 5-5" stroke="#6b7280" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-[calc(100%+6px)] left-0 w-[240px] bg-white border border-[#dfe2ec] rounded-lg shadow-lg z-20 overflow-hidden">
          <div className="p-2.5 border-b border-[#eef0f8]">
            <div className="flex items-center gap-2 border border-[#dfe2ec] rounded-md px-3 py-2">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="shrink-0">
                <circle cx="9" cy="9" r="6" stroke="#9ca3af" strokeWidth="1.6" />
                <line x1="14" y1="14" x2="18" y2="18" stroke="#9ca3af" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <input
                autoFocus
                type="text"
                placeholder="Search ..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="border-none outline-none text-sm w-full"
              />
            </div>
          </div>

          <div className="max-h-[220px] overflow-y-auto">
            <div
              onClick={() => handleSelect("all")}
              className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-[#f5f6fb] ${
                value === "all" ? "bg-[#eef0f8]" : ""
              }`}
            >
              All courses
            </div>

            {filtered.length === 0 ? (
              <div className="px-4 py-2.5 text-sm text-slate-500">No course found</div>
            ) : (
              filtered.map((c) => (
                <div
                  key={c._id}
                  onClick={() => handleSelect(c._id)}
                  className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-[#f5f6fb] ${
                    value === c._id ? "bg-[#eef0f8]" : ""
                  }`}
                >
                  {c.title}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function InstructorQuizAttempts({ token }) {
  const [courses, setCourses] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [courseFilter, setCourseFilter] = useState("all");
  const [sortBy, setSortBy] = useState("DESC");
  const [createDate, setCreateDate] = useState("");

  useEffect(() => {
    if (!token) return;
    fetch(COURSES_MINE_URL, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setCourses(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Failed to load courses:", err));
  }, [token]);

  const fetchAttempts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const url =
        courseFilter === "all"
          ? RECEIVED_ATTEMPTS_URL
          : `${COURSE_ATTEMPTS_URL}/${courseFilter}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Could not load quiz attempts.");
        setAttempts([]);
        return;
      }
      setAttempts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, [token, courseFilter]);

  useEffect(() => {
    if (token) fetchAttempts();
  }, [token, fetchAttempts]);

  let visible = [...attempts];
  if (createDate) {
    visible = visible.filter(
      (a) => a.createdAt && new Date(a.createdAt).toISOString().slice(0, 10) === createDate
    );
  }
  visible.sort((a, b) => {
    const diff = new Date(a.createdAt) - new Date(b.createdAt);
    return sortBy === "ASC" ? diff : -diff;
  });

  const totalAttempts = attempts.length;
  const passCount = attempts.filter((a) => (a.percentage || 0) >= 50).length;
  const passRate = totalAttempts === 0 ? 0 : Math.round((passCount / totalAttempts) * 100);
  const averageScore =
    totalAttempts === 0
      ? 0
      : Math.round(attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / totalAttempts);
  const uniqueStudents = new Set(
    attempts.map((a) => a.student?._id || a.student).filter(Boolean)
  ).size;

  const filtersActive = courseFilter !== "all" || createDate !== "";

  const clearFilters = () => {
    setCourseFilter("all");
    setCreateDate("");
  };

  const STATS = [
    { label: "Total Attempts", value: String(totalAttempts) },
    {
      label: "Pass Rate",
      value: totalAttempts ? `${passRate}%` : "—",
      highlight: totalAttempts > 0 && passRate >= 50,
    },
    { label: "Average Score", value: totalAttempts ? `${averageScore}%` : "—" },
    { label: "Students", value: String(uniqueStudents) },
  ];

  return (
    <div className="ec-container">
      <h2 className="db-section-title">Quiz Attempts</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {STATS.map((s) => (
          <div key={s.label} className="bg-white border border-[#e2e5ef] rounded-[10px] px-4 py-3.5">
            <p className="m-0 text-[13px] text-slate-500">{s.label}</p>
            <p
              className={`mt-1 mb-0 text-2xl font-bold ${
                s.highlight ? "text-green-600" : "text-gray-900"
              }`}
            >
              {loading ? "…" : s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2.5 mb-4">
        <CourseSearchSelect courses={courses} value={courseFilter} onChange={setCourseFilter} />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-white border border-[#dfe2ec] rounded-lg px-3 py-2 text-[13px] text-gray-900 cursor-pointer hover:border-indigo-300 transition"
        >
          <option value="DESC">Newest first</option>
          <option value="ASC">Oldest first</option>
        </select>

        <input
          type="date"
          value={createDate}
          onChange={(e) => setCreateDate(e.target.value)}
          className={`bg-white border border-[#dfe2ec] rounded-lg px-3 py-[7px] text-[13px] cursor-pointer hover:border-indigo-300 transition ${
            createDate ? "text-gray-900" : "text-slate-400"
          }`}
        />

        {filtersActive && (
          <button
            onClick={clearFilters}
            className="text-[13px] text-[#3d56c8] font-semibold bg-transparent border-none cursor-pointer hover:underline px-1"
          >
            Clear filters
          </button>
        )}

        {!loading && !error && (
          <span className="text-xs text-slate-400 ml-auto">
            {visible.length} result{visible.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="bg-white border border-[#e2e5ef] rounded-[10px] min-h-[340px] flex flex-col overflow-hidden">
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-16">
            <p className="text-slate-400">Loading...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center py-16">
            <p className="text-red-600 font-semibold">{error}</p>
          </div>
        ) : visible.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-14 px-4">
            <NoDataIllustration />
            {filtersActive ? (
              <>
                <p className="mt-4 mb-0 text-[15px] font-bold text-gray-900">
                  No results match your filters
                </p>
                <p className="mt-1.5 mb-0 text-[13px] text-slate-500 max-w-[340px] text-center">
                  Try a different course or date, or clear the filters to see everything.
                </p>
                <button
                  onClick={clearFilters}
                  className="db-new-course-btn mt-3.5"
                >
                  Clear Filters
                </button>
              </>
            ) : (
              <>
                <p className="mt-4 mb-0 text-[15px] font-bold text-gray-900">No attempts yet</p>
                <p className="mt-1.5 mb-0 text-[13px] text-slate-500 max-w-[340px] text-center">
                  Results appear here once students start taking quizzes in your courses.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[680px]">
              <thead>
                <tr className="border-b border-[#eef0f8]">
                  {["Student", "Course", "Quiz", "Score", "Result", "Date"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3.5 text-[13px] text-slate-500 font-semibold"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((a) => {
                  const name = `${a.student?.firstName || ""} ${a.student?.lastName || ""}`.trim() || "Unknown";
                  const color = avatarColor(name);
                  return (
                    <tr key={a._id} className="border-b border-[#f3f4f9] last:border-b-0 hover:bg-[#fafbfe]">
                      <td className="px-5 py-3.5 text-sm">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                            style={{ background: color.bg, color: color.text }}
                          >
                            {initials(a.student)}
                          </div>
                          <span className="truncate">{name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-500">{a.course?.title || "—"}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-500">{a.quiz?.title || "—"}</td>
                      <td className="px-5 py-3.5">
                        <ScoreBar
                          score={a.score}
                          totalQuestions={a.totalQuestions}
                          percentage={a.percentage}
                        />
                      </td>
                      <td className="px-5 py-3.5">
                        <ResultPill percentage={a.percentage} />
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-slate-500 whitespace-nowrap">
                        {a.createdAt
                          ? new Date(a.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}