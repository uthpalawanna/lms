import React, { useState } from "react";
import { CourseSelect, SimpleSelect, DateField, CloudSearchEmptyIcon } from "./FilterControls";

export default function QuizAttempts() {
  const [course, setCourse] = useState("all");
  const [sortBy, setSortBy] = useState("desc");
  const [date, setDate] = useState("");

  return (
    <div className="ec-container">
      <h2 className="db-section-title">Quiz Attempts</h2>

      <div className="announcement-filters">
        <div className="filter-group">
          <label>Courses</label>
          <CourseSelect value={course} onChange={setCourse} />
        </div>
        <div className="filter-group">
          <label>Sort By</label>
          <SimpleSelect
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: "asc", label: "ASC" },
              { value: "desc", label: "DESC" },
            ]}
          />
        </div>
        <div className="filter-group">
          <label>Create Date</label>
          <DateField value={date} onChange={setDate} />
        </div>
      </div>

      <div className="ec-tab-content">
        <div className="ec-empty-state">
          <CloudSearchEmptyIcon />
          <p className="ec-empty-text" style={{ color: "#16a34a", fontWeight: 700 }}>No Data Found.</p>
        </div>
      </div>
    </div>
  );
}