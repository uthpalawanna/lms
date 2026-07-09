import { useState } from "react";

const API_URL = "http://localhost:5000/api/quizzes";

function emptyQuestion() {
  return { questionText: "", options: ["", ""], correctOptionIndex: 0 };
}

export default function CreateQuizModal({ token, courseId, onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateQuestion = (qIndex, field, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIndex ? { ...q, [field]: value } : q))
    );
  };

  const updateOption = (qIndex, oIndex, value) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? { ...q, options: q.options.map((o, j) => (j === oIndex ? value : o)) }
          : q
      )
    );
  };

  const addOption = (qIndex) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIndex ? { ...q, options: [...q.options, ""] } : q))
    );
  };

  const removeOption = (qIndex, oIndex) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex || q.options.length <= 2) return q;
        const newOptions = q.options.filter((_, j) => j !== oIndex);
        const newCorrect = q.correctOptionIndex >= newOptions.length ? 0 : q.correctOptionIndex;
        return { ...q, options: newOptions, correctOptionIndex: newCorrect };
      })
    );
  };

  const addQuestion = () => setQuestions((prev) => [...prev, emptyQuestion()]);

  const removeQuestion = (qIndex) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== qIndex));
  };

  const handleCreate = async () => {
    setError("");

    if (!title.trim()) {
      setError("Please enter a quiz title.");
      return;
    }
    for (const q of questions) {
      if (!q.questionText.trim()) {
        setError("Every question needs text.");
        return;
      }
      if (q.options.some((o) => !o.trim())) {
        setError("Every option needs text (no blanks).");
        return;
      }
    }

    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ course: courseId, title, questions }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Could not create the quiz.");
        setLoading(false);
        return;
      }

      onCreated?.(data);
    } catch (err) {
      console.error(err);
      setError("Could not reach the server. Is the backend running?");
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640, maxHeight: "85vh", overflowY: "auto" }}>
        <div className="modal-header">
          <h3>Create Quiz</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-field">
            <label>Quiz Title</label>
            <input
              type="text"
              placeholder="e.g. Chapter 1 Quiz"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {questions.map((q, qIndex) => (
            <div
              key={qIndex}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: 14,
                marginTop: 16,
                background: "#f9fafb",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <strong style={{ fontSize: 13 }}>Question {qIndex + 1}</strong>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    style={{ fontSize: 12, color: "#dc2626", background: "none", border: "none", cursor: "pointer" }}
                  >
                    Remove
                  </button>
                )}
              </div>

              <input
                type="text"
                placeholder="Question text"
                value={q.questionText}
                onChange={(e) => updateQuestion(qIndex, "questionText", e.target.value)}
                style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #d0d5dd", marginBottom: 10, boxSizing: "border-box" }}
              />

              {q.options.map((opt, oIndex) => (
                <div key={oIndex} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <input
                    type="radio"
                    name={`correct-${qIndex}`}
                    checked={q.correctOptionIndex === oIndex}
                    onChange={() => updateQuestion(qIndex, "correctOptionIndex", oIndex)}
                    title="Mark as correct answer"
                  />
                  <input
                    type="text"
                    placeholder={`Option ${oIndex + 1}`}
                    value={opt}
                    onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                    style={{ flex: 1, padding: "6px 10px", borderRadius: 6, border: "1px solid #d0d5dd" }}
                  />
                  {q.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(qIndex, oIndex)}
                      style={{ fontSize: 12, color: "#9ca3af", background: "none", border: "none", cursor: "pointer" }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() => addOption(qIndex)}
                style={{ fontSize: 12, color: "#3d56c8", background: "none", border: "none", cursor: "pointer", marginTop: 4 }}
              >
                + Add option
              </button>
              <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 6 }}>
                Select the radio button next to the correct answer.
              </p>
            </div>
          ))}

          <button
            type="button"
            onClick={addQuestion}
            style={{ marginTop: 14, fontSize: 13, color: "#3d56c8", background: "none", border: "1px dashed #c7d2fe", borderRadius: 8, padding: "8px 14px", cursor: "pointer", width: "100%" }}
          >
            + Add Question
          </button>

          {error && (
            <p style={{ color: "#dc2626", fontSize: 13, marginTop: 12 }}>{error}</p>
          )}
        </div>

        <div className="modal-footer">
          <button className="modal-cancel-btn" onClick={onClose}>Cancel</button>
          <button className="modal-publish-btn" onClick={handleCreate} disabled={loading}>
            {loading ? "Creating..." : "Create Quiz"}
          </button>
        </div>
      </div>
    </div>
  );
}