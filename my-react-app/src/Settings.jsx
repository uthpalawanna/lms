import React, { useState, useEffect } from "react";
import "./Dashboard.css";

const ME_URL = "http://localhost:5000/api/auth/me";
const UPLOAD_URL = "http://localhost:5000/api/uploads";
const CHANGE_PASSWORD_URL = "http://localhost:5000/api/auth/change-password";

const TABS = ["Profile", "Password", "Withdraw", "Social Profile", "Billing"];

function toAbsoluteUrl(url) {
  if (!url) return "";
  return url.startsWith("/uploads") ? `http://localhost:5000${url}` : url;
}

function PhotoUploadButton({ token, onUploaded, style, children }) {
  const [uploading, setUploading] = useState(false);

  const handleChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(UPLOAD_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (response.ok) onUploaded(data.url);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <label style={{ cursor: "pointer", ...style }}>
      {uploading ? "Uploading..." : children}
      <input type="file" accept="image/*" onChange={handleChange} style={{ display: "none" }} disabled={uploading} />
    </label>
  );
}

function ProfileTab({ token, onProfileUpdate }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [skill, setSkill] = useState("");
  const [bio, setBio] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [coverPhotoUrl, setCoverPhotoUrl] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(ME_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) {
          setError(data.message || "Could not load your profile.");
          setLoading(false);
          return;
        }
        setUser(data);
        setFirstName(data.firstName || "");
        setLastName(data.lastName || "");
        setUsername(data.username || "");
        setPhone(data.phone || "");
        setSkill(data.skill || "");
        setBio(data.bio || "");
        setDisplayName(data.displayName || data.username || "");
        setAvatarUrl(data.avatarUrl || "");
        setCoverPhotoUrl(data.coverPhotoUrl || "");
      } catch (err) {
        console.error(err);
        setError("Could not reach the server. Is the backend running?");
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchProfile();
  }, [token]);

  const handleUpdate = async () => {
    setError("");
    setMessage("");
    setSaving(true);
    try {
      const response = await fetch(ME_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName,
          lastName,
          username,
          phone,
          skill,
          bio,
          displayName,
          avatarUrl,
          coverPhotoUrl,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Could not update your profile.");
        setSaving(false);
        return;
      }
      setUser(data);
      onProfileUpdate?.(data);
      setMessage("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{ padding: "2rem" }}>Loading your profile...</p>;
  if (error && !user) return <p style={{ padding: "2rem", color: "#dc2626" }}>{error}</p>;

  const initial = (firstName || username || "?").charAt(0).toUpperCase();

  return (
    <div>
      <div
        style={{
          width: "100%",
          height: 260,
          borderRadius: 12,
          background: coverPhotoUrl
            ? `url(${toAbsoluteUrl(coverPhotoUrl)}) center/cover`
            : "linear-gradient(135deg, #2e0f6e 0%, #4c1d95 50%, #7c3aed 100%)",
          position: "relative",
        }}
      >
        <PhotoUploadButton
          token={token}
          onUploaded={setCoverPhotoUrl}
          style={{
            position: "absolute",
            bottom: 16,
            right: 16,
            background: "#4a60c8",
            color: "#fff",
            padding: "10px 16px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          📷 Upload Cover Photo
        </PhotoUploadButton>

        <div style={{ position: "absolute", bottom: -50, left: 32, width: 110, height: 110 }}>
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background: "#d1d5db",
              border: "4px solid #eef0f8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {avatarUrl ? (
              <img src={toAbsoluteUrl(avatarUrl)} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: 32, color: "#fff", fontWeight: 700 }}>{initial}</span>
            )}
          </div>
          <PhotoUploadButton
            token={token}
            onUploaded={setAvatarUrl}
            style={{
              position: "absolute",
              bottom: 4,
              right: 4,
              background: "#c9cad0",
              color: "#fff",
              width: 30,
              height: 30,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              border: "2px solid #eef0f8",
            }}
          >
            +
          </PhotoUploadButton>
        </div>
      </div>

      <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 60, marginBottom: 24 }}>
        ⓘ Profile Photo Size: <strong>200x200</strong> pixels &nbsp;&nbsp; Cover Photo Size: <strong>700x430</strong> pixels
      </p>

      {message && <p style={{ color: "#16a34a", fontWeight: 600 }}>{message}</p>}
      {error && <p style={{ color: "#dc2626", fontWeight: 600 }}>{error}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="modal-field">
          <label>First Name</label>
          <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </div>
        <div className="modal-field">
          <label>Last Name</label>
          <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>

        <div className="modal-field">
          <label>User Name</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="modal-field">
          <label>Phone Number</label>
          <input type="text" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      </div>

      <div className="modal-field">
        <label>Skill/Occupation</label>
        <input type="text" value={skill} onChange={(e) => setSkill(e.target.value)} />
      </div>

      <div className="modal-field">
        <label>Bio</label>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={6} />
      </div>

      <div className="modal-field">
        <label>Display name publicly as</label>
        <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 6 }}>
          The display name is shown in all public fields, such as the author name, instructor name, student name, and name that will be printed on the certificate.
        </p>
      </div>

      <button className="db-new-course-btn" onClick={handleUpdate} disabled={saving} style={{ marginTop: 8 }}>
        {saving ? "Updating..." : "Update Profile"}
      </button>
    </div>
  );
}

