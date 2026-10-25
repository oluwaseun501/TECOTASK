import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <>
      <header className="navbar">
        <nav className="navbar__inner">
          <Link to="/" className="navbar__brand">
            <img
              src="/teco_task-logo.png"
              alt="TecoTask"
              className="navbar__brand-logo"
            />
          </Link>

          <div className="navbar__links">
            <a href="#how-it-works">How it works</a>
            <a href="#tasks">Tasks</a>
            <Link to="/marketplace">Marketplace</Link>
            <a href="#advertisers">For advertisers</a>
            <a href="#faq">FAQ</a>
          </div>

          <div className="navbar__actions">
            <Link to="/login" className="navbar__login">
              Log in
            </Link>

            <Link to="/signup" className="navbar__signup">
              Start earning
            </Link>
          </div>

          <button
            type="button"
            className={`navbar__menu-button ${menuOpen ? "is-open" : ""}`}
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="navbar-mobile-menu"
          >
            <span>{menuOpen ? "×" : "☰"}</span>
          </button>
        </nav>

        <div
          id="navbar-mobile-menu"
          className={`navbar__mobile-menu ${menuOpen ? "is-open" : ""}`}
          aria-hidden={!menuOpen}
        >
          <a href="#how-it-works" onClick={closeMenu}>
            How it works
          </a>

          <a href="#tasks" onClick={closeMenu}>
            Tasks
          </a>

          <Link to="/marketplace" onClick={closeMenu}>
            Marketplace
          </Link>

          <a href="#advertisers" onClick={closeMenu}>
            For advertisers
          </a>

          <a href="#faq" onClick={closeMenu}>
            FAQ
          </a>

          <div className="navbar__mobile-actions">
            <Link to="/login" onClick={closeMenu}>
              Log in
            </Link>

            <Link
              to="/signup"
              onClick={closeMenu}
              className="navbar__signup"
            >
              Start earning
            </Link>
          </div>
        </div>
      </header>

      {/* Reserves space in the page for the fixed navbar. */}
      <div className="navbar-spacer" aria-hidden="true" />
    </>
  );
};

export default Navbar;