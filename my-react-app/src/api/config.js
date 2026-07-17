// Shared API base URL (no trailing slash, no /api suffix — callers append
// their own path, e.g. `${API_URL}/api/quizzes`).
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
