import React, { useState, useRef } from "react";

const TABS = ["Profile", "Password", "Withdraw", "Social Profile", "Billing"];

function PasswordTab() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleReset = () => {
    setError("");
    setSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    console.log({ currentPassword, newPassword });

    setSuccess("Password updated successfully.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="settings-password-form">
      <div className="settings-field settings-field-full">
        <label>Current Password</label>
        <input
          type="password"
          placeholder="Current Password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
      </div>

      <div className="settings-field settings-field-full">
        <label>New Password</label>
        <input
          type="password"
          placeholder="Type Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>

      <div className="settings-field settings-field-full">
        <label>Re-type New Password</label>
        <input
          type="password"
          placeholder="Type Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      {error && <p className="settings-password-error">{error}</p>}
      {success && <p className="settings-password-success">{success}</p>}

      <button className="settings-update-btn" onClick={handleReset}>
        Reset Password
      </button>
    </div>
  );
}

function BioToolbar() {
  return (
    <div className="settings-bio-toolbar">
      <button type="button" className="settings-bio-btn" style={{ fontWeight: 700 }}>B</button>
      <button type="button" className="settings-bio-btn" style={{ fontStyle: "italic" }}>I</button>
      <button type="button" className="settings-bio-btn" style={{ textDecoration: "underline" }}>U</button>
      <span className="settings-bio-divider" />
      <button type="button" className="settings-bio-btn">”</button>
      <button type="button" className="settings-bio-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
      </button>
      <button type="button" className="settings-bio-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path></svg>
      </button>
      <span className="settings-bio-divider" />
      <button type="button" className="settings-bio-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="17" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>
      </button>
      <button type="button" className="settings-bio-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" y1="10" x2="7" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="7" y2="18"></line></svg>
      </button>
      <button type="button" className="settings-bio-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" y1="10" x2="3" y2="10"></line><line x1="17" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>
      </button>
      <span className="settings-bio-divider" />
      <button type="button" className="settings-bio-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path></svg>
      </button>
      <button type="button" className="settings-bio-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 14 20 9 15 4"></polyline><path d="M4 20v-7a4 4 0 0 1 4-4h12"></path></svg>
      </button>
      <button type="button" className="settings-bio-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 20H8a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4h12"></path><path d="M3 3l18 18"></path></svg>
      </button>
    </div>
  );
}

