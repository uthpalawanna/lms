import React, { useState } from "react";
import "./dashboard.css"

export default function CheckoutModal({ course, onClose, onConfirm, submitting, errorMessage }) {
  const [method, setMethod] = useState("Credit Card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [localError, setLocalError] = useState("");

  const formatCardNumber = (value) =>
    value.replace(/\D/g, "").slice(0, 19).replace(/(\d{4})(?=\d)/g, "$1 ").trim();

  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError("");

    if (method === "PayPal") {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(paypalEmail)) {
        setLocalError("Enter a valid PayPal email.");
        return;
      }
      onConfirm({ paymentMethod: "PayPal", paypalEmail });
      return;
    }

    const digitsOnly = cardNumber.replace(/\s+/g, "");
    if (!/^\d{13,19}$/.test(digitsOnly)) {
      setLocalError("Enter a valid card number.");
      return;
    }
    if (!cardholderName.trim()) {
      setLocalError("Cardholder name is required.");
      return;
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      setLocalError("Enter a valid expiry date (MM/YY).");
      return;
    }
    if (!/^\d{3,4}$/.test(cvv)) {
      setLocalError("Enter a valid CVV.");
      return;
    }

    onConfirm({
      paymentMethod: "Credit Card",
      cardNumber: digitsOnly,
      cardholderName: cardholderName.trim(),
      expiry,
      cvv,
    });
  };

  return (
    <div className="checkout-modal-overlay" onClick={onClose}>
      <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
        <div className="checkout-modal-header">
          <h3>Checkout</h3>
          <button type="button" className="checkout-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="checkout-modal-summary">
          <span>{course?.title}</span>
          <strong>Rs{Number(course?.price || 0).toFixed(2)}</strong>
        </div>

        <div className="checkout-method-toggle">
          <button
            type="button"
            className={method === "Credit Card" ? "active" : ""}
            onClick={() => setMethod("Credit Card")}
          >
            Card
          </button>
          <button
            type="button"
            className={method === "PayPal" ? "active" : ""}
            onClick={() => setMethod("PayPal")}
          >
            PayPal
          </button>
        </div>

        <form onSubmit={handleSubmit} className="checkout-form">
          {method === "Credit Card" ? (
            <>
              <label>
                Cardholder name
                <input
                  type="text"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  placeholder="Name on card"
                  autoComplete="cc-name"
                />
              </label>
              <label>
                Card number
                <input
                  type="text"
                  inputMode="numeric"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  autoComplete="cc-number"
                />
              </label>
              <div className="checkout-form-row">
                <label>
                  Expiry (MM/YY)
                  <input
                    type="text"
                    inputMode="numeric"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    autoComplete="cc-exp"
                  />
                </label>
                <label className="checkout-cvv-field">
                  CVV
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="123"
                    autoComplete="cc-csc"
                  />
                </label>
              </div>
            </>
          ) : (
            <label>
              PayPal email
              <input
                type="email"
                value={paypalEmail}
                onChange={(e) => setPaypalEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </label>
          )}

          {(localError || errorMessage) && (
            <div className="checkout-form-error">{localError || errorMessage}</div>
          )}

          <p className="checkout-disclaimer">
            This is a student project — no real charge will be made. Card details are
            validated for format only and never leave this form beyond the last 4 digits.
          </p>

          <button type="submit" className="checkout-submit-btn" disabled={submitting}>
            {submitting ? "Processing…" : `Pay Rs${Number(course?.price || 0).toFixed(2)}`}
          </button>
        </form>
      </div>
    </div>
  );
}