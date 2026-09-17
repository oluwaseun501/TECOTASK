import { useEffect, useRef, useState } from "react";
import AnimatedStat from "./AnimatedStat";
import "../styles/Hero.css";
import { Link } from "react-router-dom";

const Hero = ({ imageSrc = "/hero-earner.jpg" }) => {
  const heroRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const heroElement = heroRef.current;

    if (!heroElement) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // This changes both when scrolling down and when scrolling back up.
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.2,
        rootMargin: "-40px 0px -40px 0px",
      }
    );

    observer.observe(heroElement);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className={`hero ${isVisible ? "hero--visible" : ""}`}
    >
      <div className="hero__bubble hero__bubble--one" aria-hidden="true" />
      <div className="hero__bubble hero__bubble--two" aria-hidden="true" />
      <div className="hero__bubble hero__bubble--three" aria-hidden="true" />
      <div className="hero__bubble hero__bubble--four" aria-hidden="true" />

      <div className="hero__inner">
        <div className="hero__content">
          <span className="hero__badge">
            Paying earners in Nigeria
          </span>

          <h1 className="hero__title">
            Small tasks. Real
            <br />
            naira.
            <br />
            <span>Paid the same day.</span>
          </h1>

          <p className="hero__description">
            TecoTask connects Nigerian brands that need real engagement with
            everyday people who have spare minutes. Follow, install, survey,
            submit your proof, and cash out to your bank.
          </p>

          <div className="hero__actions">
            <a href="/signup" className="hero__primary-button">
              <span className="hero__button-text"><Link to="/signup">Start earning free</Link></span>
              <span className="hero__button-arrow">→</span>
            </a>

            <a href="#advertisers" className="hero__secondary-button">
              <span className="hero__button-text">Advertise with us</span>
            </a>
          </div>

          <div className="hero__stats">
            <div className="hero__stat">
              <strong>
                <AnimatedStat
                  value={48.2}
                  prefix="₦"
                  suffix="m"
                  decimals={1}
                />
              </strong>

              <small>Paid out so far</small>
            </div>

            <div className="hero__stat">
              <strong>
                <AnimatedStat value={132400} />
              </strong>

              <small>Tasks completed</small>
            </div>

            <div className="hero__stat">
              <strong>
                <AnimatedStat value={10} suffix=" mins" />
              </strong>

              <small>Average payout time</small>
            </div>
          </div>
        </div>

        <div className="hero__visual">
          <div className="hero__glow" />

          <div className="hero__image-frame">
            <img
              src={imageSrc}
              alt="TecoTask earner completing an online task"
            />

            <div className="hero__proof-card">
              <small>Proof approved</small>
              <strong>+₦500</strong>
            </div>

            <div className="hero__balance-card">
              <small>Available balance</small>
              <strong>₦12,500</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;