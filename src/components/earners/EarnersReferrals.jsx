import { useState } from "react";
import "../../styles/EarnersReferrals.css";

const inviteLink = "tecotask.ng/r/TECO-CHIN24";

const invitedPeople = [
  {
    id: 1,
    initials: "AB",
    name: "Aisha Bello",
    joined: "Joined 16 Sep 2026",
    status: "Activated",
    reward: "+ ₦200",
  },
  {
    id: 2,
    initials: "TA",
    name: "Tunde Adeyemi",
    joined: "Joined 15 Sep 2026",
    status: "Activated",
    reward: "+ ₦200",
  },
  {
    id: 3,
    initials: "GE",
    name: "Grace Effiong",
    joined: "Joined 14 Sep 2026",
    status: "Activated",
    reward: "+ ₦200",
  },
  {
    id: 4,
    initials: "SI",
    name: "Samuel Ike",
    joined: "Joined 13 Sep 2026",
    status: "Pending",
    reward: "—",
  },
  {
    id: 5,
    initials: "HY",
    name: "Halima Yusuf",
    joined: "Joined 11 Sep 2026",
    status: "Activated",
    reward: "+ ₦200",
  },
  {
    id: 6,
    initials: "EN",
    name: "Emeka Nnadi",
    joined: "Joined 09 Sep 2026",
    status: "Pending",
    reward: "—",
  },
];

const EarnersReferrals = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://${inviteLink}`);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2200);
    } catch {
      setCopied(false);
    }
  };

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(
      `Join me on TecoTask and earn from simple online tasks: https://${inviteLink}`,
    );

    window.open(
      `https://wa.me/?text=${message}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <section className="earner-referrals">
      <div className="earner-referrals__heading">
        <div>
          <span>Grow with TecoTask</span>
          <h1>Referrals</h1>
          <p>Earn ₦200 each time someone activates with your code.</p>
        </div>
      </div>

      <section className="referral-stat-grid">
        <article className="referral-stat-card referral-stat-card--green">
          <span>Referral earnings</span>
          <strong>₦800</strong>
          <small>4 activated referrals</small>
        </article>

        <article className="referral-stat-card">
          <span>Total invited</span>
          <strong>6</strong>
          <small>People who used your link</small>
        </article>

        <article className="referral-stat-card">
          <span>Waiting to activate</span>
          <strong>2</strong>
          <small>Not yet on the task board</small>
        </article>
      </section>

      <div className="referral-content-grid">
        <div>
          <section className="referral-invite-card">
            <div className="referral-section-heading">
              <h2>Your invite link</h2>
              <p>
                Share it on WhatsApp, X, or in your campus group. You get paid
                on activation, not sign-up.
              </p>
            </div>

            <div className="referral-link-row">
              <div className="referral-link-input">
                <span>{inviteLink}</span>
              </div>

              <button
                type="button"
                className="referral-copy-button"
                onClick={handleCopyLink}
              >
                <span>{copied ? "✓" : "▣"}</span>
                {copied ? "Copied" : "Copy link"}
              </button>
            </div>

            <div className="referral-share-row">
              <button
                type="button"
                className="referral-share-button"
                onClick={handleWhatsAppShare}
              >
                ◇ Share to WhatsApp
              </button>

              <button type="button" className="referral-share-button">
                ⋯ More options
              </button>

              <span className="referral-code">
                Code: <strong>TECO-CHIN24</strong>
              </span>
            </div>
          </section>

          <section className="referral-people-card">
            <div className="referral-section-heading">
              <h2>People you invited</h2>
              <p>Bonuses are credited the moment a referral activates.</p>
            </div>

            <div className="referral-people-list">
              {invitedPeople.map((person) => (
                <article className="referral-person" key={person.id}>
                  <span className="referral-person__avatar">
                    {person.initials}
                  </span>

                  <div className="referral-person__details">
                    <strong>{person.name}</strong>
                    <small>{person.joined}</small>
                  </div>

                  <span
                    className={`referral-person__status ${
                      person.status === "Activated"
                        ? "is-activated"
                        : "is-pending"
                    }`}
                  >
                    {person.status}
                  </span>

                  <strong
                    className={`referral-person__reward ${
                      person.status === "Activated"
                        ? "is-earned"
                        : "is-pending"
                    }`}
                  >
                    {person.reward}
                  </strong>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="referral-side">
          <section className="referral-how-card">
            <h2>How it works</h2>

            <div className="referral-steps">
              <div>
                <span>1</span>
                <p>Share your personal invite link.</p>
              </div>

              <div>
                <span>2</span>
                <p>Your friend creates an account.</p>
              </div>

              <div>
                <span>3</span>
                <p>They activate by completing the required steps.</p>
              </div>
            </div>
          </section>

          <section className="referral-rules-card">
            <h2>Referral rules</h2>

            <ul>
              <li>One account per person.</li>
              <li>Duplicate devices are flagged automatically.</li>
              <li>Bonuses are reversed if a referral is found to be fake.</li>
              <li>There is no cap on how many people you can refer.</li>
            </ul>
          </section>
        </aside>
      </div>
    </section>
  );
};

export default EarnersReferrals;