import React, { useState, useEffect } from "react";

const BALANCE_URL = "http://localhost:5000/api/withdrawals/balance";
const WITHDRAWALS_URL = "http://localhost:5000/api/withdrawals";

function MailboxIcon() {
  return (
    <svg width="220" height="160" viewBox="0 0 220 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="110" cy="148" rx="100" ry="10" fill="#eef0f8" />
      <rect x="55" y="95" width="14" height="50" rx="2" fill="#dfe3ee" />
      <rect x="148" y="95" width="14" height="50" rx="2" fill="#dfe3ee" />
      <rect x="90" y="100" width="14" height="45" rx="2" fill="#dfe3ee" />
      <rect x="120" y="100" width="10" height="45" rx="2" fill="#dfe3ee" />

      <g>
        <path
          d="M60 95C60 75 75 60 100 60H140C155 60 165 70 165 85V95H60Z"
          fill="#e2e5ef"
        />
        <rect x="60" y="95" width="105" height="14" rx="3" fill="#d3d8e6" />
        <circle cx="150" cy="102" r="3" fill="#9aa3bd" />
      </g>

      <g>
        <line x1="40" y1="45" x2="60" y2="60" stroke="#c8cdd8" strokeWidth="2" strokeLinecap="round" />
        <circle cx="38" cy="42" r="3" fill="#c8cdd8" />
      </g>

      <g transform="rotate(18 175 70)">
        <rect x="160" y="40" width="32" height="40" rx="3" fill="#fff" stroke="#dfe3ee" strokeWidth="2" />
        <polygon points="175,38 160,52 192,52" fill="#4A60C8" />
      </g>
    </svg>
  );
}

function statusColor(status) {
  switch (status) {
    case "approved":
    case "paid":
      return "#16a34a";
    case "rejected":
      return "#dc2626";
    default:
      return "#d97706"; 
  }
}

export default function Withdrawals({ token, onNavigateToWithdraw }) {
  const [available, setAvailable] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [balanceRes, listRes] = await Promise.all([
        fetch(BALANCE_URL, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${WITHDRAWALS_URL}/mine`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (balanceRes.ok) {
        const data = await balanceRes.json();
        setAvailable(data.available || 0);
        setTotalRevenue(data.totalRevenue || 0);
        setTotalWithdrawn(data.totalWithdrawn || 0);
      }
      if (listRes.ok) {
        const data = await listRes.json();
        setWithdrawals(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [token]);

  const formattedBalance = loading ? "…" : `Rs${available.toFixed(2)}`;
  const hasBalance = !loading && available > 0;

  return (
    <div className="ec-container">
      <h2 className="db-section-title">Withdrawals</h2>

      <div className="withdraw-balance-card">
        <div className="withdraw-wallet-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4a60c8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
            <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
            <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
          </svg>
        </div>
        <div>
          <p className="withdraw-balance-label">Current Balance is {formattedBalance}</p>
          <p className="withdraw-balance-main">
            You have <strong>{formattedBalance}</strong>
            {hasBalance ? " available to withdraw" : " and this is insufficient balance to withdraw"}
          </p>
          {!loading && (
            <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
              Total earned: Rs{totalRevenue.toFixed(2)} · Already withdrawn: Rs{totalWithdrawn.toFixed(2)}
            </p>
          )}
        </div>
      </div>

      <div className="withdraw-info-row">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        <span>
          You can change your{" "}
          <span
            className="withdraw-pref-link"
            role="link"
            tabIndex={0}
            onClick={onNavigateToWithdraw}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onNavigateToWithdraw?.();
            }}
            style={{ cursor: "pointer" }}
          >
            Withdraw Preference
          </span>
        </span>
      </div>

      {loading ? (
        <div className="withdraw-empty-state">
          <p className="withdraw-empty-text">Loading...</p>
        </div>
      ) : withdrawals.length === 0 ? (
        <div className="withdraw-empty-state">
          <MailboxIcon />
          <p className="withdraw-empty-text">No Data Available in this Section</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
          {withdrawals.map((w) => (
            <div
              key={w._id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#fff",
                border: "1px solid #e2e5ef",
                borderRadius: 10,
                padding: "1rem 1.25rem",
              }}
            >
              <div>
                <p style={{ margin: 0, fontWeight: 600 }}>Rs{w.amount.toFixed(2)}</p>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#5c6b8a", textTransform: "capitalize" }}>
                  {w.method} · {new Date(w.createdAt).toLocaleDateString()}
                </p>
                {w.notes && (
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "#9ca3af" }}>{w.notes}</p>
                )}
              </div>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: 12,
                  textTransform: "uppercase",
                  color: statusColor(w.status),
                }}
              >
                {w.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}