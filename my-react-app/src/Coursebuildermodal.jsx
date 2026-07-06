import React, { useState } from "react";

const API_URL = "http://localhost:5000/api/courses";
const UPLOAD_URL = "http://localhost:5000/api/uploads";

const STEPS = [
  { id: "basics", number: 1, label: "Basics" },
  { id: "curriculum", number: 2, label: "Curriculum" },
  { id: "additional", number: 3, label: "Additional" },
];

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function TagInput({ label, placeholder, values, onChange }) {
  const [draft, setDraft] = useState("");

  const addValue = () => {
    const trimmed = draft.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    setDraft("");
  };

  const removeValue = (val) => {
    onChange(values.filter((v) => v !== val));
  };

  return (
    <div className="modal-field">
      <label>{label}</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
        {values.map((v) => (
          <span
            key={v}
            style={{
              background: "#eef0fb",
              color: "#4a60c8",
              borderRadius: 20,
              padding: "4px 10px",
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {v}
            <span style={{ cursor: "pointer", fontWeight: 700 }} onClick={() => removeValue(v)}>×</span>
          </span>
        ))}
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            addValue();
          }
        }}
      />
    </div>
  );
}

function FileUploadField({ label, hint, token, value, onChange, accept }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(UPLOAD_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Upload failed.");
        setUploading(false);
        return;
      }
      onChange(data.url);
    } catch (err) {
      console.error(err);
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>{label}</p>
      <div
        style={{
          border: "1px dashed #d0d5dd",
          borderRadius: 10,
          padding: "1.5rem 1rem",
          textAlign: "center",
          background: "#f9fafb",
        }}
      >
        {value ? (
          <div>
            {accept.startsWith("image") ? (
              <img src={`http://localhost:5000${value}`} alt="preview" style={{ maxHeight: 120, borderRadius: 8, marginBottom: 8 }} />
            ) : (
              <p style={{ fontSize: 13, color: "#16a34a", marginBottom: 8 }}>✓ Uploaded</p>
            )}
            <br />
            <button type="button" className="modal-cancel-btn" onClick={() => onChange("")}>
              Remove
            </button>
          </div>
        ) : (
          <>
            <label
              style={{
                display: "inline-block",
                background: "#eef0fb",
                color: "#4a60c8",
                padding: "8px 16px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {uploading ? "Uploading..." : `Upload ${label}`}
              <input type="file" accept={accept} onChange={handleFileChange} style={{ display: "none" }} disabled={uploading} />
            </label>
            <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 8 }}>{hint}</p>
          </>
        )}
        {error && <p style={{ color: "#dc2626", fontSize: 12, marginTop: 8 }}>{error}</p>}
      </div>
    </div>
  );
}

const emptyLesson = () => ({ title: "", content: "", videoUrl: "" });
const emptyTopic = () => ({ title: "", lessons: [emptyLesson()] });
const emptyFaq = () => ({ question: "", answer: "" });

