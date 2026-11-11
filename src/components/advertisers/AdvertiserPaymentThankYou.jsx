import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../../services/auth.js";
import SuccessConfetti from "../components/SuccessConfetti";
import "../../styles/ThankYouPage.css";

const POLL_INTERVAL_MS = 5000;
const MAX_POLL_ATTEMPTS = 60;

function getAuthToken() {
  return sessionStorage.getItem("tecotaskToken") || localStorage.getItem("tecotaskToken");
}

export default function AdvertiserPaymentThankYou() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference") || "";

  const [status, setStatus] = useState(reference ? "checking" : "missing");
  const [message, setMessage] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!reference) {
      setStatus("missing");
      setMessage("We couldn’t find a payment reference. Please return to your wallet to check your balance.");
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
    setMessage("Thank you. We’re confirming your payment with KoraPay before updating your wallet.");

    async function checkPayment() {
      if (isCancelled) return;
      attempts += 1;

      try {
        const result = await authApi.getAdvertiserWalletTopUpStatus(reference, token);
        if (isCancelled) return;

        const topUp = result.topUp;

        if (topUp?.status === "success") {
          setStatus("success");
          setMessage("Your payment is confirmed and your advertiser wallet has been funded.");
          redirectTimer = window.setTimeout(() => navigate("/advertisers/wallet", { replace: true }), 5000);
          return;
        }

        if (topUp?.status === "failed") {
          setStatus("failed");
          setMessage("The payment was not completed, so your wallet was not credited.");
          return;
        }

        if (topUp?.status === "review") {
          setStatus("review");
          setMessage(result.message || topUp.reviewReason || "Your payment needs review. Your wallet has not been credited yet.");
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
        setMessage("KoraPay has not confirmed the payment yet. You can check again or return to your wallet.");
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

        <p className="thank-you-eyebrow">Advertiser Wallet Funding</p>

        <h1 className="thank-you-title">
          {isSuccess ? "Your Wallet is Funded!" : isFailure ? "Payment Issue" : "Confirming Payment..."}
        </h1>

        {isSuccess ? (
          <div className="success-copy">
            <p className="thank-you-message">
              Your payment was successful and your wallet is ready. You can now create campaigns, target real people, and promote your business to a wider audience.
            </p>
            <p className="thank-you-message-highlight">
              📈 Reach more people and grow your business with us today!
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
            Taking you to your wallet in a few seconds...
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
            to="/advertisers/wallet"
            className={`thank-you-btn ${status === "pending" ? "secondary" : "primary"}`}
          >
            Go to Wallet Now
          </Link>
        </div>
      </section>
    </main>
  );
}