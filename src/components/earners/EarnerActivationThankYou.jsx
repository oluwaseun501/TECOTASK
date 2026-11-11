import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../../services/auth.js";
import SuccessConfetti from "../components/SuccessConfetti";
import "../../styles/ThankYouPage.css"; // Make sure to create this file (Step 4)

const POLL_INTERVAL_MS = 5000;
const MAX_POLL_ATTEMPTS = 60;

const getAuthToken = () =>
  sessionStorage.getItem("tecotaskToken") ||
  localStorage.getItem("tecotaskToken");

export default function EarnerActivationThankYou() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference") || "";

  const [status, setStatus] = useState(reference ? "checking" : "missing");
  const [message, setMessage] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!reference) {
      setStatus("missing");
      setMessage("We couldn’t find a payment reference. Please return to the activation page to try again.");
      return undefined;
    }

    const token = getAuthToken();
    if (!token) {
      navigate("/login", { replace: true });
      return undefined;
    }

    let isCancelled = false;
    let pollTimer;
    let redirectTimer;
    let attempts = 0;

    setStatus("checking");
    setMessage("Thank you. We’re confirming your payment with KoraPay before activating your account.");

    async function checkPayment() {
      if (isCancelled) return;
      attempts += 1;

      try {
        const result = await authApi.getEarnerActivationStatus(reference, token);
        if (isCancelled) return;

        const payment = result.activationPayment;

        if (payment?.status === "success") {
          setStatus("success");
          setMessage("Your payment is confirmed and your earner account is now active.");
          redirectTimer = window.setTimeout(() => navigate("/earners", { replace: true }), 5000); // 5 seconds so they can read the message
          return;
        }

        if (payment?.status === "failed") {
          setStatus("failed");
          setMessage("The payment was not completed, so your account has not been activated.");
          return;
        }

        if (payment?.status === "review") {
          setStatus("review");
          setMessage(result.message || payment.reviewReason || "Your payment needs review. Your account has not been activated yet.");
          return;
        }

        setStatus("checking");
        setMessage("Your payment is still processing. We’ll check again shortly.");
      } catch {
        if (isCancelled) return;
        setStatus("checking");
        setMessage("We’re still checking your payment status. Please keep this page open.");
      }

      if (attempts >= MAX_POLL_ATTEMPTS) {
        setStatus("pending");
        setMessage("KoraPay has not confirmed the payment yet. You can check again or return to activation.");
        return;
      }

      pollTimer = window.setTimeout(checkPayment, POLL_INTERVAL_MS);
    }

    checkPayment();

    return () => {
      isCancelled = true;
      if (pollTimer) window.clearTimeout(pollTimer);
      if (redirectTimer) window.clearTimeout(redirectTimer);
    };
  }, [reference, retryCount, navigate]);

  const isSuccess = status === "success";
  const isFailure = status === "failed" || status === "review" || status === "missing";

  return (
    <main className="thank-you-page">
      {isSuccess && <SuccessConfetti />}
      
      <section className={`thank-you-card status-${status}`}>
        <div className="thank-you-icon-wrapper">
          {isSuccess ? (
            <div className="animated-checkmark">✓</div>
          ) : isFailure ? (
            <div className="animated-cross">!</div>
          ) : (
            <div className="animated-loader">…</div>
          )}
        </div>

        <p className="thank-you-eyebrow">Earner Account Activation</p>

        <h1 className="thank-you-title">
          {isSuccess ? "Welcome to the Earner Workspace!" : isFailure ? "Payment Issue" : "Confirming Payment..."}
        </h1>

        {isSuccess ? (
          <div className="success-copy">
            <p className="thank-you-message">
              Your account is officially active. You can now start completing simple tasks, submitting proof, and earning real money directly to your bank account.
            </p>
            <p className="thank-you-message-highlight">
              🚀 Start earning money and making more for yourself today!
            </p>
          </div>
        ) : (
          <p className="thank-you-message">{message}</p>
        )}

        {reference && (
          <div className="thank-you-reference">
            <span>Payment Reference</span>
            <code>{reference}</code>
          </div>
        )}

        {isSuccess && (
          <p className="thank-you-redirect">
            Taking you to your dashboard in a few seconds...
          </p>
        )}

        <div className="thank-you-actions">
          {status === "pending" && (
            <button
              type="button"
              className="thank-you-btn primary"
              onClick={() => setRetryCount((count) => count + 1)}
            >
              Check Payment Again
            </button>
          )}

          <Link
            to={isSuccess ? "/earners" : "/earners/activate"}
            className={`thank-you-btn ${status === "pending" ? "secondary" : "primary"}`}
          >
            {isSuccess ? "Go to Dashboard Now" : "Return to Activation"}
          </Link>
        </div>
      </section>
    </main>
  );
}