import { useState } from "react";
import "../../styles/AdvertiserReferrals.css";

const inviteLink = "tecotask.ng/r/TECO-OLUWA";

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

const AdvertiserReferrals = () => {
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
      `Join me on TecoTask and grow your business with simple online campaigns: https://${inviteLink}`,
    );

    window.open(
      `https://wa.me/?text=${message}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <section className="advertiser-referrals">
      <section className="advertiser-referral-stat-grid">
        <article className="advertiser-referral-stat-card advertiser-referral-stat-card--green">
          <span>Referral earnings</span>
          <strong>₦800</strong>
          <small>4 activated referrals</small>
        </article>

        <article className="advertiser-referral-stat-card">
          <span>Total invited</span>
          <strong>6</strong>
          <small>People who used your link</small>
        </article>

        <article className="advertiser-referral-stat-card">
          <span>Waiting to activate</span>
          <strong>2</strong>
          <small>Not yet on the board</small>
        </article>
      </section>

      <div className="advertiser-referrals__grid">
        <div>
          <section className="advertiser-referral-invite-card">
            <div className="advertiser-referral-section-heading">
              <h2>Your invite link</h2>
              <p>
                Share it on WhatsApp, X, or in your business group. You get
                paid on activation, not sign-up.
              </p>
            </div>

            <div className="advertiser-referral-link-row">
              <div className="advertiser-referral-link-input">
                <span>{inviteLink}</span>
              </div>

              <button
                type="button"
                className="advertiser-referral-copy-button"
                onClick={handleCopyLink}
              >
                <span>{copied ? "✓" : "▣"}</span>
                {copied ? "Copied" : "Copy link"}
              </button>
            </div>

            <div className="advertiser-referral-share-row">
              <button
                type="button"
                className="advertiser-referral-share-button"
                onClick={handleWhatsAppShare}
              >
                ◇ Share to WhatsApp
              </button>

              <button
                type="button"
                className="advertiser-referral-share-button"
              >
                ⋯ More options
              </button>

              <span className="advertiser-referral-code">
                Code: <strong>TECO-OLUWA</strong>
              </span>
            </div>
          </section>

          <section className="advertiser-referral-people-card">
            <div className="advertiser-referral-section-heading">
              <h2>People you invited</h2>
              <p>
                Bonuses are credited the moment a referral activates.
              </p>
            </div>

            <div className="advertiser-referral-people-list">
              {invitedPeople.map((person) => (
                <article
                  className="advertiser-referral-person"
                  key={person.id}
                >
                  <span className="advertiser-referral-person__avatar">
                    {person.initials}
                  </span>

                  <div className="advertiser-referral-person__details">
                    <strong>{person.name}</strong>
                    <small>{person.joined}</small>
                  </div>

                  <span
                    className={`advertiser-referral-person__status ${
                      person.status === "Activated"
                        ? "is-activated"
                        : "is-pending"
                    }`}
                  >
                    {person.status}
                  </span>

                  <strong
                    className={`advertiser-referral-person__reward ${
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

        <aside className="advertiser-referral-side">
          <section className="advertiser-referral-how-card">
            <h2>How it works</h2>

            <div className="advertiser-referral-steps">
              <div>
                <span>1</span>
                <p>Share your personal invite link.</p>
              </div>

              <div>
                <span>2</span>
                <p>Your contact creates an account.</p>
              </div>

              <div>
                <span>3</span>
                <p>
                  They activate their account and start using TecoTask.
                </p>
              </div>
            </div>
          </section>

          <section className="advertiser-referral-rules-card">
            <h2>Referral rules</h2>

            <ul>
              <li>One account per person.</li>
              <li>
                Duplicate devices are flagged automatically.
              </li>
              <li>
                Bonuses are reversed if a referral is found to be fake.
              </li>
              <li>
                There is no cap on how many people you can refer.
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </section>
  );
};

export default AdvertiserReferrals;