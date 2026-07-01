import React, { useState, useRef, useEffect } from "react";

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

const WITHDRAW_METHODS = [
  { id: "bank", label: "Bank Transfer", note: "Min withdraw Rs80.00" },
];

function WithdrawTab() {
  const [method, setMethod] = useState("");
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

      {method && (
  <>
    <div className="settings-form-grid">
      <div className="settings-field">
        <label>Account Name</label>
        <input type="text" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
      </div>
      <div className="settings-field">
        <label>Account Number</label>
        <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
      </div>
      <div className="settings-field">
        <label>Bank Name</label>
        <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} />
      </div>
      <div className="settings-field">
        <label>IBAN</label>
        <input type="text" value={iban} onChange={(e) => setIban(e.target.value)} />
      </div>
      <div className="settings-field">
        <label>BIC / SWIFT</label>
        <input type="text" value={swift} onChange={(e) => setSwift(e.target.value)} />
      </div>
    </div>

    {success && <p className="settings-password-success">{success}</p>}

    <button className="settings-update-btn" onClick={handleSave}>
      Save Withdrawal Account
    </button>
  </>
      )}
    </>
  );
}

const SOCIAL_FIELDS = [
  {
    id: "facebook",
    label: "Facebook",
    placeholder: "https://facebook.com/username",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z" />
      </svg>
    ),
  },
  {
    id: "x",
    label: "X",
    placeholder: "https://x.com/username",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.9 2H22l-7.6 8.7L23.3 22h-7l-5.5-6.7L4.5 22H1.4l8.1-9.3L1 2h7.2l5 6.1L18.9 2zm-1.2 18h1.7L7.4 3.9H5.6L17.7 20z" />
      </svg>
    ),
  },
  {
    id: "linkedin",
    label: "Linkedin",
    placeholder: "https://linkedin.com/username",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.4 20.4h-3.5v-5.5c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.6H9.5V9h3.4v1.6h.1c.5-.9 1.6-1.8 3.3-1.8 3.6 0 4.1 2.3 4.1 5.3v6.3zM5.3 7.4a2 2 0 1 1 0-4 2 2 0 0 1 0 4zM7 20.4H3.6V9H7v11.4z" />
      </svg>
    ),
  },
  {
    id: "website",
    label: "Website",
    placeholder: "https://example.com/",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z"></path>
      </svg>
    ),
  },
  {
    id: "github",
    label: "Github",
    placeholder: "https://github.com/username",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.1-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.4-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-4.9 0-1.1.4-2 1-2.7-.1-.3-.5-1.3.1-2.6 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .6 1.3.2 2.3.1 2.6.6.7 1 1.6 1 2.7 0 3.8-2.4 4.6-4.6 4.9.4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 12 2z" />
      </svg>
    ),
  },
];
function SocialProfileTab() {
  const [links, setLinks] = useState({
    facebook: "",
    x: "",
    linkedin: "",
    website: "",
    github: "",
  });

  const handleChange = (id, value) => {
    setLinks((prev) => ({ ...prev, [id]: value }));
  };

  const handleUpdate = () => {
    console.log(links);
  };

  return (
    <div className="settings-social-tab">
      <h3 className="settings-subtitle">Social Profile Link</h3>

      <div className="settings-social-list">
        {SOCIAL_FIELDS.map((field) => (
          <div key={field.id} className="settings-social-row">
            <span className="settings-social-label">
              <span className="settings-social-icon">{field.icon}</span>
              {field.label}
            </span>
            <input
              type="text"
              placeholder={field.placeholder}
              value={links[field.id]}
              onChange={(e) => handleChange(field.id, e.target.value)}
              className="settings-social-input"
            />
          </div>
        ))}
      </div>

      <button className="settings-update-btn" onClick={handleUpdate}>
        Update Profile
      </button>
    </div>
  );
}
const COUNTRIES = [
  "Sri Lanka", "India", "United States", "United Kingdom",
  "Australia", "Canada", "Germany", "France", "Singapore",
];