function PasswordTab({ token }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setMessage("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all three fields.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation don't match.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(CHANGE_PASSWORD_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Could not update your password.");
        setSaving(false);
        return;
      }
      setMessage("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 460 }}>
      {message && <p style={{ color: "#16a34a", fontWeight: 600 }}>{message}</p>}
      {error && <p style={{ color: "#dc2626", fontWeight: 600 }}>{error}</p>}

      <div className="modal-field">
        <label>Current Password</label>
        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
      </div>
      <div className="modal-field">
        <label>New Password</label>
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 6 }}>At least 8 characters.</p>
      </div>
      <div className="modal-field">
        <label>Confirm New Password</label>
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
      </div>

      <button className="db-new-course-btn" onClick={handleSubmit} disabled={saving} style={{ marginTop: 8 }}>
        {saving ? "Updating..." : "Change Password"}
      </button>
    </div>
  );
}

const MIN_WITHDRAW = 80;

function WithdrawTab({ token }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Starts unselected (matches the "nothing chosen yet" state). Only becomes
  // "bank" once the user actually clicks the radio, or if we loaded a
  // previously-saved account from the backend.
  const [method, setMethod] = useState(null);

  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [iban, setIban] = useState("");
  const [bicSwift, setBicSwift] = useState("");

  useEffect(() => {
    if (!token) return;
    fetch(ME_URL, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        const bd = data.bankDetails || {};
        setAccountName(bd.accountName || "");
        setAccountNumber(bd.accountNumber || "");
        setBankName(bd.bankName || "");
        setIban(bd.iban || "");
        setBicSwift(bd.bicSwift || "");

        // Only auto-select the radio if the user actually has a saved account
        if (bd.accountName || bd.accountNumber || bd.bankName) {
          setMethod("bank");
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSave = async () => {
    setError("");
    setMessage("");

    if (!accountName.trim() || !accountNumber.trim() || !bankName.trim()) {
      setError("Account name, account number, and bank name are required.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(ME_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bankDetails: { accountName, accountNumber, bankName, iban, bicSwift },
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Could not save your withdrawal account.");
        setSaving(false);
        return;
      }
      setMessage("Withdrawal account saved.");
    } catch (err) {
      console.error(err);
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{ padding: "2rem" }}>Loading...</p>;

  return (
    <div style={{ maxWidth: 720 }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Select a withdraw method</h3>

      {message && <p style={{ color: "#16a34a", fontWeight: 600 }}>{message}</p>}
      {error && <p style={{ color: "#dc2626", fontWeight: 600 }}>{error}</p>}

      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          background: "#fff",
          border: "1px solid #e2e5ef",
          borderRadius: 10,
          padding: "16px 20px",
          cursor: "pointer",
          marginBottom: method === "bank" ? 24 : 0,
        }}
      >
        <input
          type="radio"
          name="withdraw-method"
          checked={method === "bank"}
          onChange={() => setMethod("bank")}
          style={{ width: 18, height: 18, accentColor: "#4a60c8" }}
        />
        <div>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>Bank Transfer</p>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: "#9ca3af" }}>
            Min withdraw Rs{MIN_WITHDRAW.toFixed(2)}
          </p>
        </div>
      </label>

      {method === "bank" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div className="modal-field">
              <label>Account Name</label>
              <input type="text" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
            </div>
            <div className="modal-field">
              <label>Account Number</label>
              <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
            </div>
            <div className="modal-field">
              <label>Bank Name</label>
              <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} />
            </div>
            <div className="modal-field">
              <label>IBAN</label>
              <input type="text" value={iban} onChange={(e) => setIban(e.target.value)} />
            </div>
            <div className="modal-field">
              <label>BIC / SWIFT</label>
              <input type="text" value={bicSwift} onChange={(e) => setBicSwift(e.target.value)} />
            </div>
          </div>

          <button className="db-new-course-btn" onClick={handleSave} disabled={saving} style={{ marginTop: 20 }}>
            {saving ? "Saving..." : "Save Withdrawal Account"}
          </button>
        </>
      )}
    </div>
  );
}

