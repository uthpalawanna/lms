import React, { useState, useEffect, useCallback } from "react";

const ADMIN_URL = "http://localhost:5000/api/admin";

const ROLE_STYLES = {
  admin: "bg-purple-100 text-purple-700",
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [statsRes, usersRes, coursesRes, withdrawalsRes] = await Promise.all([
        fetch(`${ADMIN_URL}/stats`, { headers: authHeaders }),
        fetch(`${ADMIN_URL}/users`, { headers: authHeaders }),
        fetch(`${ADMIN_URL}/courses`, { headers: authHeaders }),
        fetch(`${ADMIN_URL}/withdrawals`, { headers: authHeaders }),
      ]);
      if (statsRes.status === 403 || usersRes.status === 403) {
        setError("Admin access required.");
        return;
      }
      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      const coursesData = await coursesRes.json();
      const withdrawalsData = await withdrawalsRes.json();
      if (statsRes.ok) setStats(statsData);
      if (usersRes.ok) setUsers(usersData);
      if (coursesRes.ok) setCourses(coursesData);
      if (withdrawalsRes.ok) setWithdrawals(withdrawalsData);
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
            </div>

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
                                <option value="admin">admin</option>
                              </select>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-[13px] text-slate-500">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-3">
                            {u._id !== currentUserId && (
                              <button
                                onClick={() => handleDeleteUser(u._id, `${u.firstName} ${u.lastName}`)}
                                disabled={busyId === u._id}
                                className="text-red-600 text-[12px] font-semibold bg-transparent border-none cursor-pointer"
                              >
                                {busyId === u._id ? "..." : "Delete"}
                              </button>
                            )}
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
              ) : (
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
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}