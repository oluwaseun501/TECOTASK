import { useEffect, useRef, useState } from "react";
import "../styles/Signup.css";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { authApi } from "../services/auth.js";

const EyeIcon = ({ visible }) => {
  if (visible) {
    return (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <circle
          cx="12"
          cy="12"
          r="2.5"
          stroke="currentColor"
          strokeWidth="1.7"
        />
      </svg>
    );
  }

  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3 3l18 18"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      <path
        d="M10.6 6.15A9.8 9.8 0 0 1 12 6c6 0 9.5 6 9.5 6a17.8 17.8 0 0 1-3.1 3.6M6.1 6.9C3.8 8.7 2.5 12 2.5 12s3.5 6 9.5 6c1.2 0 2.3-.25 3.3-.65"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const Signup = () => {
  const navigate = useNavigate();
  const signupRef = useRef(null);

  const [isVisible, setIsVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [successNotice, setSuccessNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    const signupElement = signupRef.current;

    if (!signupElement) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.15,
        rootMargin: "-30px 0px -30px 0px",
      },
    );

    observer.observe(signupElement);

    return () => {
      observer.disconnect();
    };
  }, []);

  const navigateWithNotice = async (path, message) => {
  setSuccessNotice(message);

  // Keep the popup visible long enough to read.
  await new Promise((resolve) => setTimeout(resolve, 1400));

  navigate(path, {
    replace: true,
    state: {
      notice: message,
    },
  });
};

const getAuthDestination = (user, isNewUser = false) => {
  if (isNewUser || user?.role === "pending") {
    return "/choose-role";
  }

  if (user?.role === "earner") {
    return "/earners";
  }

  if (user?.role === "advertiser") {
    return "/advertisers";
  }

  // Never send an unknown user state directly to a dashboard.
  return "/choose-role";
};

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get("fullName") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");
    const referralCode = String(formData.get("referralCode") || "").trim();

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    setFormError("");
    setIsSubmitting(true);

    try {
      const result = await authApi.register({
        fullName,
        email,
        password,
        referralCode,
      });

    sessionStorage.setItem("tecotaskToken", result.token);

await navigateWithNotice(
  "/choose-role",
  "Account created successfully. Choose your role to continue."
);
    } catch (error) {
      setFormError(error.message || "Could not create your account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
  const credential = credentialResponse?.credential;

  if (!credential) {
    setFormError("Google did not return a valid credential.");
    return;
  }

  setFormError("");
  setSuccessNotice("");
  setIsGoogleLoading(true);

  try {
    const result = await authApi.google(credential);

    sessionStorage.setItem("tecotaskToken", result.token);

    const destination = getAuthDestination(
      result.user,
      result.isNewUser,
    );

    const message =
      destination === "/choose-role"
        ? "Google signup was successful. Choose your role to continue."
        : "Welcome back to TecoTask.";

    await navigateWithNotice(destination, message);
  } catch (error) {
    setFormError(error.message || "Google sign-up failed.");
    setIsGoogleLoading(false);
  }
};

  const handleGoogleError = () => {
    setIsGoogleLoading(false);
    setFormError("Google sign-up was cancelled or failed.");
  };

  const isBusy = isSubmitting || isGoogleLoading;

  return (
    <main
      ref={signupRef}
      className={`signup-page ${isVisible ? "signup-page--visible" : ""}`}
    >
      <div
        className="signup-page__bubble signup-page__bubble--one"
        aria-hidden="true"
      />

      <div
        className="signup-page__bubble signup-page__bubble--two"
        aria-hidden="true"
      />

      <div
        className="signup-page__bubble signup-page__bubble--three"
        aria-hidden="true"
      />

      <div
        className="signup-page__bubble signup-page__bubble--four"
        aria-hidden="true"
      />

      <div className="signup-background-glow signup-background-glow--one" />
      <div className="signup-background-glow signup-background-glow--two" />

      <Link to="/" className="signup-back-home">
        <span>←</span>
        Back to Home
      </Link>

      {successNotice && (
  <div className="signup-success-toast" role="status" aria-live="polite">
    <span className="signup-success-toast__icon">✓</span>

    <div>
      <strong>Success</strong>
      <p>{successNotice}</p>
    </div>
  </div>
)}

      <section className="signup-card">
        <div className="signup-card__brand signup-card__brand--image">
  <img
    src="/teco_task-logo.png"
    alt="TecoTask"
    className="signup-card__brand-logo"
  />
</div>

        <h1>Create your TecoTask account</h1>

        <p className="signup-card__intro">
          Start earning from simple tasks or advertise to real people.
        </p>

        <form
          onSubmit={handleSubmit}
          className="signup-form"
          aria-busy={isBusy}
        >
          {formError && (
            <div className="signup-form-error" role="alert" aria-live="polite">
              <span className="signup-form-error__icon">!</span>
              <span>{formError}</span>
            </div>
          )}

          <div className="signup-field">
            <label htmlFor="fullName">Full name</label>

            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Chinedu Okafor"
              autoComplete="name"
              required
              disabled={isBusy}
            />
          </div>

          <div className="signup-field">
            <label htmlFor="email">Email address</label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@gmail.com"
              autoComplete="email"
              required
              disabled={isBusy}
            />
          </div>

          <div className="signup-password-row">
            <div className="signup-field">
              <label htmlFor="password">Password</label>

              <div className="signup-password-input">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  disabled={isBusy}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={isBusy}
                >
                  <EyeIcon visible={showPassword} />
                </button>
              </div>
            </div>

            <div className="signup-field">
              <label htmlFor="confirmPassword">Confirm password</label>

              <div className="signup-password-input">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  disabled={isBusy}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword((current) => !current)
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                  disabled={isBusy}
                >
                  <EyeIcon visible={showConfirmPassword} />
                </button>
              </div>
            </div>
          </div>

          <div className="signup-field">
            <label htmlFor="referralCode">
              Referral code <span>(optional)</span>
            </label>

            <input
              id="referralCode"
              name="referralCode"
              type="text"
              placeholder="TECO-XXXXX"
              disabled={isBusy}
            />
          </div>

          <label className="signup-terms">
            <input type="checkbox" required disabled={isBusy} />

            <span>
              I agree to the TecoTask <a href="/terms">Terms of Use</a> and{" "}
              <a href="/privacy">Privacy Policy</a>.
            </span>
          </label>

          <button
            type="submit"
            className="signup-submit"
            disabled={isBusy}
          >
           {isSubmitting ? (
  <>
    <span className="signup-submit__spinner" aria-hidden="true" />
    <span>Creating account...</span>
  </>
) : (
  <>
    <span className="signup-submit__text">Create account</span>
    <span className="signup-submit__arrow">→</span>
  </>
)}
          </button>
        </form>

        <div className="signup-divider">
          <span>or</span>
        </div>

        <div className="signup-google-shell">
         <div className="signup-google-visual">
  {isGoogleLoading ? (
  <span
    className="signup-google-spinner"
    role="status"
    aria-label="Signing in with Google"
  />
) : (
  <>
    <span className="signup-google__icon">G</span>
    <span>Continue with Google</span>
  </>
)}

</div>

          {!isGoogleLoading && (
            <div className="signup-google-hit-area">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                width={400}
              />
            </div>
          )}
        </div>

        <p className="signup-login">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </section>
    </main>
  );
};

export default Signup;