function SocialProfileTab({ token }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [facebook, setFacebook] = useState("");
  const [twitter, setTwitter] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [youtube, setYoutube] = useState("");
  const [website, setWebsite] = useState("");

  useEffect(() => {
    if (!token) return;
    fetch(ME_URL, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        const sl = data.socialLinks || {};
        setFacebook(sl.facebook || "");
        setTwitter(sl.twitter || "");
        setLinkedin(sl.linkedin || "");
        setYoutube(sl.youtube || "");
        setWebsite(sl.website || "");
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSave = async () => {
    setError("");
    setMessage("");
    setSaving(true);
    try {
      const response = await fetch(ME_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          socialLinks: { facebook, twitter, linkedin, youtube, website },
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Could not save your social links.");
        setSaving(false);
        return;
      }
      setMessage("Social profile links saved.");
    } catch (err) {
      console.error(err);
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{ padding: "2rem" }}>Loading...</p>;

  return (
    <div style={{ maxWidth: 460 }}>
      <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
        These links appear on your public instructor profile.
      </p>

      {message && <p style={{ color: "#16a34a", fontWeight: 600 }}>{message}</p>}
      {error && <p style={{ color: "#dc2626", fontWeight: 600 }}>{error}</p>}

      <div className="modal-field">
        <label>Facebook</label>
        <input type="text" value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="https://facebook.com/yourname" />
      </div>
      <div className="modal-field">
        <label>Twitter / X</label>
        <input type="text" value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="https://x.com/yourname" />
      </div>
      <div className="modal-field">
        <label>LinkedIn</label>
        <input type="text" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/yourname" />
      </div>
      <div className="modal-field">
        <label>YouTube</label>
        <input type="text" value={youtube} onChange={(e) => setYoutube(e.target.value)} placeholder="https://youtube.com/@yourname" />
      </div>
      <div className="modal-field">
        <label>Personal Website</label>
        <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yourwebsite.com" />
      </div>

      <button className="db-new-course-btn" onClick={handleSave} disabled={saving} style={{ marginTop: 8 }}>
        {saving ? "Saving..." : "Save Social Links"}
      </button>
    </div>
  );
}

function BillingTab({ token }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [postcode, setPostcode] = useState("");

  useEffect(() => {
    if (!token) return;
    fetch(ME_URL, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        const b = data.billingAddress || {};
        setAddress(b.address || "");
        setCity(b.city || "");
        setState(b.state || "");
        setCountry(b.country || "");
        setPostcode(b.postcode || "");
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSave = async () => {
    setError("");
    setMessage("");
    setSaving(true);
    try {
      const response = await fetch(ME_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          billingAddress: { address, city, state, country, postcode },
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Could not save your billing address.");
        setSaving(false);
        return;
      }
      setMessage("Billing address saved.");
    } catch (err) {
      console.error(err);
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{ padding: "2rem" }}>Loading...</p>;

  return (
    <div style={{ maxWidth: 460 }}>
      <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
        This address is used on invoices for your purchases.
      </p>

      {message && <p style={{ color: "#16a34a", fontWeight: 600 }}>{message}</p>}
      {error && <p style={{ color: "#dc2626", fontWeight: 600 }}>{error}</p>}

      <div className="modal-field">
        <label>Street Address</label>
        <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="modal-field">
          <label>City</label>
          <input type="text" value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        <div className="modal-field">
          <label>State / Province</label>
          <input type="text" value={state} onChange={(e) => setState(e.target.value)} />
        </div>
        <div className="modal-field">
          <label>Country</label>
          <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} />
        </div>
        <div className="modal-field">
          <label>Postcode</label>
          <input type="text" value={postcode} onChange={(e) => setPostcode(e.target.value)} />
        </div>
      </div>

      <button className="db-new-course-btn" onClick={handleSave} disabled={saving} style={{ marginTop: 8 }}>
        {saving ? "Saving..." : "Save Billing Address"}
      </button>
    </div>
  );
}

export default function Settings({ token, initialTab = "Profile", onProfileUpdate }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <div className="ec-container">
      <h2 className="db-section-title">Settings</h2>

      <div className="ec-tabs-header">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`ec-tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ marginTop: "1.5rem" }}>
        {activeTab === "Profile" && <ProfileTab token={token} onProfileUpdate={onProfileUpdate} />}
        {activeTab === "Password" && <PasswordTab token={token} />}
        {activeTab === "Withdraw" && <WithdrawTab token={token} />}
        {activeTab === "Social Profile" && <SocialProfileTab token={token} />}
        {activeTab === "Billing" && <BillingTab token={token} />}
      </div>
    </div>
  );
}