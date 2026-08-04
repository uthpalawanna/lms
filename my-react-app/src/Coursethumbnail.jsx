import React, { useState } from "react";
import { API_URL } from "./api/config";

export function resolveThumbnailUrl(thumbnail) {
  if (!thumbnail) return null;
  if (thumbnail.startsWith("http://") || thumbnail.startsWith("https://")) return thumbnail;
  if (thumbnail.startsWith("/uploads")) return `${API_URL}${thumbnail}`;
  return `${API_URL}/uploads/${thumbnail}`;
}


export default function CourseThumbnail({ thumbnail, title, size = "card" }) {
  const [failed, setFailed] = useState(false);
  const resolvedUrl = resolveThumbnailUrl(thumbnail);
  const isHero = size === "hero";

  return (
    <div className={isHero ? "cd-hero-image" : "course-img-placeholder"}>
      {resolvedUrl && !failed ? (
        <img
          src={resolvedUrl}
          alt={title}
          className="course-thumb-img"
          onError={() => setFailed(true)}
        />
      ) : (
        <svg
          width="100%"
          height="100%"
          viewBox={isHero ? "0 0 800 400" : "0 0 400 200"}
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width={isHero ? 800 : 400} height={isHero ? 400 : 200} fill="#f0f2f8" />
          <circle cx={isHero ? 200 : 100} cy={isHero ? 120 : 60} r={isHero ? 40 : 20} fill="#dce1f0" />
          <path
            d={isHero ? "M300 400 L500 160 L700 400 Z" : "M150 200 L250 80 L350 200 Z"}
            fill="#e2e5ef"
          />
          <path
            d={isHero ? "M500 400 L640 240 L800 400 Z" : "M250 200 L320 120 L400 200 Z"}
            fill="#dce1f0"
          />
        </svg>
      )}
    </div>
  );
}