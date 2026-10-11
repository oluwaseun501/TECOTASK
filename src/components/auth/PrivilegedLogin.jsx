import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "../../styles/Login.css";
import "../../styles/PrivilegedLogin.css";
import { authApi } from "../../services/auth.js";

// const API_BASE_URL = (
//   import.meta.env.VITE_API_URL || "http://localhost:5000"
// ).replace(/\/$/, "");

function EyeIcon({ visible }) {
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
        d="M10.6 6.15A9.8 9.8 0 0 1 12 6c6 0 9.5 6 9.5 6s-1.1 1.9-3.1 3.6M6.1 6.9C3.8 8.7 2.5 12 2.5 12s3.5 6 9.5 6c1.2 0 2.3-.25 3.3-.65"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PrivilegedLogin({
  role,
  heading,
  description,
  dashboardPath,
}) {
  const loginRef = useRef(null);
  const navigate = useNavigate();

  const [isVisible, setIsVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const roleClassName = String(role || "user")
  .trim()
  .toLowerCase()
  .replace(/\s+/g, "-");

  useEffect(() => {
    const loginElement = loginRef.current;

    if (!loginElement) {
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
const handleSubmit = async (event) => {
  event.preventDefault();
  setError("");

  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    setError("Enter your email and password.");
    return;
  }

  setIsSubmitting(true);

  try {
    const data = await authApi.login({
      email: normalizedEmail,
      password,
    });

    if (!data?.token || !data?.user) {
      throw new Error("The login response did not include a user and token.");
    }

    const requiredRole = String(role || "").toLowerCase();
    const actualRole = String(data.user.role || "").toLowerCase();

    if (actualRole !== requiredRole) {
      throw new Error(`This account does not have ${requiredRole} access.`);
    }

    const storage = rememberMe ? localStorage : sessionStorage;
    const otherStorage = rememberMe ? sessionStorage : localStorage;

    storage.setItem("tecotaskToken", data.token);
    storage.setItem("tecotaskUser", JSON.stringify(data.user));

    otherStorage.removeItem("tecotaskToken");
    otherStorage.removeItem("tecotaskUser");

    navigate(dashboardPath, { replace: true });
  } catch (requestError) {
    setError(requestError.message || "Could not log in.");
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <main
      ref={loginRef}
      className={`login-page privileged-login-page privileged-login-page--${roleClassName} ${
        isVisible ? "login-page--visible" : ""
      }`}
    >
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

      <section className="login-card privileged-login-card">
        <div className="login-card__brand login-card__brand--image">
  <img
    src="/teco_task-logo.png"
    alt="TecoTask"
    className="login-card__brand-logo"
  />
</div>

        <div className="privileged-login-label">
          Restricted {role} access
        </div>

        <h1>{heading}</h1>

        <p className="login-card__intro">{description}</p>

        <div className="privileged-login-notice">
          <span className="privileged-login-notice__icon">✓</span>

          <div>
            <strong>Authorized users only</strong>

            <span>
              This area is reserved for verified{" "}
              {role.toLowerCase()} accounts.
            </span>
          </div>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="login-field">
            <label htmlFor={`${roleClassName}-login-email`}>
              Email address
            </label>

            <input
              id={`${roleClassName}-login-email`}
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={`${role.toLowerCase()}@tecotask.com`}
              autoComplete="username"
            />
          </div>

          <div className="login-field login-password-field">
            <div className="login-password-label">
              <label htmlFor={`${roleClassName}-login-password`}>
                Password
              </label>

              <Link to="/forgot-password">Forgot password?</Link>
            </div>

            <div className="login-password-input">
              <input
                id={`${roleClassName}-login-password`}
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
              />

              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Hide password" : "Show password"}
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
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
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
            disabled={isSubmitting}
          >
            <span className="login-submit__text">
              {isSubmitting
                ? "Signing in..."
                : `Enter ${role} workspace`}
            </span>

            <span className="login-submit__arrow">→</span>
          </button>

          {error && (
            <p
              role="alert"
              style={{
                marginTop: 12,
                padding: "10px 12px",
                borderRadius: 8,
                background: "#fef3f2",
                color: "#b42318",
                fontSize: 14,
              }}
            >
              {error}
            </p>
          )}
        </form>

        <div className="privileged-login-footer">
          <strong>Having trouble signing in?</strong>

          <span>
            Contact the TecoTask support team for assistance.
          </span>

          <Link to="/support">Contact support</Link>
        </div>
      </section>
    </main>
  );
}