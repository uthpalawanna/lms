import "./Dashboard.css";
import PayHereButton from "./PayHereButton";

export default function CheckoutModal({ course, token, onClose, onPaid, errorMessage, onError }) {
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

        <div className="checkout-form">
          {errorMessage && <div className="checkout-form-error">{errorMessage}</div>}

          <p className="checkout-disclaimer">
            You'll be redirected to PayHere's secure checkout to complete payment.
          </p>

          <PayHereButton course={course} token={token} onSuccess={onPaid} onError={onError} />
        </div>
      </div>
    </div>
  );
}
