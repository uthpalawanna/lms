import React, { useState } from "react";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function OrderHistory() {
  const [activeFilter, setActiveFilter] = useState("today");
  const [isCalendarOpen, setIsCalendarOpen] = useState(true);

  const [viewDate, setViewDate] = useState(new Date(2026, 5)); // June (0-indexed, so 5 is June) 2026
  
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 5, 25)); 

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  
  let firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  const handlePrevMonth = () => setViewDate(new Date(currentYear, currentMonth - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(currentYear, currentMonth + 1, 1));
  
  const handleDateClick = (day) => {
    setSelectedDate(new Date(currentYear, currentMonth, day));
  };

  const formattedDate = selectedDate 
    ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
    : "Y-M-d - Y-M-d";

  return (
    <div className="oh-container">
      <h2 className="db-section-title">Order History</h2>

      <div className="oh-filter-bar">
        <div className="oh-quick-filters">
          {["today", "monthly", "yearly"].map((filter) => (
            <button
              key={filter}
              className={`oh-filter-btn ${activeFilter === filter ? "active" : ""}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        <div className="oh-date-wrapper">
          <div 
            className="oh-date-input" 
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
          >
            <span className={`oh-date-placeholder ${selectedDate ? "active-text" : ""}`}>
              {formattedDate}
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a0aabf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>

          {isCalendarOpen && (
            <div className="oh-calendar-popup">
              <div className="oh-cal-header">
                <div className="oh-cal-selectors">
                  <span className="oh-cal-select">{MONTHS[currentMonth]} <small>▼</small></span>
                  <span className="oh-cal-select">{currentYear} <small>▼</small></span>
                </div>
                <div className="oh-cal-arrows">
                  <span onClick={handlePrevMonth}>︿</span>
                  <span onClick={handleNextMonth}>﹀</span>
                </div>
              </div>
              
              <div className="oh-cal-grid">
                <div className="oh-cal-weekdays">
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
                <div className="oh-cal-days">
                  {[...Array(firstDayIndex)].map((_, i) => (
                    <span key={`empty-${i}`} className="oh-cal-day faded"></span>
                  ))}
                  
                  {[...Array(daysInMonth)].map((_, i) => {
                    const day = i + 1;
                    const isSelected = selectedDate?.getDate() === day && 
                                       selectedDate?.getMonth() === currentMonth && 
                                       selectedDate?.getFullYear() === currentYear;

                    return (
                      <span 
                        key={day} 
                        className={`oh-cal-day ${isSelected ? 'active' : ''}`}
                        onClick={() => handleDateClick(day)}
                      >
                        {day}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="oh-cal-footer">
                <span className="oh-cal-selected-text">1 day selected</span>
                <button 
                  className="oh-cal-apply-btn"
                  onClick={() => setIsCalendarOpen(false)}
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="ec-tab-content">
        <div className="ec-empty-state">
          <svg className="ec-empty-icon" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M40 80C35 80 25 70 25 50C25 30 35 20 40 20L80 20C85 20 95 30 95 50C95 70 85 80 80 80L40 80Z" fill="#E2E5EF"/>
            <path d="M40 80C35 80 25 70 25 50C25 30 35 20 40 20L45 20C40 20 30 30 30 50C30 70 40 80 45 80L40 80Z" fill="#C8CDD8"/>
            <rect x="75" y="10" width="10" height="20" rx="2" fill="#4A60C8" transform="rotate(30 75 10)"/>
            <circle cx="10" cy="40" r="2" fill="#C8CDD8"/>
            <circle cx="20" cy="25" r="1.5" fill="#C8CDD8"/>
            <circle cx="105" cy="60" r="2.5" fill="#C8CDD8"/>
          </svg>
          <p className="ec-empty-text">No Data Available in this Section</p>
        </div>
      </div>
    </div>
  );
}