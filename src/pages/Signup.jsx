import { useEffect, useRef, useState } from "react";
import "../styles/Signup.css";
import { Link, useNavigate } from "react-router-dom";

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
      }
    );

    observer.observe(signupElement);

    return () => {
      observer.disconnect();
    };
  }, []);

 const handleSubmit = (event) => {
  event.preventDefault();

  // Temporary route until backend registration is connected.
  navigate("/choose-role");
};

  return (
    <main
      ref={signupRef}
      className={`signup-page ${
        isVisible ? "signup-page--visible" : ""
      }`}
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

      <section className="signup-card">
        <div className="signup-card__brand">
          <span className="signup-card__logo">T</span>

          <span className="signup-card__brand-name">
            Teco<span>Task</span>
          </span>
        </div>

        <h1>Create your TecoTask account</h1>

        <p className="signup-card__intro">
          Start earning from simple tasks or advertise to real people.
        </p>

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="signup-field">
            <label htmlFor="fullName">Full name</label>

            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Chinedu Okafor"
              autoComplete="name"
              required
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
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
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
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
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
            />
          </div>

          <label className="signup-terms">
            <input type="checkbox" required />

            <span>
              I agree to the TecoTask{" "}
              <a href="/terms">Terms of Use</a> and{" "}
              <a href="/privacy">Privacy Policy</a>.
            </span>
          </label>

          <button type="submit" className="signup-submit">
            <span className="signup-submit__text">Create account</span>
            <span className="signup-submit__arrow">→</span>
          </button>
        </form>

        <div className="signup-divider">
          <span>or</span>
        </div>

        <button type="button" className="signup-google">
          <span className="signup-google__icon">G</span>
          Continue with Google
        </button>

        <p className="signup-login">
          Already have an account?{" "}
          <Link to="/login">Log in</Link>
        </p>
      </section>
    </main>
  );
};

export default Signup;