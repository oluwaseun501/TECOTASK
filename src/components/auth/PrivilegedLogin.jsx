import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "../../styles/Login.css";
import "../../styles/PrivilegedLogin.css";

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
        d="M10.6 6.15A9.8 9.8 0 0 1 12 6c6 0 9.5 6 9.5 6a17.8 17.8 0 0 1-3.1 3.6M6.1 6.9C3.8 8.7 2.5 12 2.5 12s3.5 6 9.5 6c1.2 0 2.3-.25 3.3-.65"
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
      }
    );

    observer.observe(loginElement);

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();

    /*
     * Temporary development behavior:
     * Any submitted values take the user to the correct workspace.
     *
     * Real authentication can be added here later.
     */
    setIsSubmitting(true);

    navigate(dashboardPath, {
      replace: true,
    });
  };

  const roleClassName = role.toLowerCase();

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
        <div className="login-card__brand">
          <span className="login-card__logo">T</span>

          <span className="login-card__brand-name">
            Teco<span>Task</span>
          </span>
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

        <form
          className="login-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="login-field">
            <label htmlFor={`${roleClassName}-login-email`}>
              Email address
            </label>

            <input
              id={`${roleClassName}-login-email`}
              name="email"
              type="text"
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
                onClick={() =>
                  setShowPassword((current) => !current)
                }
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
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
                onChange={(event) =>
                  setRememberMe(event.target.checked)
                }
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
                ? "Opening workspace..."
                : `Enter ${role} workspace`}
            </span>

            <span className="login-submit__arrow">→</span>
          </button>
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