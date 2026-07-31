import React, { useState, useEffect } from "react";
import { API_URL } from "./api/config";

const BALANCE_URL = `${API_URL}/api/withdrawals/balance`;
const WITHDRAWALS_URL = `${API_URL}/api/withdrawals`;

function MailboxIcon() {
  return (
    <svg width="200" height="150" viewBox="0 0 220 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="110" cy="148" rx="100" ry="10" fill="var(--surface-alt)" />
      <rect x="55" y="95" width="14" height="50" rx="2" fill="var(--border)" />
      <rect x="148" y="95" width="14" height="50" rx="2" fill="var(--border)" />
      <rect x="90" y="100" width="14" height="45" rx="2" fill="var(--border)" />
      <rect x="120" y="100" width="10" height="45" rx="2" fill="var(--border)" />

      <g>
        <path d="M60 95C60 75 75 60 100 60H140C155 60 165 70 165 85V95H60Z" fill="var(--navy-light)" opacity="0.18" />
        <rect x="60" y="95" width="105" height="14" rx="3" fill="var(--navy-light)" opacity="0.28" />
        <circle cx="150" cy="102" r="3" fill="var(--navy-light)" />
      </g>

      <g className="withdraw-empty-flag">
        <line x1="40" y1="45" x2="60" y2="60" stroke="var(--border)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="38" cy="42" r="3" fill="var(--border)" />
      </g>

      <g className="withdraw-empty-envelope" transform="rotate(18 175 70)">
        <rect x="160" y="40" width="32" height="40" rx="3" fill="#fff" stroke="var(--border)" strokeWidth="2" />
        <polygon points="175,38 160,52 192,52" fill="var(--primary)" />
      </g>
    </svg>
  );
}

function statusColor(status) {
  switch (status) {
    case "approved":
    case "paid":
      return "success";
    case "rejected":
      return "danger";
    default:
      return "pending";
  }
}

export default function Withdrawals({ token, onNavigateToWithdraw }) {
  const [available, setAvailable] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bank");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formMessage, setFormMessage] = useState("");

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

  const handleRequestWithdrawal = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormMessage("");

    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) {
      setFormError("Enter a valid amount.");
      return;
    }
    if (numericAmount > available) {
      setFormError("That's more than your available balance.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(WITHDRAWALS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: numericAmount, method, notes }),
      });
      const data = await response.json();
      if (!response.ok) {
        setFormError(data.message || "Could not submit withdrawal request.");
        return;
      }
      setFormMessage("Withdrawal request submitted.");
      setAmount("");
      setNotes("");
      fetchAll();
    } catch (err) {
      console.error(err);
      setFormError("Could not reach the server. Is the backend running?");
    } finally {
      setSubmitting(false);
    }
  };

  const formattedBalance = loading ? "…" : `Rs${available.toFixed(2)}`;
  const hasBalance = !loading && available > 0;

  return (
    <div className="ec-container withdraw-page">
      <h2 className="db-section-title">Withdrawals</h2>
      <p className="withdraw-subtitle">Track what you've earned and request a payout whenever you're ready.</p>

      <div className="withdraw-metrics-row">
        <div className="withdraw-metric-card withdraw-metric-primary">
          <div className="withdraw-wallet-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
              <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
              <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
            </svg>
          </div>
          <div>
            <p className="withdraw-metric-label">Available balance</p>
            <p className="withdraw-metric-value">{formattedBalance}</p>
          </div>
        </div>

        <div className="withdraw-metric-card">
          <p className="withdraw-metric-label">Total earned</p>
          <p className="withdraw-metric-value withdraw-metric-value-sm">{loading ? "…" : `Rs${totalRevenue.toFixed(2)}`}</p>
        </div>

        <div className="withdraw-metric-card">
          <p className="withdraw-metric-label">Already withdrawn</p>
          <p className="withdraw-metric-value withdraw-metric-value-sm">{loading ? "…" : `Rs${totalWithdrawn.toFixed(2)}`}</p>
        </div>
      </div>

      {!hasBalance && !loading && (
        <p className="withdraw-balance-note">
          You have {formattedBalance} — that's not enough available balance to request a withdrawal yet.
        </p>
      )}

      {!loading && (
        <form onSubmit={handleRequestWithdrawal} className="withdraw-form">
          <h3 className="withdraw-form-title">Request a withdrawal</h3>

          <div className="withdraw-field-row">
            <div className="withdraw-amount-wrap">
              <span className="withdraw-amount-prefix">Rs</span>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={!hasBalance || submitting}
                className="withdraw-input withdraw-amount-input"
              />
            </div>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              disabled={!hasBalance || submitting}
              className="withdraw-select"
            >
              <option value="bank">Bank</option>
              <option value="paypal">PayPal</option>
              <option value="other">Other</option>
            </select>
          </div>

          <input
            type="text"
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={!hasBalance || submitting}
            className="withdraw-input"
          />

          {formError && <div className="withdraw-form-banner withdraw-form-banner-error">{formError}</div>}
          {formMessage && <div className="withdraw-form-banner withdraw-form-banner-success">{formMessage}</div>}

          <button type="submit" disabled={!hasBalance || submitting} className="withdraw-submit-btn">
            {submitting && <span className="withdraw-btn-spinner" aria-hidden="true" />}
            {submitting ? "Submitting..." : "Request withdrawal"}
          </button>

          {!hasBalance && (
            <p className="withdraw-form-hint">You need an available balance before you can request a withdrawal.</p>
          )}
        </form>
      )}

      <div className="withdraw-info-row">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          <p className="withdraw-empty-text">No withdrawal requests yet</p>
        </div>
      ) : (
        <div className="withdraw-history-list">
          {withdrawals.map((w) => (
            <div key={w._id} className="withdraw-history-item">
              <div>
                <p className="withdraw-history-amount">Rs{w.amount.toFixed(2)}</p>
                <p className="withdraw-history-meta">
                  {w.method} · {new Date(w.createdAt).toLocaleDateString()}
                </p>
                {w.notes && <p className="withdraw-history-notes">{w.notes}</p>}
              </div>
              <span className={`withdraw-status-pill withdraw-status-${statusColor(w.status)}`}>{w.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}