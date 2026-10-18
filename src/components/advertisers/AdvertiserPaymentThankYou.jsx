import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { authApi } from "../../services/auth.js";
import "../../styles/AdvertiserWallet.css";

const POLL_INTERVAL_MS = 5000;
const MAX_POLL_ATTEMPTS = 60;

function getAuthToken() {
  return (
    sessionStorage.getItem("tecotaskToken") ||
    localStorage.getItem("tecotaskToken")
  );
}

export default function AdvertiserPaymentThankYou() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference") || "";

  const [status, setStatus] = useState(
    reference ? "checking" : "missing",
  );
  const [message, setMessage] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!reference) {
      setStatus("missing");
      setMessage(
        "We couldn’t find a payment reference. Please return to your wallet to check your balance.",
      );
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
    setMessage(
      "Thank you. We’re confirming your payment with KoraPay before updating your wallet.",
    );

    async function checkPayment() {
      if (isCancelled) return;

      attempts += 1;

      try {
        const result =
          await authApi.getAdvertiserWalletTopUpStatus(
            reference,
            token,
          );

        if (isCancelled) return;

        const topUp = result.topUp;

        if (topUp?.status === "success") {
          setStatus("success");
          setMessage(
            "Your payment is confirmed and your advertiser wallet has been funded.",
          );

          redirectTimer = window.setTimeout(() => {
            navigate("/advertisers/wallet", {
              replace: true,
            });
          }, 3000);

          return;
        }

        if (topUp?.status === "failed") {
          setStatus("failed");
          setMessage(
            "The payment was not completed, so your wallet was not credited.",
          );
          return;
        }

        if (topUp?.status === "review") {
          setStatus("review");
          setMessage(
            result.message ||
              topUp.reviewReason ||
              "Your payment needs review. Your wallet has not been credited yet.",
          );
          return;
        }

        setStatus("checking");
        setMessage(
          "Your payment is still processing. We’ll check again shortly.",
        );
      } catch {
        if (isCancelled) return;

        setStatus("checking");
        setMessage(
          "We’re still checking your payment status. Please keep this page open.",
        );
      }

      if (attempts >= MAX_POLL_ATTEMPTS) {
        setStatus("pending");
        setMessage(
          "KoraPay has not confirmed the payment yet. You can check again or return to your wallet.",
        );
        return;
      }

      pollTimer = window.setTimeout(
        checkPayment,
        POLL_INTERVAL_MS,
      );
    }

    checkPayment();

    return () => {
      isCancelled = true;

      if (pollTimer) {
        window.clearTimeout(pollTimer);
      }

      if (redirectTimer) {
        window.clearTimeout(redirectTimer);
      }
    };
  }, [reference, retryCount, navigate]);

  const isSuccess = status === "success";
  const isFailure =
    status === "failed" ||
    status === "review" ||
    status === "missing";

  return (
    <main className="advertiser-payment-result">
      <section
        className={`advertiser-payment-result__card advertiser-payment-result__card--${status}`}
        aria-live="polite"
      >
        <div className="advertiser-payment-result__icon" aria-hidden="true">
          {isSuccess ? "✓" : isFailure ? "!" : "…"}
        </div>

        <p className="advertiser-payment-result__eyebrow">
          TecoTask wallet
        </p>

        <h1>
          {isSuccess
            ? "Thank you for your payment"
            : status === "failed"
              ? "Payment not completed"
              : status === "review"
                ? "Payment needs review"
                : status === "missing"
                  ? "Payment reference missing"
                  : "Thank you"}
        </h1>

        <p className="advertiser-payment-result__message">
          {message}
        </p>

        {reference && (
          <p className="advertiser-payment-result__reference">
            Payment reference: <code>{reference}</code>
          </p>
        )}

        {isSuccess && (
          <p className="advertiser-payment-result__redirect">
            Taking you to your wallet…
          </p>
        )}

        {status === "pending" && (
          <button
            type="button"
            className="advertiser-payment-result__button"
            onClick={() => setRetryCount((count) => count + 1)}
          >
            Check payment again
          </button>
        )}

        <Link
          to="/advertisers/wallet"
          className="advertiser-payment-result__link"
        >
          Go to wallet
        </Link>
      </section>
    </main>
  );
}