import { useState, useEffect } from "react";

const QUIZ_URL = "http://localhost:5000/api/quizzes";
const ATTEMPT_URL = "http://localhost:5000/api/quiz-attempts";

export default function TakeQuizModal({ token, quizId, onClose, onSubmitted, previewMode = false }) {
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    async function fetchQuiz() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${QUIZ_URL}/${quizId}/take`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Could not load the quiz.");
          setLoading(false);
          return;
        }

        setQuiz(data);
        setAnswers(new Array(data.questions.length).fill(-1));
      } catch (err) {
        console.error(err);
        setError("Could not reach the server. Is the backend running?");
      } finally {
        setLoading(false);
      }
    }

    fetchQuiz();
  }, [quizId, token]);

  const selectAnswer = (qIndex, optionIndex) => {
    setAnswers((prev) => prev.map((a, i) => (i === qIndex ? optionIndex : a)));
  };

  const handleSubmit = async () => {
    if (previewMode) return;
    setError("");
    if (answers.some((a) => a === -1)) {
      setError("Please answer every question before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(ATTEMPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quiz: quizId, answers }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Could not submit the quiz.");
        setSubmitting(false);
        return;
      }

      setResult(data);
      onSubmitted?.(data);
    } catch (err) {
      console.error(err);
      setError("Could not reach the server. Is the backend running?");
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={result ? onClose : undefined}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600, maxHeight: "85vh", overflowY: "auto" }}>
        <div className="modal-header">
          <h3>{previewMode ? `Preview: ${quiz?.title || "Quiz"}` : quiz?.title || "Quiz"}</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <p>Loading quiz...</p>
          ) : result ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 6 }}>Your Score</p>
              <p style={{ fontSize: 36, fontWeight: 700, color: "#3d56c8", margin: 0 }}>
                {result.score} / {result.totalQuestions}
              </p>
              <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 10 }}>
                This attempt has been saved to your quiz history.
              </p>
            </div>
          ) : error && !quiz ? (
            <p style={{ color: "#dc2626" }}>{error}</p>
          ) : (
            <>
              {previewMode && (
                <p style={{ fontSize: 12, color: "#9ca3af", marginTop: -6, marginBottom: 14 }}>
                  Preview mode — this is how students see the quiz. Answers here aren't graded or saved.
                </p>
              )}
              {quiz?.questions.map((q, qIndex) => (
                <div key={qIndex} style={{ marginBottom: 20 }}>
                  <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>
                    {qIndex + 1}. {q.questionText}
                  </p>
                  {q.options.map((opt, oIndex) => (
                    <label
                      key={oIndex}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "8px 10px",
                        border: "1px solid #e5e7eb",
                        borderRadius: 8,
                        marginBottom: 6,
                        cursor: "pointer",
                        background: answers[qIndex] === oIndex ? "#eef0f8" : "#fff",
                      }}
                    >
                      <input
                        type="radio"
                        name={`answer-${qIndex}`}
                        checked={answers[qIndex] === oIndex}
                        onChange={() => selectAnswer(qIndex, oIndex)}
                      />
                      <span style={{ fontSize: 14 }}>{opt}</span>
                    </label>
                  ))}
                </div>
              ))}

              {error && (
                <p style={{ color: "#dc2626", fontSize: 13 }}>{error}</p>
              )}
            </>
          )}
        </div>

        <div className="modal-footer">
          {result ? (
            <button className="modal-publish-btn" onClick={onClose}>Done</button>
          ) : previewMode ? (
            <button className="modal-publish-btn" onClick={onClose}>Close Preview</button>
          ) : (
            <>
              <button className="modal-cancel-btn" onClick={onClose}>Cancel</button>
              <button className="modal-publish-btn" onClick={handleSubmit} disabled={submitting || loading || !!error && !quiz}>
                {submitting ? "Submitting..." : "Submit Quiz"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}