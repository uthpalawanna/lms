import { useState } from "react";
import { API_URL } from "./api/config";

const PAYHERE_SCRIPT_SRC = "https://www.payhere.lk/lib/payhere.js";

function loadPayHereScript() {
  return new Promise((resolve, reject) => {
    if (window.payhere) return resolve();
    const existing = document.querySelector(`script[src="${PAYHERE_SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.src = PAYHERE_SCRIPT_SRC;
    script.onload = () => resolve();
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

export default function PayHereCartButton({ token, totalAmount, onSuccess, onError, disabled }) {
  const [loading, setLoading] = useState(false);

  const pollUntilPaid = async (orderId) => {
    for (let i = 0; i < 6; i++) {
      const res = await fetch(`${API_URL}/api/payments/payhere/status/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === "paid") return true;
      if (data.status === "failed" || data.status === "cancelled") return false;
      await new Promise((r) => setTimeout(r, 1500));
    }
    return false;
  };

  const handlePay = async () => {
    setLoading(true);
    try {
      await loadPayHereScript();

      const res = await fetch(`${API_URL}/api/payments/payhere/init-cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const payment = await res.json();
      if (!res.ok) throw new Error(payment.message || "Could not start checkout.");

      window.payhere.onCompleted = async function (orderId) {
        const paid = await pollUntilPaid(orderId);
        setLoading(false);
        if (paid) {
          onSuccess();
        } else {
          onError("Payment received but confirmation is taking a bit longer than usual. Check back shortly.");
        }
      };

      window.payhere.onDismissed = function () {
        setLoading(false);
      };

      window.payhere.onError = function (error) {
        setLoading(false);
        onError(typeof error === "string" ? error : "Payment failed.");
      };

      window.payhere.startPayment(payment);
    } catch (err) {
      setLoading(false);
      onError(err.message || "Checkout failed to start.");
    }
  };

  return (
    <button type="button" className="checkout-submit-btn" onClick={handlePay} disabled={loading || disabled}>
      {loading ? "Opening PayHere…" : `Checkout · Pay Rs${Number(totalAmount || 0).toFixed(2)}`}
    </button>
  );
}