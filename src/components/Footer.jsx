import { Link } from "react-router-dom";
import useScrollReveal from "../hooks/useScrollReveal";
import { getWhatsAppSupportUrl } from "../config/support.js";
import "../styles/Footer.css";

const Footer = () => {
  const [footerRef, isVisible] = useScrollReveal({
    threshold: 0.05,
    rootMargin: "0px",
  });

  const supportUrl = getWhatsAppSupportUrl(
    "Hello TecoTask support, I need help.",
  );

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
         <Link to="/" className="site-footer__logo">
  <img
    src="/teco_task-logo.png"
    alt="TecoTask"
    className="site-footer__logo-image"
  />
</Link>

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
  <a href="/#tasks">Task board</a>
  <Link to="/signup">Create account</Link>
  <Link to="/how-it-works">How it works</Link>
  <Link to="/faq">FAQs</Link>
</div>

       <div className="site-footer__column">
  <h3>Advertisers</h3>
  <Link to="/for-advertisers">Advertiser campaign guide</Link>
  <a href="/#advertisers">Campaign estimate</a>
  <Link to="/faq">Review and moderation questions</Link>
  <a href={supportUrl} target="_blank" rel="noopener noreferrer">
    Advertiser support
  </a>
</div>

        <div className="site-footer__column">
          <h3>Company</h3>
          <Link to="/how-it-works">About TecoTask</Link>
          <a href={supportUrl} target="_blank" rel="noopener noreferrer">
            Support
          </a>
          <Link to="/terms">Terms of use</Link>
          <Link to="/privacy">Privacy policy</Link>
        </div>
      </div>

      <div
        className="site-footer__bottom reveal-item"
        style={{ "--reveal-delay": "180ms" }}
      >
        <p>© 2026 TecoTask. All rights reserved.</p>

        <div className="site-footer__bottom-links">
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;