import { useState } from "react";

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

export default function PayHereButton({ course, token, onSuccess, onError }) {
  const [loading, setLoading] = useState(false);

  const pollUntilPaid = async (orderId) => {
    for (let i = 0; i < 6; i++) {
      const res = await fetch(`http://localhost:5000/api/payments/payhere/status/${orderId}`, {
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

      const res = await fetch("http://localhost:5000/api/payments/payhere/init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ course: course._id }),
      });
      const payment = await res.json();
      if (!res.ok) throw new Error(payment.message || "Could not start payment.");

      window.payhere.onCompleted = async function (orderId) {
        // The server-to-server notify webhook is what actually grants the
        // enrollment. This just waits for that to land before updating the UI.
        const paid = await pollUntilPaid(orderId);
        setLoading(false);
        if (paid) {
          onSuccess();
        } else {
          onError("Payment received but confirmation is taking a bit longer than usual. Check Order History shortly.");
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
      onError(err.message || "Payment failed to start.");
    }
  };

  return (
    <button type="button" className="checkout-submit-btn" onClick={handlePay} disabled={loading}>
      {loading ? "Opening PayHere…" : `Pay Rs${Number(course?.price || 0).toFixed(2)} with PayHere`}
    </button>
  );
}
