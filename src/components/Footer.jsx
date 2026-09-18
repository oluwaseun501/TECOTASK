import useScrollReveal from "../hooks/useScrollReveal";
import "../styles/Footer.css";

const Footer = () => {
  const [footerRef, isVisible] = useScrollReveal({
    threshold: 0.05,
    rootMargin: "0px",
  });

  return (
    <footer
      ref={footerRef}
      className={`site-footer reveal-section ${
        isVisible ? "is-visible" : ""
      }`}
    >
      <div
        className="site-footer__main reveal-item"
        style={{ "--reveal-delay": "0ms" }}
      >
        <div className="site-footer__brand">
          <a href="/" className="site-footer__logo">
            <span className="site-footer__logo-mark">T</span>

            <span>
              Teco<span>Task</span>
            </span>
          </a>

          <p>
            A simple and trusted platform for completing tasks, earning
            rewards, and growing campaigns.
          </p>

          <span className="site-footer__location">
            Built for earners and advertisers across Nigeria.
          </span>
        </div>

        <div className="site-footer__column">
          <h3>Earners</h3>
          <a href="#tasks">Task board</a>
          <a href="/signup">Create account</a>
          <a href="#how-it-works">How it works</a>
          <a href="#faq">Referrals</a>
        </div>

        <div className="site-footer__column">
          <h3>Advertisers</h3>
          <a href="#advertisers">Create campaign</a>
          <a href="#advertisers">Campaign pricing</a>
          <a href="#faq">Moderation policy</a>
          <a href="#advertisers">Advertiser support</a>
        </div>

        <div className="site-footer__column">
          <h3>Company</h3>
          <a href="#how-it-works">About TecoTask</a>
          <a href="mailto:support@tecotask.com">Support</a>
          <a href="/terms">Terms of use</a>
          <a href="/privacy">Privacy policy</a>
        </div>
      </div>

      <div
        className="site-footer__bottom reveal-item"
        style={{ "--reveal-delay": "180ms" }}
      >
        <p>© 2026 TecoTask. All rights reserved.</p>

        <div className="site-footer__bottom-links">
          <a href="/terms">Terms</a>
          <a href="/privacy">Privacy</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;