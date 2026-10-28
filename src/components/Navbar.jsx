import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const sectionLink = (id, label, onClick) => {
    if (pathname === "/") {
      return (
        <a href={`#${id}`} onClick={onClick}>
          {label}
        </a>
      );
    }

    return (
      <Link to={`/#${id}`} onClick={onClick}>
        {label}
      </Link>
    );
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
  <Link to="/how-it-works">How it works</Link>
  {sectionLink("tasks", "Tasks")}
  <Link to="/marketplace">Marketplace</Link>
  <Link to="/for-advertisers">For advertisers</Link>
  <Link to="/faq">FAQ</Link>
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
      <Link to="/how-it-works" onClick={closeMenu}>
  How it works
</Link>
{sectionLink("tasks", "Tasks", closeMenu)}
<Link to="/marketplace" onClick={closeMenu}>
  Marketplace
</Link>
<Link to="/for-advertisers" onClick={closeMenu}>
  For advertisers
</Link>
<Link to="/faq" onClick={closeMenu}>
  FAQ
</Link>

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