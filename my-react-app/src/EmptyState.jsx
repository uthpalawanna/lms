import React from "react";

export default function EmptyState({ message }) {
  return (
    <div className="empty-state-card">
      <p>{message}</p>
    </div>
  );
}