function ProfileTab() {
  const [firstName, setFirstName] = useState("Kapila");
  const [lastName, setLastName] = useState("Perera");
  const [phone, setPhone] = useState("");
  const [skill, setSkill] = useState("UX Designer");
  const [bio, setBio] = useState("");
  const [displayAs, setDisplayAs] = useState("DINESHAN");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setAvatarPreview(URL.createObjectURL(file));
  };

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setCoverPreview(URL.createObjectURL(file));
  };

  const handleUpdate = () => {
    console.log({ firstName, lastName, phone, skill, bio, displayAs });
  };

  return (
    <>
      <div
        className="settings-cover"
        style={coverPreview ? { backgroundImage: `url(${coverPreview})` } : undefined}
      >
        {coverPreview && (
          <button
            className="settings-cover-delete"
            onClick={() => setCoverPreview(null)}
            type="button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        )}

        <div className="settings-avatar-wrap" onClick={() => avatarInputRef.current.click()}>
          <div
            className="settings-avatar"
            style={avatarPreview ? { backgroundImage: `url(${avatarPreview})`, backgroundSize: "cover" } : undefined}
          >
            {!avatarPreview && (
              <svg width="40" height="40" viewBox="0 0 24 24" fill="#fff" opacity="0.85">
                <circle cx="12" cy="8" r="4"></circle>
                <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8"></path>
              </svg>
            )}
          </div>
          <div className="settings-avatar-camera">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
          </div>
          <input ref={avatarInputRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
        </div>

        <button className="settings-upload-cover-btn" onClick={() => coverInputRef.current.click()} type="button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
          Upload Cover Photo
        </button>
        <input ref={coverInputRef} type="file" accept="image/*" hidden onChange={handleCoverChange} />
      </div>

      <div className="settings-photo-hints">
        <span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          Profile Photo Size: <strong>200x200</strong> pixels
        </span>
        <span>Cover Photo Size: <strong>700x430</strong> pixels</span>
      </div>

      <div className="settings-form-grid">
        <div className="settings-field">
          <label>First Name</label>
          <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </div>
        <div className="settings-field">
          <label>Last Name</label>
          <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>

        <div className="settings-field">
          <label>User Name</label>
          <input type="text" value="DINESHAN" disabled className="settings-field-disabled" />
        </div>
        <div className="settings-field">
          <label>Phone Number</label>
          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="settings-field settings-field-full">
          <label>Skill/Occupation</label>
          <input type="text" value={skill} onChange={(e) => setSkill(e.target.value)} />
        </div>

        <div className="settings-field settings-field-full">
          <label>Bio</label>
          <div className="settings-bio-box">
            <BioToolbar />
            <textarea
              className="settings-bio-textarea"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={6}
            />
          </div>
        </div>

        <div className="settings-field settings-field-full">
          <label>Display name publicly as</label>
          <select value={displayAs} onChange={(e) => setDisplayAs(e.target.value)} className="settings-display-select">
            <option value="DINESHAN">DINESHAN</option>
            <option value={`${firstName} ${lastName}`}>{firstName} {lastName}</option>
          </select>
          <p className="settings-helper-text">
            The display name is shown in all public fields, such as the author name, instructor name, student name, and name that will be printed on the certificate.
          </p>
        </div>
      </div>

      <button className="settings-update-btn" onClick={handleUpdate}>Update Profile</button>
    </>
  );
}

function PlaceholderTab({ name }) {
  return (
    <div className="ec-empty-state" style={{ padding: "60px 20px" }}>
      <p className="ec-empty-text">{name} settings coming soon.</p>
    </div>
  );
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState("Profile");

  return (
    <div className="ec-container">
      <h2 className="db-section-title">Settings</h2>

      <div className="settings-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`settings-tab-btn${activeTab === tab ? " active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Profile" && <ProfileTab />}
      {activeTab === "Password" && <PasswordTab />}
      {activeTab === "Withdraw" && <WithdrawTab />}
      {activeTab === "Social Profile" && <PlaceholderTab name="Social Profile" />}
      {activeTab === "Billing" && <PlaceholderTab name="Billing" />}
    </div>
  );
}

const WITHDRAW_METHODS = [
  { id: "bank", label: "Bank Transfer", note: "Min withdraw Rs80.00" },
];

function WithdrawTab() {
  const [method, setMethod] = useState("bank");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [iban, setIban] = useState("");
  const [swift, setSwift] = useState("");
  const [success, setSuccess] = useState("");

  const handleSave = () => {
    console.log({ method, accountName, accountNumber, bankName, iban, swift });
    setSuccess("Withdrawal account saved.");
  };

  return (
    <>
      <h3 className="settings-subtitle">Select a withdraw method</h3>

      <div className="settings-withdraw-methods">
        {WITHDRAW_METHODS.map((m) => (
          <label
            key={m.id}
            className={`settings-withdraw-method${method === m.id ? " active" : ""}`}
          >
            <input
              type="radio"
              name="withdraw-method"
              value={m.id}
              checked={method === m.id}
              onChange={() => setMethod(m.id)}
            />
            <span className="settings-withdraw-method-text">
              <span className="settings-withdraw-method-label">{m.label}</span>
              <span className="settings-withdraw-method-note">{m.note}</span>
            </span>
          </label>
        ))}
      </div>

      <div className="settings-form-grid">
        <div className="settings-field">
          <label>Account Name</label>
          <input
            type="text"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
          />
        </div>
        <div className="settings-field">
          <label>Account Number</label>
          <input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
          />
        </div>

        <div className="settings-field">
          <label>Bank Name</label>
          <input
            type="text"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
          />
        </div>
        <div className="settings-field">
          <label>IBAN</label>
          <input
            type="text"
            value={iban}
            onChange={(e) => setIban(e.target.value)}
          />
        </div>

        <div className="settings-field">
          <label>BIC / SWIFT</label>
          <input
            type="text"
            value={swift}
            onChange={(e) => setSwift(e.target.value)}
          />
        </div>
      </div>

      {success && <p className="settings-password-success">{success}</p>}

      <button className="settings-update-btn" onClick={handleSave}>
        Save Withdrawal Account
      </button>
    </>
  );
}
