import React, { useState, useEffect } from "react";
import { API_URL } from "./api/config";
import PayHereCartButton from "./PayHereCartButton";

const ORDERS_URL = `${API_URL}/api/orders/mine`;
const CART_URL = `${API_URL}/api/cart`;

const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function OrderHistory({ token }) {
  const [activeFilter, setActiveFilter] = useState("today");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const [viewDate, setViewDate] = useState(new Date()); 
  const [selectedDate, setSelectedDate] = useState(new Date()); 

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartMessage, setCartMessage] = useState("");
  const [removingId, setRemovingId] = useState(null);

  const fetchCart = async () => {
    if (!token) return;
    setCartLoading(true);
    try {
      const res = await fetch(`${CART_URL}/mine`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setCartItems(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [token]);

  const handleRemoveFromCart = async (courseId) => {
    setRemovingId(courseId);
    try {
      const res = await fetch(`${CART_URL}/${courseId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setCartItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setRemovingId(null);
    }
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.course?.price || 0), 0);

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
    : "Y-M-d -- Y-M-d";

  const fetchOrders = async () => {
    if (!token || !selectedDate) return;
    setLoading(true);
    setError("");
    try {
      const dateParam = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
      const response = await fetch(
        `${ORDERS_URL}?range=${activeFilter}&date=${dateParam}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Could not load your orders.");
        setOrders([]);
        return;
      }
      setOrders(data);
    } catch (err) {
      console.error(err);
      setError("Could not reach the server. Is the backend running?");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token, activeFilter, selectedDate]);

  return (
    <div className="oh-container">
      <h2 className="db-section-title">Order History</h2>

      {!cartLoading && cartItems.length > 0 && (
        <div className="ec-tab-content" style={{ marginBottom: 24, padding: 20 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 16 }}>Your Cart</h3>

          {cartMessage && (
            <p style={{ color: "#dc2626", fontWeight: 600, marginBottom: 12 }}>{cartMessage}</p>
          )}

          <div className="oh-order-list">
            {cartItems.map((item) => (
              <div key={item.course?._id || item._id} className="oh-order-row">
                <div className="oh-order-main">
                  <span className="oh-order-course">{item.course?.title || "Untitled course"}</span>
                </div>
                <div className="oh-order-side" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span className="oh-order-amount">Rs{Number(item.course?.price || 0).toLocaleString()}</span>
                  <button
                    className="db-new-course-btn"
                    style={{ padding: "4px 10px", fontSize: 12, background: "transparent", color: "#dc2626", border: "1px solid #dc2626" }}
                    disabled={removingId === item.course?._id}
                    onClick={() => handleRemoveFromCart(item.course?._id)}
                  >
                    {removingId === item.course?._id ? "Removing…" : "Remove"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 16, marginTop: 16 }}>
            <span style={{ fontWeight: 700 }}>Total: Rs{cartTotal.toLocaleString()}</span>
            <PayHereCartButton
              token={token}
              totalAmount={cartTotal}
              onSuccess={() => {
                setCartMessage("");
                fetchCart();
                fetchOrders();
              }}
              onError={(msg) => setCartMessage(msg)}
            />
          </div>
        </div>
      )}

      <div className="oh-filter-bar">
        
        <div className="oh-quick-filters">
          {["Today", "Monthly", "Yearly"].map((filter) => (
            <button
              key={filter.toLowerCase()}
              className={`oh-filter-btn ${activeFilter === filter.toLowerCase() ? "active" : ""}`}
              onClick={() => setActiveFilter(filter.toLowerCase())}
            >
              {filter}
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a0aabf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

      {loading ? (
        <div className="ec-tab-content">
          <p style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
            <span className="db-spinner" />
            Loading your orders...
          </p>
        </div>
      ) : error ? (
        <div className="ec-tab-content">
          <p style={{ padding: "2rem", textAlign: "center", color: "var(--danger-text)" }}>
            {error}
          </p>
        </div>
      ) : orders.length === 0 ? (
        <div className="ec-tab-content">
          <div className="ec-empty-state">
            <svg className="ec-empty-icon" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M40 80C35 80 25 70 25 50C25 30 35 20 40 20L80 20C85 20 95 30 95 50C95 70 85 80 80 80L40 80Z" fill="#E2E5EF"/>
              <path d="M40 80C35 80 25 70 25 50C25 30 35 20 40 20L45 20C40 20 30 30 30 50C30 70 40 80 45 80L40 80Z" fill="#C8CDD8"/>
              <rect x="75" y="10" width="10" height="20" rx="2" transform="rotate(30 75 10)"/>
              <circle cx="10" cy="40" r="2" fill="#C8CDD8"/>
              <circle cx="20" cy="25" r="1.5" fill="#C8CDD8"/>
              <circle cx="105" cy="60" r="2.5" fill="#C8CDD8"/>
            </svg>
            <p className="ec-empty-text">No Data Available in this Section</p>
          </div>
        </div>
      ) : (
        <div className="oh-order-list">
          {orders.map((order) => {
            const courseNames = order.courses?.length
              ? order.courses.map((c) => c.course?.title).filter(Boolean).join(", ")
              : order.course?.title || "Untitled course";
            return (
              <div key={order._id} className="oh-order-row">
                <div className="oh-order-main">
                  <span className="oh-order-course">{courseNames}</span>
                  <span className="oh-order-date">{formatDate(order.createdAt)}</span>
                </div>
                <div className="oh-order-side">
                  <span className="oh-order-amount">
                    {order.amount > 0 ? `Rs${order.amount.toLocaleString()}` : "Free"}
                  </span>
                  <span className={`oh-order-status ${order.status}`}>{order.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}