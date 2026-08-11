import React, { useState, useEffect, useCallback } from "react";
import { API_URL } from "./api/config";

const ADMIN_URL = `${API_URL}/api/admin`;
const ENROLLMENTS_URL = `${API_URL}/api/enrollments`;

const ROLE_STYLES = {
  admin: "bg-purple-100 text-purple-700",
  instructor: "bg-blue-100 text-blue-700",
  student: "bg-gray-100 text-gray-600",
};

function RolePill({ role }) {
  return (
    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full capitalize ${ROLE_STYLES[role] || ROLE_STYLES.student}`}>
      {role}
    </span>
  );
}

function StatCard({ label, value, loading }) {
  return (
    <div className="bg-white border border-[#e2e5ef] rounded-[10px] px-4 py-3.5">
      <p className="m-0 text-[13px] text-slate-500">{label}</p>
      <p className="mt-1 mb-0 text-2xl font-bold text-gray-900">{loading ? "…" : value}</p>
    </div>
  );
}

export default function AdminDashboard({ token, currentUserId, onLogout }) {
  const [tab, setTab] = useState("users");

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [pendingEnrollments, setPendingEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [manualEnrollStudent, setManualEnrollStudent] = useState("");
  const [manualEnrollCourse, setManualEnrollCourse] = useState("");
  const [manualEnrollBusy, setManualEnrollBusy] = useState(false);
  const [manualEnrollMessage, setManualEnrollMessage] = useState("");

  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [statsRes, usersRes, coursesRes, withdrawalsRes, pendingEnrollRes] = await Promise.all([
        fetch(`${ADMIN_URL}/stats`, { headers: authHeaders }),
        fetch(`${ADMIN_URL}/users`, { headers: authHeaders }),
        fetch(`${ADMIN_URL}/courses`, { headers: authHeaders }),
        fetch(`${ADMIN_URL}/withdrawals`, { headers: authHeaders }),
        fetch(`${ENROLLMENTS_URL}/pending`, { headers: authHeaders }),
      ]);
      if (statsRes.status === 403 || usersRes.status === 403) {
        setError("Admin access required.");
        return;
      }
      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      const coursesData = await coursesRes.json();
      const withdrawalsData = await withdrawalsRes.json();
      const pendingEnrollData = await pendingEnrollRes.json();
      if (statsRes.ok) setStats(statsData);
      if (usersRes.ok) setUsers(usersData);
      if (coursesRes.ok) setCourses(coursesData);
      if (withdrawalsRes.ok) setWithdrawals(withdrawalsData);
      if (pendingEnrollRes.ok) setPendingEnrollments(pendingEnrollData);
    } catch (err) {
      console.error(err);
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchAll();
  }, [token, fetchAll]);

  const handleRoleChange = async (userId, newRole) => {
    setBusyId(userId);
    try {
      const res = await fetch(`${ADMIN_URL}/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Could not update role.");
        return;
      }
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
    } catch (err) {
      console.error(err);
      alert("Could not reach the server.");
    } finally {
      setBusyId(null);
    }
  };

  const handleResetPassword = async (userId, name) => {
    if (!window.confirm(`Generate a temporary password for "${name}"? Their current password will stop working immediately.`)) return;
    setBusyId(userId);
    try {
      const res = await fetch(`${ADMIN_URL}/users/${userId}/reset-password`, {
        method: "PUT",
        headers: authHeaders,
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Could not reset the user's password.");
        return;
      }
      // Shown once — the backend never stores or re-sends the plain
      // password after this. Copy it before closing this dialog.
      window.prompt(
        `Temporary password for ${data.email} (copy this now — it won't be shown again):`,
        data.tempPassword
      );
    } catch (err) {
      console.error(err);
      alert("Could not reach the server.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteUser = async (userId, name) => {
    if (!window.confirm(`Delete "${name}" permanently? This also removes their enrollments, reviews, and (if they're an admin) their courses.`)) return;
    setBusyId(userId);
    try {
      const res = await fetch(`${ADMIN_URL}/users/${userId}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u._id !== userId));
      } else {
        const data = await res.json();
        alert(data.message || "Could not delete user.");
      }
    } catch (err) {
      console.error(err);
      alert("Could not reach the server.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteCourse = async (courseId, title) => {
    if (!window.confirm(`Delete "${title}" permanently?`)) return;
    setBusyId(courseId);
    try {
      const res = await fetch(`${ADMIN_URL}/courses/${courseId}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      if (res.ok) {
        setCourses((prev) => prev.filter((c) => c._id !== courseId));
      } else {
        const data = await res.json();
        alert(data.message || "Could not delete course.");
      }
    } catch (err) {
      console.error(err);
      alert("Could not reach the server.");
    } finally {
      setBusyId(null);
    }
  };

  const handleWithdrawalStatus = async (withdrawalId, status) => {
    setBusyId(withdrawalId);
    try {
      const res = await fetch(`${ADMIN_URL}/withdrawals/${withdrawalId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Could not update withdrawal.");
        return;
      }
      setWithdrawals((prev) => prev.map((w) => (w._id === withdrawalId ? { ...w, status } : w)));
    } catch (err) {
      console.error(err);
      alert("Could not reach the server.");
    } finally {
      setBusyId(null);
    }
  };

  const handleEnrollmentDecision = async (enrollmentId, decision) => {
    if (decision === "reject") {
      const reason = window.prompt("Reason for rejecting this request (optional):") || "";
      if (reason === null) return; // user hit Cancel
      setBusyId(enrollmentId);
      try {
        const res = await fetch(`${ENROLLMENTS_URL}/${enrollmentId}/reject`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...authHeaders },
          body: JSON.stringify({ reason }),
        });
        const data = await res.json();
        if (!res.ok) {
          alert(data.message || "Could not reject the enrollment request.");
          return;
        }
        setPendingEnrollments((prev) => prev.filter((e) => e._id !== enrollmentId));
      } catch (err) {
        console.error(err);
        alert("Could not reach the server.");
      } finally {
        setBusyId(null);
      }
      return;
    }

    setBusyId(enrollmentId);
    try {
      const res = await fetch(`${ENROLLMENTS_URL}/${enrollmentId}/approve`, {
        method: "PUT",
        headers: authHeaders,
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Could not approve the enrollment request.");
        return;
      }
      setPendingEnrollments((prev) => prev.filter((e) => e._id !== enrollmentId));
    } catch (err) {
      console.error(err);
      alert("Could not reach the server.");
    } finally {
      setBusyId(null);
    }
  };

  const handleManualEnroll = async (e) => {
    e.preventDefault();
    if (!manualEnrollStudent || !manualEnrollCourse) return;

    setManualEnrollBusy(true);
    setManualEnrollMessage("");
    try {
      const res = await fetch(`${ENROLLMENTS_URL}/admin-enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ student: manualEnrollStudent, course: manualEnrollCourse }),
      });
      const data = await res.json();
      if (!res.ok) {
        setManualEnrollMessage(data.message || "Could not enroll the student.");
        return;
      }
      setManualEnrollMessage("Student enrolled successfully.");
      setManualEnrollStudent("");
      setManualEnrollCourse("");
      // If that student had a pending request for this course, it's now
      // resolved — drop it from the pending list without a full refetch.
      setPendingEnrollments((prev) =>
        prev.filter((p) => !(p.student?._id === manualEnrollStudent && p.course?._id === manualEnrollCourse))
      );
    } catch (err) {
      console.error(err);
      setManualEnrollMessage("Could not reach the server.");
    } finally {
      setManualEnrollBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eef0f8]">
      <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-[#e2e5ef]">
        <h1 className="text-lg font-bold m-0">Admin Panel</h1>
        <button className="db-new-course-btn" onClick={onLogout}>
          Logout
        </button>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {error ? (
          <p className="text-red-600 font-semibold">{error}</p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
              <StatCard label="Total Users" value={stats?.totalUsers ?? 0} loading={loading} />
              <StatCard label="Instructors" value={stats?.totalInstructors ?? 0} loading={loading} />
              <StatCard label="Total Courses" value={stats?.totalCourses ?? 0} loading={loading} />
              <StatCard label="Published" value={stats?.publishedCourses ?? 0} loading={loading} />
              <StatCard label="Enrollments" value={stats?.totalEnrollments ?? 0} loading={loading} />
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setTab("users")}
                className={`text-[13px] px-4 py-2 rounded-full border transition ${
                  tab === "users"
                    ? "bg-[#eef0fb] border-[#c7d2fe] text-[#3d56c8] font-semibold"
                    : "bg-white border-[#e2e5ef] text-slate-500"
                }`}
              >
                Users ({users.length})
              </button>
              <button
                onClick={() => setTab("courses")}
                className={`text-[13px] px-4 py-2 rounded-full border transition ${
                  tab === "courses"
                    ? "bg-[#eef0fb] border-[#c7d2fe] text-[#3d56c8] font-semibold"
                    : "bg-white border-[#e2e5ef] text-slate-500"
                }`}
              >
                Courses ({courses.length})
              </button>
              <button
                onClick={() => setTab("withdrawals")}
                className={`text-[13px] px-4 py-2 rounded-full border transition ${
                  tab === "withdrawals"
                    ? "bg-[#eef0fb] border-[#c7d2fe] text-[#3d56c8] font-semibold"
                    : "bg-white border-[#e2e5ef] text-slate-500"
                }`}
              >
                Withdrawals ({withdrawals.length})
              </button>
              <button
                onClick={() => setTab("enrollments")}
                className={`text-[13px] px-4 py-2 rounded-full border transition ${
                  tab === "enrollments"
                    ? "bg-[#eef0fb] border-[#c7d2fe] text-[#3d56c8] font-semibold"
                    : "bg-white border-[#e2e5ef] text-slate-500"
                }`}
              >
                Enrollment Requests ({pendingEnrollments.length})
              </button>
            </div>

            {tab === "enrollments" && (
              <form
                onSubmit={handleManualEnroll}
                className="bg-white border border-[#e2e5ef] rounded-[10px] p-5 mb-4 flex flex-wrap items-end gap-3"
              >
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] text-slate-500 font-semibold">Student</label>
                  <select
                    value={manualEnrollStudent}
                    onChange={(e) => setManualEnrollStudent(e.target.value)}
                    className="text-sm border border-[#e2e5ef] rounded-lg px-3 py-2 min-w-[220px]"
                    required
                  >
                    <option value="">Select a student…</option>
                    {users
                      .filter((u) => u.role === "student")
                      .map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.firstName} {u.lastName} ({u.email})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[12px] text-slate-500 font-semibold">Course</label>
                  <select
                    value={manualEnrollCourse}
                    onChange={(e) => setManualEnrollCourse(e.target.value)}
                    className="text-sm border border-[#e2e5ef] rounded-lg px-3 py-2 min-w-[220px]"
                    required
                  >
                    <option value="">Select a course…</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.title} {c.price > 0 ? `(Rs${Number(c.price).toFixed(2)})` : "(Free)"}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={manualEnrollBusy || !manualEnrollStudent || !manualEnrollCourse}
                  className="text-sm font-semibold text-white bg-[#3d56c8] rounded-lg px-4 py-2 disabled:opacity-50"
                >
                  {manualEnrollBusy ? "Enrolling…" : "Enroll without payment"}
                </button>

                {manualEnrollMessage && (
                  <span
                    className={`text-[13px] ${
                      manualEnrollMessage.includes("successfully") ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {manualEnrollMessage}
                  </span>
                )}
              </form>
            )}

            <div className="bg-white border border-[#e2e5ef] rounded-[10px] overflow-hidden">
              {loading ? (
                <p className="text-center py-12 text-slate-400">Loading...</p>
              ) : tab === "users" ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse min-w-[640px]">
                    <thead>
                      <tr className="border-b border-[#eef0f8]">
                        {["Name", "Email", "Role", "Joined", ""].map((h) => (
                          <th key={h} className="text-left px-5 py-3 text-[13px] text-slate-500 font-semibold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id} className="border-b border-[#f3f4f9] last:border-b-0">
                          <td className="px-5 py-3 text-sm">
                            {u.firstName} {u.lastName}
                          </td>
                          <td className="px-5 py-3 text-sm text-slate-500">{u.email}</td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <RolePill role={u.role} />
                              <select
                                value={u.role}
                                disabled={busyId === u._id || u._id === currentUserId}
                                onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                className="text-[12px] border border-[#dfe2ec] rounded-md px-1.5 py-1"
                              >
                                <option value="student">student</option>
                                <option value="instructor">instructor</option>
                                <option value="admin">admin</option>
                              </select>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-[13px] text-slate-500">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleResetPassword(u._id, `${u.firstName} ${u.lastName}`)}
                                disabled={busyId === u._id}
                                className="text-[#16a085] text-[12px] font-semibold bg-transparent border-none cursor-pointer"
                              >
                                {busyId === u._id ? "..." : "Reset Password"}
                              </button>
                              {u._id !== currentUserId && (
                                <button
                                  onClick={() => handleDeleteUser(u._id, `${u.firstName} ${u.lastName}`)}
                                  disabled={busyId === u._id}
                                  className="text-red-600 text-[12px] font-semibold bg-transparent border-none cursor-pointer"
                                >
                                  {busyId === u._id ? "..." : "Delete"}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : tab === "courses" ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse min-w-[640px]">
                    <thead>
                      <tr className="border-b border-[#eef0f8]">
                        {["Title", "Instructor", "Status", "Price", ""].map((h) => (
                          <th key={h} className="text-left px-5 py-3 text-[13px] text-slate-500 font-semibold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((c) => (
                        <tr key={c._id} className="border-b border-[#f3f4f9] last:border-b-0">
                          <td className="px-5 py-3 text-sm">{c.title}</td>
                          <td className="px-5 py-3 text-sm text-slate-500">
                            {c.instructor?.firstName} {c.instructor?.lastName}
                          </td>
                          <td className="px-5 py-3 text-sm capitalize text-slate-500">{c.status}</td>
                          <td className="px-5 py-3 text-sm text-slate-500">
                            {c.price > 0 ? `Rs${c.price}` : "Free"}
                          </td>
                          <td className="px-5 py-3">
                            <button
                              onClick={() => handleDeleteCourse(c._id, c.title)}
                              disabled={busyId === c._id}
                              className="text-red-600 text-[12px] font-semibold bg-transparent border-none cursor-pointer"
                            >
                              {busyId === c._id ? "..." : "Delete"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : tab === "withdrawals" ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse min-w-[720px]">
                    <thead>
                      <tr className="border-b border-[#eef0f8]">
                        {["Instructor", "Amount", "Method", "Status", "Requested", ""].map((h) => (
                          <th key={h} className="text-left px-5 py-3 text-[13px] text-slate-500 font-semibold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawals.map((w) => (
                        <tr key={w._id} className="border-b border-[#f3f4f9] last:border-b-0">
                          <td className="px-5 py-3 text-sm">
                            {w.instructor?.firstName} {w.instructor?.lastName}
                          </td>
                          <td className="px-5 py-3 text-sm">Rs{w.amount.toFixed(2)}</td>
                          <td className="px-5 py-3 text-sm text-slate-500 capitalize">{w.method}</td>
                          <td className="px-5 py-3 text-sm capitalize">{w.status}</td>
                          <td className="px-5 py-3 text-[13px] text-slate-500">
                            {new Date(w.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-3">
                            {w.status === "pending" && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleWithdrawalStatus(w._id, "approved")}
                                  disabled={busyId === w._id}
                                  className="text-[#3d56c8] text-[12px] font-semibold bg-transparent border-none cursor-pointer"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleWithdrawalStatus(w._id, "rejected")}
                                  disabled={busyId === w._id}
                                  className="text-red-600 text-[12px] font-semibold bg-transparent border-none cursor-pointer"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                            {w.status === "approved" && (
                              <button
                                onClick={() => handleWithdrawalStatus(w._id, "paid")}
                                disabled={busyId === w._id}
                                className="text-green-600 text-[12px] font-semibold bg-transparent border-none cursor-pointer"
                              >
                                Mark paid
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : pendingEnrollments.length === 0 ? (
                <p className="text-center py-12 text-slate-400">No pending enrollment requests.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse min-w-[640px]">
                    <thead>
                      <tr className="border-b border-[#eef0f8]">
                        {["Student", "Course", "Requested", ""].map((h) => (
                          <th key={h} className="text-left px-5 py-3 text-[13px] text-slate-500 font-semibold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pendingEnrollments.map((e) => (
                        <tr key={e._id} className="border-b border-[#f3f4f9] last:border-b-0">
                          <td className="px-5 py-3 text-sm">
                            {e.student?.firstName} {e.student?.lastName}
                            <div className="text-[12px] text-slate-400">{e.student?.email}</div>
                          </td>
                          <td className="px-5 py-3 text-sm text-slate-500">{e.course?.title}</td>
                          <td className="px-5 py-3 text-[13px] text-slate-500">
                            {new Date(e.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEnrollmentDecision(e._id, "approve")}
                                disabled={busyId === e._id}
                                className="text-[#3d56c8] text-[12px] font-semibold bg-transparent border-none cursor-pointer"
                              >
                                {busyId === e._id ? "..." : "Approve"}
                              </button>
                              <button
                                onClick={() => handleEnrollmentDecision(e._id, "reject")}
                                disabled={busyId === e._id}
                                className="text-red-600 text-[12px] font-semibold bg-transparent border-none cursor-pointer"
                              >
                                {busyId === e._id ? "..." : "Reject"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}