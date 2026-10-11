import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../services/auth.js";
import "../../styles/EarnersReferrals.css";

const formatNaira = (amount = 0) =>
  `₦${Number(amount || 0).toLocaleString("en-NG")}`;

function getInitials(fullName = "") {
  return (
    fullName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "TT"
  );
}

function formatJoinedDate(date) {
  if (!date) return "Joined date unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Joined date unavailable";
  }

  return `Joined ${parsedDate.toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}`;
}

const EarnersReferrals = () => {
  const navigate = useNavigate();

  const [referralData, setReferralData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [shareMessage, setShareMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadReferrals() {
      const token = sessionStorage.getItem("tecotaskToken");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const data = await authApi.getEarnerReferrals(token);

        if (isMounted) {
          setReferralData(data);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError.message || "Could not load your referrals.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadReferrals();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const referralCode = referralData?.referralCode || "";
  const summary = referralData?.summary || {};
  const referrals = Array.isArray(referralData?.referrals)
    ? referralData.referrals
    : [];

  // Keeps the existing /r/:code link pattern from your page.
  const inviteLink = referralCode
    ? `${window.location.origin}/r/${encodeURIComponent(referralCode)}`
    : "";

  const handleCopyLink = async () => {
    if (!inviteLink) return;

    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setShareMessage("Invite link copied.");

      window.setTimeout(() => {
        setCopied(false);
        setShareMessage("");
      }, 2200);
    } catch {
      setCopied(false);
      setShareMessage("Could not copy the link. Please copy it manually.");
    }
  };

  const handleWhatsAppShare = () => {
    if (!inviteLink) return;

    const message = encodeURIComponent(
      `Join me on TecoTask and earn from simple online tasks: ${inviteLink}`,
    );

    window.open(
      `https://wa.me/?text=${message}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleMoreOptions = async () => {
    if (!inviteLink) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join me on TecoTask",
          text: "Earn from simple online tasks on TecoTask.",
          url: inviteLink,
        });
      } catch (shareError) {
        if (shareError.name !== "AbortError") {
          setShareMessage("Could not open the share menu.");
        }
      }

      return;
    }

    await handleCopyLink();
  };

  if (loading) {
  return (
    <section className="earner-referrals referral-loading-state">
      <div
        className="referral-loading-state__inner"
        role="status"
        aria-live="polite"
      >
        <span
          className="referral-loading-state__roller"
          aria-hidden="true"
        >
          <span />
        </span>
        <p>Loading your referrals...</p>
      </div>
    </section>
  );
}

  return (
    <section className="earner-referrals">
      <div className="earner-referrals__heading">
        <div>
          <span>Grow with TecoTask</span>
          <h1>Referrals</h1>
          <p>Earn ₦200 each time someone activates with your code.</p>
        </div>
      </div>

      {error && (
        <p className="role-error" role="alert">
          {error}
        </p>
      )}

      {shareMessage && (
        <p role="status">
          {shareMessage}
        </p>
      )}

      <section className="referral-stat-grid">
        <article className="referral-stat-card referral-stat-card--green">
          <span>Referral earnings</span>
          <strong>
            {loading ? "Loading..." : formatNaira(summary.referralEarnings)}
          </strong>
          <small>
            {summary.activatedReferrals || 0} activated referrals
          </small>
        </article>

        <article className="referral-stat-card">
          <span>Total invited</span>
          <strong>
            {loading ? "—" : summary.totalReferrals || 0}
          </strong>
          <small>People who used your link</small>
        </article>

        <article className="referral-stat-card">
          <span>Waiting to activate</span>
          <strong>
            {loading ? "—" : summary.pendingReferrals || 0}
          </strong>
          <small>Not yet activated</small>
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
                <span>
                  {loading
                    ? "Loading your referral link..."
                    : inviteLink || "Referral link unavailable"}
                </span>
              </div>

              <button
                type="button"
                className="referral-copy-button"
                onClick={handleCopyLink}
                disabled={!inviteLink}
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
                disabled={!inviteLink}
              >
                ◇ Share to WhatsApp
              </button>

              <button
                type="button"
                className="referral-share-button"
                onClick={handleMoreOptions}
                disabled={!inviteLink}
              >
                ⋯ More options
              </button>

              <span className="referral-code">
                Code: <strong>{referralCode || "—"}</strong>
              </span>
            </div>
          </section>

          <section className="referral-people-card">
            <div className="referral-section-heading">
              <h2>People you invited</h2>
              <p>Bonuses are credited when a referral activates.</p>
            </div>

            <div className="referral-people-list">
              {loading ? (
                <p>Loading referrals...</p>
              ) : referrals.length === 0 ? (
                <p>You haven’t invited anyone yet. Share your link to get started.</p>
              ) : (
                referrals.map((person) => {
                  const isActivated = person.isActivated === true;
                  const rewardAmount =
                    person.rewardStatus === "credited"
                      ? Number(person.rewardAmount || 0)
                      : 0;

                  return (
                    <article
                      className="referral-person"
                      key={person.id}
                    >
                      <span className="referral-person__avatar">
                        {getInitials(person.fullName)}
                      </span>

                      <div className="referral-person__details">
                        <strong>{person.fullName}</strong>
                        <small>{formatJoinedDate(person.joinedAt)}</small>
                      </div>

                      <span
                        className={`referral-person__status ${
                          isActivated ? "is-activated" : "is-pending"
                        }`}
                      >
                        {isActivated ? "Activated" : "Pending"}
                      </span>

                      <strong
                        className={`referral-person__reward ${
                          rewardAmount > 0 ? "is-earned" : "is-pending"
                        }`}
                      >
                        {rewardAmount > 0
                          ? `+ ${formatNaira(rewardAmount)}`
                          : "—"}
                      </strong>
                    </article>
                  );
                })
              )}
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