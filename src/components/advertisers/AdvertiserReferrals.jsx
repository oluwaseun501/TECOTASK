import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../services/auth.js";
import "../../styles/AdvertiserReferrals.css";

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

const AdvertiserReferrals = () => {
  const navigate = useNavigate();

  const [referralData, setReferralData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [shareMessage, setShareMessage] = useState("");

  useEffect(() => {
        const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    window.scrollTo({
      top: 0,
      behavior: reduceMotion ? "auto" : "smooth",
    });
    let isMounted = true;

    async function loadReferrals() {
      const token = sessionStorage.getItem("tecotaskToken");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        // This method calls GET /api/referrals; the backend accepts advertisers.
        const data = await authApi.getEarnerReferrals(token);

        if (isMounted) {
          setReferralData(data);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.message || "Could not load your referrals.");
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
  const allReferrals = Array.isArray(referralData?.referrals)
    ? referralData.referrals
    : [];

  // Advertisers earn referral bonuses for earner accounts, not other roles.
  const referrals = allReferrals.filter(
    (person) => person.role === "earner",
  );

  const activatedCount = referrals.filter(
    (person) => person.isActivated === true,
  ).length;

  const pendingCount = referrals.length - activatedCount;

  const referralEarnings = referrals.reduce((total, person) => {
    if (person.rewardStatus !== "credited") return total;

    const amount = Number(person.rewardAmount || 0);
    return total + (Number.isFinite(amount) ? amount : 0);
  }, 0);

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
      `Join TecoTask as an earner and earn from simple online tasks: ${inviteLink}`,
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
          title: "Join TecoTask as an earner",
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
      <section className="advertiser-referrals advertiser-referrals--loading">
        <div
          className="advertiser-referral-loader"
          role="status"
          aria-live="polite"
        >
          <span
            className="advertiser-referral-loader__roller"
            aria-hidden="true"
          >
            <span />
          </span>
          <span className="advertiser-referrals-visually-hidden">
            Loading referrals
          </span>
        </div>
      </section>
    );
  }
  return (
    <section className="advertiser-referrals">
      {error && (
        <p className="role-error" role="alert">
          {error}
        </p>
      )}

      {shareMessage && <p role="status">{shareMessage}</p>}

      <section className="advertiser-referral-stat-grid">
        <article className="advertiser-referral-stat-card advertiser-referral-stat-card--green">
          <span>Referral earnings</span>
          <strong>
            {loading ? "Loading..." : formatNaira(referralEarnings)}
          </strong>
          <small>{activatedCount} activated referrals</small>
        </article>

        <article className="advertiser-referral-stat-card">
          <span>Total invited earners</span>
          <strong>{loading ? "—" : referrals.length}</strong>
          <small>People who joined as earners</small>
        </article>

        <article className="advertiser-referral-stat-card">
          <span>Waiting to activate</span>
          <strong>{loading ? "—" : pendingCount}</strong>
          <small>Not yet activated</small>
        </article>
      </section>

      <div className="advertiser-referrals__grid">
        <div>
          <section className="advertiser-referral-invite-card">
            <div className="advertiser-referral-section-heading">
              <h2>Your invite link</h2>
              <p>
                Share it with people who want to earn on TecoTask. Your bonus
                is earned when their earner account activates—not on sign-up.
              </p>
            </div>

            <div className="advertiser-referral-link-row">
              <div className="advertiser-referral-link-input">
                <span>
                  {loading
                    ? "Loading your referral link..."
                    : inviteLink || "Referral link unavailable"}
                </span>
              </div>

              <button
                type="button"
                className="advertiser-referral-copy-button"
                onClick={handleCopyLink}
                disabled={!inviteLink}
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
                disabled={!inviteLink}
              >
                ◇ Share to WhatsApp
              </button>

              <button
                type="button"
                className="advertiser-referral-share-button"
                onClick={handleMoreOptions}
                disabled={!inviteLink}
              >
                ⋯ More options
              </button>

              <span className="advertiser-referral-code">
                Code: <strong>{referralCode || "—"}</strong>
              </span>
            </div>
          </section>

          <section className="advertiser-referral-people-card">
            <div className="advertiser-referral-section-heading">
              <h2>People you invited</h2>
              <p>
                Bonuses appear here after an earner activates and the reward is
                credited.
              </p>
            </div>

            <div className="advertiser-referral-people-list">
              {loading ? (
                <p>Loading referrals...</p>
              ) : referrals.length === 0 ? (
                <p>
                  No earners have used your link yet. Share it to get started.
                </p>
              ) : (
                referrals.map((person) => {
                  const isActivated = person.isActivated === true;
                  const rewardAmount =
                    person.rewardStatus === "credited"
                      ? Number(person.rewardAmount || 0)
                      : 0;
                  const rewardCredited = rewardAmount > 0;

                  return (
                    <article
                      className="advertiser-referral-person"
                      key={person.id}
                    >
                      <span className="advertiser-referral-person__avatar">
                        {getInitials(person.fullName)}
                      </span>

                      <div className="advertiser-referral-person__details">
                        <strong>{person.fullName}</strong>
                        <small>{formatJoinedDate(person.joinedAt)}</small>
                      </div>

                      <span
                        className={`advertiser-referral-person__status ${
                          isActivated ? "is-activated" : "is-pending"
                        }`}
                      >
                        {isActivated ? "Activated" : "Pending"}
                      </span>

                      <strong
                        className={`advertiser-referral-person__reward ${
                          rewardCredited ? "is-earned" : "is-pending"
                        }`}
                      >
                        {rewardCredited
                          ? `+ ${formatNaira(rewardAmount)}`
                          : isActivated
                            ? "Processing"
                            : "—"}
                      </strong>
                    </article>
                  );
                })
              )}
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
                <p>They create an earner account.</p>
              </div>

              <div>
                <span>3</span>
                <p>They activate their earner account and start using TecoTask.</p>
              </div>
            </div>
          </section>

          <section className="advertiser-referral-rules-card">
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

export default AdvertiserReferrals;