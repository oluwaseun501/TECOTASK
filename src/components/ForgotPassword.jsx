import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/ForgotPassword.css";

const ForgotPassword = () => {
  const pageRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const pageElement = pageRef.current;

    if (!pageElement) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: "-20px 0px -20px 0px",
      },
    );

    observer.observe(pageElement);

    return () => observer.disconnect();
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();

    // Temporary success state until your email service is connected.
    setIsSubmitted(true);
  };

  return (
    <main
      ref={pageRef}
      className={`forgot-page ${
        isVisible ? "forgot-page--visible" : ""
      }`}
    >
      <div
        className="forgot-page__glow forgot-page__glow--one"
        aria-hidden="true"
      />

      <div
        className="forgot-page__glow forgot-page__glow--two"
        aria-hidden="true"
      />

      <Link to="/" className="forgot-back-home">
        <span>←</span>
        Back to Home
      </Link>

      <section className="forgot-card">
        <div className="forgot-card__brand">
          <span className="forgot-card__logo">T</span>

          <span className="forgot-card__brand-name">
            Teco<span>Task</span>
          </span>
        </div>

        {!isSubmitted ? (
          <>
            <h1>Forgot your password?</h1>

            <p className="forgot-card__intro">
              Enter the email address connected to your account and we will
              send you a link to reset your password.
            </p>

            <form className="forgot-form" onSubmit={handleSubmit}>
              <div className="forgot-field">
                <label htmlFor="forgotEmail">Email address</label>

                <input
                  id="forgotEmail"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@gmail.com"
                  autoComplete="email"
                  required
                />
              </div>

              <button type="submit" className="forgot-submit">
                <span>Send reset link</span>
                <span className="forgot-submit__arrow">→</span>
              </button>
            </form>
          </>
        ) : (
          <div className="forgot-success" role="status">
            <div className="forgot-success__icon">✓</div>

            <h1>Check your inbox</h1>

            <p>
              If an account is connected to{" "}
              <strong>{email}</strong>, you will receive a password reset link
              shortly.
            </p>

            <button
              type="button"
              className="forgot-secondary-button"
              onClick={() => setIsSubmitted(false)}
            >
              Use another email
            </button>
          </div>
        )}

        <div className="forgot-divider">
          <span>or</span>
        </div>

        <p className="forgot-login">
          Remember your password?{" "}
          <Link to="/login">Back to login</Link>
        </p>

        <div className="forgot-support">
          <strong>Need help?</strong>
          <span>Our support team is here for you.</span>
          <a href="mailto:support@tecotask.com">Contact support</a>
        </div>
      </section>
    </main>
  );
};

export default ForgotPassword;