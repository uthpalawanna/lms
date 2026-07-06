import React, { useState, useEffect } from "react";
import "./Dashboard.css";

const ME_URL = "http://localhost:5000/api/auth/me";
const UPLOAD_URL = "http://localhost:5000/api/uploads";

const TABS = ["Profile", "Password", "Withdraw", "Social Profile", "Billing"];

function toAbsoluteUrl(url) {
  if (!url) return "";
  return url.startsWith("/uploads") ? `http://localhost:5000${url}` : url;
}

function PhotoUploadButton({ token, label, onUploaded, style, children }) {
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
      {/* Cover photo */}
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

        <div
          style={{
            position: "absolute",
            bottom: -50,
            left: 32,
            width: 110,
            height: 110,
          }}
        >
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
          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </div>

      <div className="modal-field">
        <label>Skill/Occupation</label>
        <input type="text" value={skill} onChange={(e) => setSkill(e.target.value)} />
      </div>

      <div className="modal-field">
        <label>Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={6}
        />
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

function ComingSoonTab({ label }) {
  return (
    <div className="ec-empty-state">
      <p className="ec-empty-text">{label} settings coming soon.</p>
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
        {activeTab === "Password" && <ComingSoonTab label="Password" />}
        {activeTab === "Withdraw" && <ComingSoonTab label="Withdraw preference" />}
        {activeTab === "Social Profile" && <ComingSoonTab label="Social profile" />}
        {activeTab === "Billing" && <ComingSoonTab label="Billing" />}
      </div>
    </div>
  );
}