export default function CourseBuilderModal({ token, user, onClose, onSaved }) {
  const [step, setStep] = useState("basics");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    difficultyLevel: "beginner",
    isPublicPreview: false,
    enableQA: true,
    visibility: "public",
    scheduleEnabled: false,
    scheduledAt: "",
    thumbnail: "",
    introVideoUrl: "",
    pricingModel: "free",
    price: "",
    categories: [],
    tags: [],
    curriculum: [emptyTopic()],
    requirements: [],
    targetAudience: [],
    materials: [],
    faqs: [],
  });

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleTitleChange = (value) => {
    update("title", value);
    if (!slugEdited) update("slug", slugify(value));
  };

  const addTopic = () => update("curriculum", [...form.curriculum, emptyTopic()]);
  const removeTopic = (i) => update("curriculum", form.curriculum.filter((_, idx) => idx !== i));
  const updateTopicTitle = (i, title) => {
    const next = [...form.curriculum];
    next[i] = { ...next[i], title };
    update("curriculum", next);
  };
  const addLesson = (topicIndex) => {
    const next = [...form.curriculum];
    next[topicIndex] = { ...next[topicIndex], lessons: [...next[topicIndex].lessons, emptyLesson()] };
    update("curriculum", next);
  };
  const removeLesson = (topicIndex, lessonIndex) => {
    const next = [...form.curriculum];
    next[topicIndex] = {
      ...next[topicIndex],
      lessons: next[topicIndex].lessons.filter((_, idx) => idx !== lessonIndex),
    };
    update("curriculum", next);
  };
  const updateLesson = (topicIndex, lessonIndex, field, value) => {
    const next = [...form.curriculum];
    const lessons = [...next[topicIndex].lessons];
    lessons[lessonIndex] = { ...lessons[lessonIndex], [field]: value };
    next[topicIndex] = { ...next[topicIndex], lessons };
    update("curriculum", next);
  };

  const addFaq = () => update("faqs", [...form.faqs, emptyFaq()]);
  const removeFaq = (i) => update("faqs", form.faqs.filter((_, idx) => idx !== i));
  const updateFaq = (i, field, value) => {
    const next = [...form.faqs];
    next[i] = { ...next[i], [field]: value };
    update("faqs", next);
  };

  const buildPayload = (status) => ({
    title: form.title.trim(),
    slug: form.slug,
    description: form.description,
    difficultyLevel: form.difficultyLevel,
    isPublicPreview: form.isPublicPreview,
    enableQA: form.enableQA,
    visibility: form.visibility,
    scheduledAt: form.scheduleEnabled && form.scheduledAt ? form.scheduledAt : null,
    thumbnail: form.thumbnail,
    introVideoUrl: form.introVideoUrl,
    price: form.pricingModel === "paid" ? Number(form.price) || 0 : 0,
    categories: form.categories,
    tags: form.tags,
    curriculum: form.curriculum
      .filter((t) => t.title.trim())
      .map((t) => ({ ...t, lessons: t.lessons.filter((l) => l.title.trim()) })),
    requirements: form.requirements,
    targetAudience: form.targetAudience,
    materials: form.materials,
    faqs: form.faqs.filter((f) => f.question.trim()),
    status,
  });

  const handleSave = async (status) => {
    if (!form.title.trim()) {
      setError("Please enter a course title.");
      setStep("basics");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(buildPayload(status)),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Could not save the course.");
        setSaving(false);
        return;
      }
      onSaved(data);
    } catch (err) {
      console.error(err);
      setError("Could not reach the server. Is the backend running?");
      setSaving(false);
    }
  };

  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const goNext = () => { if (stepIndex < STEPS.length - 1) setStep(STEPS[stepIndex + 1].id); };
  const goBack = () => { if (stepIndex > 0) setStep(STEPS[stepIndex - 1].id); };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 900, width: "95%", maxHeight: "90vh", display: "flex", flexDirection: "column" }}
      >
        <div className="modal-header" style={{ alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h3 style={{ margin: 0 }}>Course Builder</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 12 }}>
              {STEPS.map((s, i) => (
                <React.Fragment key={s.id}>
                  {i > 0 && <span style={{ color: "#d1d5db" }}>—</span>}
                  <button
                    onClick={() => setStep(s.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      color: step === s.id ? "#4a60c8" : "#9ca3af",
                      fontWeight: step === s.id ? 700 : 500,
                      fontSize: 13,
                    }}
                  >
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: step === s.id ? "#4a60c8" : "#e5e7eb",
                        color: step === s.id ? "#fff" : "#6b7280",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                      }}
                    >
                      {s.number}
                    </span>
                    {s.label}
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button className="modal-cancel-btn" onClick={() => handleSave("draft")} disabled={saving}>
              Save as Draft
            </button>
            <button className="modal-publish-btn" onClick={() => handleSave("publish")} disabled={saving}>
              {saving ? "Saving..." : "Publish"}
            </button>
            <button className="modal-close-btn" onClick={onClose}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <div className="modal-body" style={{ overflowY: "auto", flex: 1 }}>
          {error && (
            <p style={{ color: "#dc2626", fontSize: 13, marginBottom: 12 }}>{error}</p>
          )}

          {step === "basics" && (
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24 }}>
              <div>
                <div className="modal-field">
                  <label>Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Introduction to React"
                    value={form.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                  />
                </div>

                <p style={{ fontSize: 12, color: "#5c6b8a", marginTop: -6, marginBottom: 16 }}>
                  Course URL: <code>/courses/{form.slug || "your-course"}</code>{" "}
                  <span
                    style={{ color: "#4a60c8", cursor: "pointer" }}
                    onClick={() => setSlugEdited(true)}
                  >
                    (edit)
                  </span>
                  {slugEdited && (
                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) => update("slug", slugify(e.target.value))}
                      style={{ display: "block", marginTop: 6 }}
                    />
                  )}
                </p>

                <div className="modal-field">
                  <label>Description</label>
                  <textarea
                    placeholder="What will students learn in this course?"
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    rows={6}
                  />
                </div>

                <div className="modal-field">
                  <label>Difficulty Level</label>
                  <select
                    value={form.difficultyLevel}
                    onChange={(e) => update("difficultyLevel", e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d0d5dd", fontSize: 14 }}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>Public Course</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>Let non-enrolled visitors preview this course</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.isPublicPreview}
                    onChange={(e) => update("isPublicPreview", e.target.checked)}
                    style={{ width: 20, height: 20 }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>Q&amp;A</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>Allow students to ask questions on this course</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.enableQA}
                    onChange={(e) => update("enableQA", e.target.checked)}
                    style={{ width: 20, height: 20 }}
                  />
                </div>
              </div>

              <div>
                <div className="modal-field">
                  <label>Visibility</label>
                  <select
                    value={form.visibility}
                    onChange={(e) => update("visibility", e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d0d5dd", fontSize: 14 }}
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}>
                  <label style={{ fontWeight: 600, fontSize: 14 }}>Schedule</label>
                  <input
                    type="checkbox"
                    checked={form.scheduleEnabled}
                    onChange={(e) => update("scheduleEnabled", e.target.checked)}
                    style={{ width: 20, height: 20 }}
                  />
                </div>
                {form.scheduleEnabled && (
                  <input
                    type="datetime-local"
                    value={form.scheduledAt}
                    onChange={(e) => update("scheduledAt", e.target.value)}
                    style={{ marginBottom: 16 }}
                  />
                )}

                <FileUploadField
                  label="Featured Image"
                  hint="JPEG, PNG, GIF, WebP"
                  token={token}
                  value={form.thumbnail}
                  onChange={(url) => update("thumbnail", url)}
                  accept="image/*"
                />

                <FileUploadField
                  label="Intro Video"
                  hint="MP4, WebM"
                  token={token}
                  value={form.introVideoUrl}
                  onChange={(url) => update("introVideoUrl", url)}
                  accept="video/*"
                />
                <div className="modal-field">
                  <label>...or add video from URL</label>
                  <input
                    type="text"
                    placeholder="https://youtube.com/..."
                    value={form.introVideoUrl.startsWith("/uploads") ? "" : form.introVideoUrl}
                    onChange={(e) => update("introVideoUrl", e.target.value)}
                  />
                </div>

                <p style={{ fontWeight: 600, fontSize: 14, marginTop: 16, marginBottom: 8 }}>Pricing Model</p>
                <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}>
                    <input
                      type="radio"
                      checked={form.pricingModel === "free"}
                      onChange={() => update("pricingModel", "free")}
                    />
                    Free
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}>
                    <input
                      type="radio"
                      checked={form.pricingModel === "paid"}
                      onChange={() => update("pricingModel", "paid")}
                    />
                    Paid
                  </label>
                </div>
                {form.pricingModel === "paid" && (
                  <input
                    type="number"
                    min="0"
                    placeholder="Price (Rs)"
                    value={form.price}
                    onChange={(e) => update("price", e.target.value)}
                    style={{ marginBottom: 16 }}
                  />
                )}

                <TagInput
                  label="Categories"
                  placeholder="Type a category and press Enter"
                  values={form.categories}
                  onChange={(v) => update("categories", v)}
                />
                <TagInput
                  label="Tags"
                  placeholder="Type a tag and press Enter"
                  values={form.tags}
                  onChange={(v) => update("tags", v)}
                />

                <div className="modal-field">
                  <label>Author</label>
                  <input
                    type="text"
                    value={user?.firstName ? `${user.firstName} ${user.lastName || ""}` : user?.username || ""}
                    disabled
                    style={{ background: "#f3f4f6", color: "#6b7280" }}
                  />
                </div>
              </div>
            </div>
          )}

          {step === "curriculum" && (
            <div>
              {form.curriculum.map((topic, tIndex) => (
                <div key={tIndex} style={{ border: "1px solid #e2e5ef", borderRadius: 10, padding: 16, marginBottom: 16 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
                    <input
                      type="text"
                      placeholder={`Topic ${tIndex + 1} title`}
                      value={topic.title}
                      onChange={(e) => updateTopicTitle(tIndex, e.target.value)}
                      style={{ flex: 1 }}
                    />
                    {form.curriculum.length > 1 && (
                      <button
                        onClick={() => removeTopic(tIndex)}
                        style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: 13 }}
                      >
                        Remove Topic
                      </button>
                    )}
                  </div>

                  {topic.lessons.map((lesson, lIndex) => (
                    <div key={lIndex} style={{ background: "#f9fafb", borderRadius: 8, padding: 12, marginBottom: 8 }}>
                      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                        <input
                          type="text"
                          placeholder={`Lesson ${lIndex + 1} title`}
                          value={lesson.title}
                          onChange={(e) => updateLesson(tIndex, lIndex, "title", e.target.value)}
                          style={{ flex: 1 }}
                        />
                        {topic.lessons.length > 1 && (
                          <button
                            onClick={() => removeLesson(tIndex, lIndex)}
                            style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer" }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      <textarea
                        placeholder="Lesson content / notes"
                        value={lesson.content}
                        onChange={(e) => updateLesson(tIndex, lIndex, "content", e.target.value)}
                        rows={2}
                        style={{ marginBottom: 8 }}
                      />
                      <input
                        type="text"
                        placeholder="Lesson video URL (optional)"
                        value={lesson.videoUrl}
                        onChange={(e) => updateLesson(tIndex, lIndex, "videoUrl", e.target.value)}
                      />
                    </div>
                  ))}

                  <button
                    onClick={() => addLesson(tIndex)}
                    style={{ fontSize: 13, color: "#4a60c8", background: "none", border: "1px dashed #c7d2fe", borderRadius: 8, padding: "6px 12px", cursor: "pointer" }}
                  >
                    ＋ Add Lesson
                  </button>
                </div>
              ))}

              <button
                onClick={addTopic}
                className="modal-cancel-btn"
                style={{ width: "100%" }}
              >
                ＋ Add Topic
              </button>
            </div>
          )}

          {step === "additional" && (
            <div>
              <TagInput
                label="Requirements"
                placeholder="e.g. Basic JavaScript knowledge — press Enter"
                values={form.requirements}
                onChange={(v) => update("requirements", v)}
              />
              <TagInput
                label="Target Audience"
                placeholder="e.g. Beginner web developers — press Enter"
                values={form.targetAudience}
                onChange={(v) => update("targetAudience", v)}
              />
              <TagInput
                label="Materials Included"
                placeholder="e.g. Downloadable source code — press Enter"
                values={form.materials}
                onChange={(v) => update("materials", v)}
              />

              <p style={{ fontWeight: 600, fontSize: 14, marginTop: 16, marginBottom: 8 }}>FAQ</p>
              {form.faqs.map((faq, i) => (
                <div key={i} style={{ background: "#f9fafb", borderRadius: 8, padding: 12, marginBottom: 8 }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <input
                      type="text"
                      placeholder="Question"
                      value={faq.question}
                      onChange={(e) => updateFaq(i, "question", e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <button
                      onClick={() => removeFaq(i)}
                      style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer" }}
                    >
                      ✕
                    </button>
                  </div>
                  <textarea
                    placeholder="Answer"
                    value={faq.answer}
                    onChange={(e) => updateFaq(i, "answer", e.target.value)}
                    rows={2}
                  />
                </div>
              ))}
              <button
                onClick={addFaq}
                style={{ fontSize: 13, color: "#4a60c8", background: "none", border: "1px dashed #c7d2fe", borderRadius: 8, padding: "6px 12px", cursor: "pointer" }}
              >
                ＋ Add FAQ
              </button>
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ justifyContent: "space-between" }}>
          <button className="modal-cancel-btn" onClick={goBack} disabled={stepIndex === 0}>
            Back
          </button>
          {stepIndex < STEPS.length - 1 ? (
            <button className="modal-publish-btn" onClick={goNext}>Next</button>
          ) : (
            <button className="modal-publish-btn" onClick={() => handleSave("publish")} disabled={saving}>
              {saving ? "Publishing..." : "Publish"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}