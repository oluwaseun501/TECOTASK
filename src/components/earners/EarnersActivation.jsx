import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../../services/auth.js";
import "../../styles/EarnersActivation.css";

const getAuthToken = () =>
  sessionStorage.getItem("tecotaskToken") ||
  localStorage.getItem("tecotaskToken");

const EarnersActivation = () => {
  const navigate = useNavigate();
  const [isStartingPayment, setIsStartingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const handlePayment = async (event) => {
    event.preventDefault();
    setPaymentError("");

    const token = getAuthToken();

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setIsStartingPayment(true);

    try {
      const result = await authApi.startEarnerActivation(token);

      if (result.isActivated) {
        navigate("/earners", { replace: true });
        return;
      }

      const checkoutUrl =
        result.activationPayment?.checkoutUrl;

      if (!checkoutUrl) {
        throw new Error(
          "KoraPay did not return a checkout link. Please try again.",
        );
      }

      window.location.assign(checkoutUrl);
    } catch (error) {
      setPaymentError(
        error.message ||
          "Could not start the activation payment. Please try again.",
      );
      setIsStartingPayment(false);
    }
  };

  return (
    <main className="activation-page">
      <header className="activation-page__header">
        <Link to="/earners" className="activation-page__brand">
          <span>T</span>
          Teco<span>Task</span>
        </Link>

        <Link to="/earners" className="activation-page__back">
          ← Back to dashboard
        </Link>
      </header>

      <section className="activation-page__content">
        <div className="activation-page__intro">
          <span>Unlock your earner account</span>

          <h1>Activate your account and start earning.</h1>

          <p>
            Pay a one-time activation fee and get access to available tasks,
            proof submissions, withdrawals, and referral rewards.
          </p>

          <div className="activation-benefits">
            <div>
              <span>✓</span>
              <p>
                <strong>Complete tasks</strong>
                Find simple tasks from verified advertisers.
              </p>
            </div>

            <div>
              <span>✓</span>
              <p>
                <strong>Submit proof</strong>
                Upload screenshots and track moderation results.
              </p>
            </div>

            <div>
              <span>✓</span>
              <p>
                <strong>Withdraw earnings</strong>
                Receive approved rewards directly to your bank account.
              </p>
            </div>
          </div>
        </div>

        <section className="activation-payment-card">
          <div className="activation-payment-card__heading">
            <div>
              <span>One-time activation</span>
              <h2>Pay securely with KoraPay</h2>
            </div>

            <strong>₦1,200</strong>
          </div>

          <p className="activation-payment-card__note">
            This is a one-time account activation fee, not a subscription.
            Your account activates after TecoTask verifies the payment.
          </p>

          <form onSubmit={handlePayment}>
            {paymentError && (
              <p role="alert">{paymentError}</p>
            )}

            <button
              type="submit"
              className="activation-pay-button"
              disabled={isStartingPayment}
            >
              {isStartingPayment
                ? "Opening KoraPay…"
                : "Pay ₦1,200 and activate"}
              <span>→</span>
            </button>

            <small className="activation-secure-note">
              KoraPay processes the payment. TecoTask confirms it on the
              server before activating your account.
            </small>
          </form>
        </section>
      </section>
    </main>
  );
};

export default EarnersActivation;