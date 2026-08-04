import React from "react";


export default function SkeletonCourseGrid({ count = 6 }) {
  return (
    <div className="course-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div className="course-card skeleton-card" key={i}>
          <div className="skeleton-block skeleton-thumb" />
          <div className="course-content">
            <div className="skeleton-block skeleton-line skeleton-line-sm" />
            <div className="skeleton-block skeleton-line skeleton-line-lg" />
            <div className="skeleton-block skeleton-line skeleton-line-md" />
          </div>
          <div className="course-footer">
            <div className="skeleton-block skeleton-line skeleton-line-xs" />
            <div className="skeleton-block skeleton-pill" />
          </div>
        </div>
      ))}
    </div>
  );
}