function BillingTab() {
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [country,   setCountry]   = useState("");
  const [state,     setState]     = useState("N/A");
  const [city,      setCity]      = useState("");
  const [postcode,  setPostcode]  = useState("");
  const [phone,     setPhone]     = useState("");
  const [address,   setAddress]   = useState("");
  const [success,   setSuccess]   = useState("");

  const handleSave = () => {
    console.log({ firstName, lastName, email, country, state, city, postcode, phone, address });
    setSuccess("Address saved successfully.");
  };

  return (
    <>
      <h3 className="settings-subtitle">Billing Address</h3>

      <div className="settings-form-grid">
        <div className="settings-field">
          <label>First Name</label>
          <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </div>
        <div className="settings-field">
          <label>Last Name</label>
          <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>

        <div className="settings-field settings-field-full">
          <label>Email Address</label>
          <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="settings-field settings-field-full">
          <label>Country</label>
          <select value={country} onChange={(e) => setCountry(e.target.value)} className="settings-display-select">
            <option value="">Select Country</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="settings-field">
          <label>State</label>
          <select value={state} onChange={(e) => setState(e.target.value)} className="settings-display-select">
            <option value="N/A">N/A</option>
            <option value="Western">Western</option>
            <option value="Central">Central</option>
            <option value="Southern">Southern</option>
            <option value="Northern">Northern</option>
            <option value="Eastern">Eastern</option>
          </select>
        </div>
        <div className="settings-field">
          <label>City</label>
          <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
        </div>

        <div className="settings-field">
          <label>Postcode / ZIP</label>
          <input type="text" placeholder="Postcode / ZIP" value={postcode} onChange={(e) => setPostcode(e.target.value)} />
        </div>
        <div className="settings-field">
          <label>Phone</label>
          <input type="text" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        <div className="settings-field settings-field-full">
          <label>Address</label>
          <input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
      </div>

      {success && <p className="settings-password-success">{success}</p>}

      <button className="settings-update-btn" onClick={handleSave}>
        Save Address
      </button>
    </>
  );
}


function BioToolbar() {
  return (
    <div className="settings-bio-toolbar">
      <button type="button" className="settings-bio-btn" style={{ fontWeight: 700 }}>B</button>
      <button type="button" className="settings-bio-btn" style={{ fontStyle: "italic" }}>I</button>
      <button type="button" className="settings-bio-btn" style={{ textDecoration: "underline" }}>U</button>
      <span className="settings-bio-divider" />
      <button type="button" className="settings-bio-btn">"</button>
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
  const [firstName,    setFirstName]    = useState("Kapila");
  const [lastName,     setLastName]     = useState("Perera");
  const [phone,        setPhone]        = useState("");
  const [skill,        setSkill]        = useState("UX Designer");
  const [bio,          setBio]          = useState("");
  const [displayAs,    setDisplayAs]    = useState("DINESHAN");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview,  setCoverPreview]  = useState(null);

  const avatarInputRef = useRef(null);
  const coverInputRef  = useRef(null);

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
          <button className="settings-cover-delete" onClick={() => setCoverPreview(null)} type="button">
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
          <input type="text" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
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


function resolveInitialTab(initialTab) {
  const match = TABS.find(
    (tab) => tab.toLowerCase() === String(initialTab || "").toLowerCase()
  );
  return match || TABS[0];
}

export default function Settings({ initialTab = "Profile" }) {
  const [activeTab, setActiveTab] = useState(() => resolveInitialTab(initialTab));

  useEffect(() => {
    setActiveTab(resolveInitialTab(initialTab));
  }, [initialTab]);

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

      {activeTab === "Profile"        && <ProfileTab />}
      {activeTab === "Password"       && <PasswordTab />}
      {activeTab === "Withdraw"       && <WithdrawTab />}
      {activeTab === "Social Profile" && <SocialProfileTab />}
      {activeTab === "Billing"        && <BillingTab />}
    </div>
  );
}