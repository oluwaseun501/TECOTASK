import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../services/auth.js";
import "../../styles/AdvertiserCampaigns.css";

const formatNaira = (amount = 0) =>
  `₦${Number(amount || 0).toLocaleString("en-NG")}`;

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const campaignStatuses = {
  draft: { label: "Draft", className: "review" },
  pending_review: { label: "In review", className: "review" },
  active: { label: "Active", className: "active" },
  paused: { label: "Paused", className: "paused" },
  completed: { label: "Completed", className: "completed" },
  rejected: { label: "Rejected", className: "review" },
  cancelled: { label: "Cancelled", className: "paused" },
};

const AdvertiserCampaigns = () => {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      const token = sessionStorage.getItem("tecotaskToken");

      if (!token) {
        navigate("/login", { replace: true });
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const data = await authApi.getAdvertiserDashboard(token);

        if (isMounted) {
          setDashboard(data);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError.message ||
              "Could not load your campaigns.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [navigate]);
if (isLoading) {
  return (
    <section className="advertiser-campaigns advertiser-campaigns--loading">
      <div
        className="advertiser-campaigns__loader"
        role="status"
        aria-live="polite"
      >
        <span
          className="advertiser-campaigns__roller"
          aria-hidden="true"
        >
          <span />
        </span>
        <strong>Preparing your dashboard</strong>
        <p>Loading campaign stats and activity...</p>
      </div>
    </section>
  );
}

  if (error) {
    return (
      <section className="advertiser-campaigns">
        <p role="alert">{error}</p>
      </section>
    );
  }

  const wallet = dashboard?.wallet || {};
  const stats = dashboard?.stats || {};
  const campaigns = dashboard?.campaigns || [];

  return (
    <section className="advertiser-campaigns">
      <section className="advertiser-stat-grid">
        <article className="advertiser-stat-card advertiser-stat-card--green">
          <span>Wallet balance</span>
          <strong>{formatNaira(wallet.availableBalance)}</strong>
          <small>Available for campaigns</small>
        </article>

        <article className="advertiser-stat-card">
          <span>Verified actions</span>
          <strong>{Number(stats.verifiedActions || 0).toLocaleString("en-NG")}</strong>
          <small>All approved task actions</small>
        </article>

        <article className="advertiser-stat-card">
          <span>Average cost per action</span>
          <strong>{formatNaira(stats.averageCostPerAction)}</strong>
          <small>Across all campaigns</small>
        </article>
      </section>

      <div className="advertiser-campaigns__grid">
        <section className="advertiser-campaign-list">
          <div className="advertiser-section-heading">
            <div>
              <h2>Your campaigns</h2>
              <p>
                Fill rate updates live as moderators approve submissions.
              </p>
            </div>

            <span>{campaigns.length} total</span>
          </div>

          <div className="advertiser-campaign-items">
            {campaigns.length === 0 ? (
              <div className="advertiser-empty-state">
                <strong>No campaigns yet</strong>
                <p>Your campaigns will appear here after you create one.</p>
              </div>
            ) : (
              campaigns.map((campaign) => {
                const status =
                  campaignStatuses[campaign.status] || {
                    label: campaign.status || "Unknown",
                    className: "review",
                  };

                const progress = Math.min(
                  Math.max(Number(campaign.progressPercentage || 0), 0),
                  100,
                );

                const serviceName =
                  campaign.service?.platform ||
                  campaign.service?.name ||
                  "Campaign";

                return (
                  <article
                    className="advertiser-campaign-card"
                    key={campaign.id}
                  >
                    <div className="advertiser-campaign-card__top">
                      <div className="advertiser-campaign-card__title">
                        <h3>{campaign.name || "Untitled campaign"}</h3>

                        <span
                          className={`advertiser-campaign-status ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      <div className="advertiser-campaign-card__budget">
                        <strong>
                          {formatNaira(campaign.spentAmount)}{" "}
                          <small>
                            / {formatNaira(campaign.pricing?.totalBudget)}
                          </small>
                        </strong>

                        <span>Budget used</span>
                      </div>
                    </div>

                    <p className="advertiser-campaign-card__meta">
                      {serviceName}
                      {campaign.apiOrderId ? ` · API order #${campaign.apiOrderId}` : ""}
                      {" · Created"} {formatDate(campaign.createdAt)}
                    </p>

                    <div className="advertiser-campaign-card__progress-row">
                      <span>
                        {Number(campaign.completedQuantity || 0).toLocaleString("en-NG")}{" "}
                        of{" "}
                        {Number(campaign.targetQuantity || 0).toLocaleString("en-NG")}{" "}
                        slots filled
                      </span>
                      <strong>{progress}%</strong>
                    </div>

                    <div className="advertiser-campaign-card__progress">
                      <span style={{ width: `${progress}%` }} />
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>
    </section>
  );
};

export default AdvertiserCampaigns;