import { useEffect, useRef, useState } from "react";
import "../styles/Login.css";
import { Link } from "react-router-dom";

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
  const [isVisible, setIsVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const loginElement = loginRef.current;

    if (!loginElement) {
      return;
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

    // Connect authentication here later.
    console.log("TecoTask login submitted");

    // Temporary destination after authentication:
    // window.location.href = "/dashboard";
  };

  return (
    <main
      ref={loginRef}
      className={`login-page ${
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

      <a href="/" className="login-back-home">
        <span>←</span>
        <Link to="/">Back to Home</Link>
      </a>

      <section className="login-card">
        <div className="login-card__brand">
          <span className="login-card__logo">T</span>

          <span className="login-card__brand-name">
            Teco<span>Task</span>
          </span>
        </div>

        <h1>Welcome back to TecoTask</h1>

        <p className="login-card__intro">
          Sign in to manage your tasks, campaigns, and rewards.
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="loginEmail">Email address</label>

            <input
              id="loginEmail"
              name="email"
              type="email"
              placeholder="you@gmail.com"
              autoComplete="email"
              required
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
              />

              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
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
              <input type="checkbox" name="rememberMe" />
              <span>Remember me</span>
            </label>

            <span className="login-secure">
              <span>✓</span>
              Secure connection
            </span>
          </div>

          <button type="submit" className="login-submit">
            <span className="login-submit__text">Sign in to account</span>
            <span className="login-submit__arrow">→</span>
          </button>
        </form>

        <div className="login-divider">
          <span>or</span>
        </div>

        <button type="button" className="login-google">
          <span className="login-google__icon">G</span>
          Continue with Google
        </button>

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