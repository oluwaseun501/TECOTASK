import { useEffect, useRef, useState } from "react";
import "../styles/Login.css";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { authApi } from "../services/auth.js";

const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

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

const Login = () => {
  const loginRef = useRef(null);
  const navigate = useNavigate();

  const [isVisible, setIsVisible] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [successNotice, setSuccessNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const loginElement = loginRef.current;

    if (!loginElement || !("IntersectionObserver" in window)) {
      return undefined;
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

    observer.observe(loginElement);

    return () => {
      observer.disconnect();
    };
  }, []);

  const navigateWithNotice = async (path, message) => {
    setSuccessNotice(message);

    // Keep the popup visible long enough to read.
    await wait(1400);

    setIsExiting(true);

    // Allow the page exit animation to finish.
    await wait(380);

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
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  setFormError("");
  setSuccessNotice("");
  setIsSubmitting(true);

  try {
    const result = await authApi.login({
      email,
      password,
    });

    sessionStorage.setItem("tecotaskToken", result.token);

    const destination = getAuthDestination(
      result.user,
      result.isNewUser,
    );

    const message =
      destination === "/choose-role"
        ? "Welcome back! Choose your TecoTask role to continue."
        : "Welcome back! You logged in successfully.";

    await navigateWithNotice(destination, message);
  } catch (error) {
    setFormError(error.message || "Invalid email or password.");
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
        ? "Welcome to TecoTask! Choose your role to continue."
        : "Welcome back! You logged in successfully with Google.";

    await navigateWithNotice(destination, message);
  } catch (error) {
    setFormError(error.message || "Google sign-in failed.");
    setIsGoogleLoading(false);
  }
};

  const handleGoogleError = () => {
    setIsGoogleLoading(false);
    setFormError("Google sign-in was cancelled or failed.");
  };

  const isBusy = isSubmitting || isGoogleLoading;

  return (
    <main
      ref={loginRef}
      className={`login-page ${
        isVisible ? "login-page--visible" : ""
      } ${isExiting ? "login-page--exiting" : ""}`}
    >
      <div
        className="login-background-glow login-background-glow--one"
        aria-hidden="true"
      />

      <div
        className="login-background-glow login-background-glow--two"
        aria-hidden="true"
      />

      <div
        className="login-page__bubble login-page__bubble--one"
        aria-hidden="true"
      />

      <div
        className="login-page__bubble login-page__bubble--two"
        aria-hidden="true"
      />

      <div
        className="login-page__bubble login-page__bubble--three"
        aria-hidden="true"
      />

      <div
        className="login-page__bubble login-page__bubble--four"
        aria-hidden="true"
      />

      <Link to="/" className="login-back-home">
        <span>←</span>
        Back to Home
      </Link>

      {successNotice && (
        <div className="login-success-toast" role="status" aria-live="polite">
          <span className="login-success-toast__icon">✓</span>

          <div>
            <strong>Welcome back</strong>
            <p>{successNotice}</p>
          </div>
        </div>
      )}

      <section className="login-card">
       <div className="login-card__brand login-card__brand--image">
  <img
    src="/teco_task-logo.png"
    alt="TecoTask"
    className="login-card__brand-logo"
  />
</div>

        <h1>Welcome back to TecoTask</h1>

        <p className="login-card__intro">
          Sign in to manage your tasks, campaigns, and rewards.
        </p>

        <form
          className="login-form"
          onSubmit={handleSubmit}
          aria-busy={isBusy}
        >
          {formError && (
            <div className="login-form-error" role="alert" aria-live="polite">
              <span className="login-form-error__icon">!</span>
              <span>{formError}</span>
            </div>
          )}

          <div className="login-field">
            <label htmlFor="loginEmail">Email address</label>

            <input
              id="loginEmail"
              name="email"
              type="email"
              placeholder="you@gmail.com"
              autoComplete="email"
              required
              disabled={isBusy}
            />
          </div>

          <div className="login-field login-password-field">
            <div className="login-password-label">
              <label htmlFor="loginPassword">Password</label>

              <Link to="/forgot-password">Forgot password?</Link>
            </div>

            <div className="login-password-input">
              <input
                id="loginPassword"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                disabled={isBusy}
              />

              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
                disabled={isBusy}
              >
                <EyeIcon visible={showPassword} />
              </button>
            </div>
          </div>

          <div className="login-options">
            <label className="login-remember">
              <input
                type="checkbox"
                name="rememberMe"
                disabled={isBusy}
              />
              <span>Remember me</span>
            </label>

            <span className="login-secure">
              <span>✓</span>
              Secure connection
            </span>
          </div>

          <button
            type="submit"
            className="login-submit"
            disabled={isBusy}
          >
            {isSubmitting ? (
              <>
                <span
                  className="login-submit__spinner"
                  aria-hidden="true"
                />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span className="login-submit__text">
                  Sign in to account
                </span>
                <span className="login-submit__arrow">→</span>
              </>
            )}
          </button>
        </form>

        <div className="login-divider">
          <span>or</span>
        </div>

        <div className="login-google-shell">
          <div className="login-google-visual">
            {isGoogleLoading ? (
              <span
                className="login-google-spinner"
                role="status"
                aria-label="Signing in with Google"
              />
            ) : (
              <>
                <span className="login-google__icon">G</span>
                <span>Continue with Google</span>
              </>
            )}
          </div>

          {!isGoogleLoading && (
            <div className="login-google-hit-area">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                width="400"
              />
            </div>
          )}
        </div>

        <p className="login-signup">
          Don&apos;t have an account?{" "}
          <Link to="/signup">Create account</Link>
        </p>

        <div className="login-support">
          <strong>Need help?</strong>
          <span>Our support team is here for you.</span>
          <a href="/support">Contact support</a>
        </div>
      </section>
    </main>
  );
};

export default Login;