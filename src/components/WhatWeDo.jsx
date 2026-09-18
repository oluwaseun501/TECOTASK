import useScrollReveal from "../hooks/useScrollReveal";
import "../styles/WhatWeDo.css";

const advertiserBenefits = [
  "Set your own budget",
  "Target by state, device, and task category",
  "Live fill rate and cost-per-action overview",
  "Top up with card, transfer, or USSD",
];

const WhatWeDo = () => {
  const [sectionRef, isVisible] = useScrollReveal();

  return (
    <section
      ref={sectionRef}
      id="advertisers"
      className={`advertiser-section reveal-section ${
        isVisible ? "is-visible" : ""
      }`}
    >
      <div className="advertiser-section__inner">
        <div className="advertiser-section__content">
          <span
            className="advertiser-section__badge reveal-item"
            style={{ "--reveal-delay": "0ms" }}
          >
            For advertisers
          </span>

          <h2
            className="reveal-item"
            style={{ "--reveal-delay": "120ms" }}
          >
            Pay only for engagement
            <br />
            you can see
          </h2>

          <p
            className="advertiser-section__description reveal-item"
            style={{ "--reveal-delay": "240ms" }}
          >
            Fund your wallet, set a reward per action, and publish. Each
            submission arrives with screenshot proof, reviewed by our
            moderators before a single naira leaves your budget.
          </p>

          <ul
            className="advertiser-section__benefits reveal-item"
            style={{ "--reveal-delay": "360ms" }}
          >
            {advertiserBenefits.map((benefit) => (
              <li key={benefit}>
                <span className="advertiser-section__check">✓</span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>

          <a
            href="/signup"
            className="advertiser-section__button reveal-item"
            style={{ "--reveal-delay": "500ms" }}
          >
            Create a campaign
            <span>→</span>
          </a>
        </div>

        <div
          className="campaign-card reveal-item"
          style={{ "--reveal-delay": "260ms" }}
        >
          <div className="campaign-card__top">
            <span>Campaign estimate</span>
            <span className="campaign-card__status">Ready</span>
          </div>

          <div className="campaign-card__rows">
            <div className="campaign-card__row">
              <span>Reward per task</span>
              <strong>₦20</strong>
            </div>

            <div className="campaign-card__row">
              <span>Slots</span>
              <strong>250 earners</strong>
            </div>

            <div className="campaign-card__row">
              <span>Moderation</span>
              <strong>Included</strong>
            </div>

            <div className="campaign-card__row campaign-card__total">
              <span>Total budget</span>
              <strong>₦5,000</strong>
            </div>
          </div>

          <div className="campaign-card__notice">
            <span className="campaign-card__notice-icon">▣</span>

            <p>
              Every one of those 250 actions comes back with a timestamped
              screenshot.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatWeDo;
