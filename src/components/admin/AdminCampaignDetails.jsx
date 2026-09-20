import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Edit3,
  Megaphone,
  WalletCards,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

import { adminCampaigns } from "../data/adminCampaignData";

import "../../styles/AdminCampaigns.css";

const statusClasses = {
  Published: "campaign-status campaign-status--published",
  "Pending review": "campaign-status campaign-status--pending",
  "Needs changes": "campaign-status campaign-status--changes",
  Paused: "campaign-status campaign-status--paused",
};

export default function AdminCampaignDetails({
  basePath = "/admin",
}) {
  const { campaignId } = useParams();
  const navigate = useNavigate();

  const campaign = adminCampaigns.find(
    (item) => item.id === campaignId
  );

  const [adminInstructions, setAdminInstructions] = useState(
    campaign?.adminInstructions || ""
  );

  if (!campaign) {
    return (
      <main className="admin-campaigns-page">
        <div className="campaign-not-found">
          <h1>Campaign not found</h1>
          <p>The campaign you are looking for does not exist.</p>

          <Link to={`${basePath}/campaigns`}>
            Return to campaigns
          </Link>
        </div>
      </main>
    );
  }

  const progress = Math.round(
    (campaign.approved / campaign.totalSlots) * 100
  );

  const handleAction = (action) => {
    window.alert(`Campaign ${action}.`);
    navigate(`${basePath}/campaigns`);
  };

  return (
    <main className="admin-campaigns-page">
      <div className="admin-campaigns-container">
        <Link
          to={`${basePath}/campaigns`}
          className="campaign-back-link"
        >
          <ArrowLeft size={15} />
          Back to campaigns
        </Link>

        <section className="campaign-detail-header">
          <div className="campaign-detail-title">
            <span className="campaign-detail-icon">
              <Megaphone size={19} />
            </span>

            <div>
              <p className="admin-campaigns-eyebrow">
                Campaign review
              </p>

              <h1>{campaign.name}</h1>

              <p>
                Submitted by {campaign.advertiser} · {campaign.created}
              </p>
            </div>
          </div>

          <span className={statusClasses[campaign.status]}>
            <i />
            {campaign.status}
          </span>
        </section>

        <section className="campaign-detail-stat-grid">
          <article>
            <p>Price per person</p>
            <strong>₦{campaign.rewardPerPerson}</strong>
            <span>Admin-approved service price</span>
          </article>

          <article>
            <p>Total budget</p>
            <strong>₦{campaign.totalBudget}</strong>
            <span>Based on available slots</span>
          </article>

          <article>
            <p>Available slots</p>
            <strong>{campaign.totalSlots}</strong>
            <span>{campaign.approved} already approved</span>
          </article>

          <article>
            <p>Progress</p>
            <strong>{progress}%</strong>
            <span>Campaign completion</span>
          </article>
        </section>

        <section className="campaign-detail-layout">
          <div className="campaign-detail-main">
            <article className="campaign-detail-card">
              <div className="campaign-detail-card-heading">
                <div>
                  <h2>Campaign instructions</h2>
                  <p>Review and improve the advertiser&apos;s instructions.</p>
                </div>

                <Edit3 size={17} />
              </div>

              <div className="campaign-instruction-block">
                <span>Advertiser instructions</span>
                <p>{campaign.advertiserInstructions}</p>
              </div>

              <label className="campaign-form-field">
                <span>Admin instructions for earners</span>
                <textarea
                  rows="7"
                  value={adminInstructions}
                  onChange={(event) =>
                    setAdminInstructions(event.target.value)
                  }
                  placeholder="Add clear instructions for earners..."
                />
              </label>
            </article>

            <article className="campaign-detail-card">
              <div className="campaign-detail-card-heading">
                <div>
                  <h2>Campaign activity</h2>
                  <p>Current submission progress.</p>
                </div>

                <Clock3 size={17} />
              </div>

              <div className="campaign-detail-progress">
                <div className="campaign-progress-heading">
                  <strong>{progress}% complete</strong>
                  <span>
                    {campaign.approved} of {campaign.totalSlots}
                  </span>
                </div>

                <div className="campaign-large-progress-track">
                  <span style={{ width: `${progress}%` }} />
                </div>

                <div className="campaign-progress-meta">
                  <span>{campaign.approved} approved</span>
                  <span>{campaign.pending} pending</span>
                  <span>{campaign.rejected} rejected</span>
                </div>
              </div>
            </article>
          </div>

          <aside className="campaign-detail-side">
            <article className="campaign-detail-card">
              <div className="campaign-detail-card-heading">
                <div>
                  <h2>Review decision</h2>
                  <p>Choose what happens next.</p>
                </div>

                <WalletCards size={17} />
              </div>

              <div className="campaign-review-actions">
                <button
                  type="button"
                  className="campaign-primary-button"
                  onClick={() => handleAction("approved and published")}
                >
                  <CheckCircle2 size={15} />
                  Approve and publish
                </button>

                <button
                  type="button"
                  className="campaign-warning-button"
                  onClick={() => handleAction("sent back for changes")}
                >
                  <Edit3 size={15} />
                  Request changes
                </button>

                <button
                  type="button"
                  className="campaign-danger-button"
                  onClick={() => handleAction("rejected")}
                >
                  <AlertTriangle size={15} />
                  Reject campaign
                </button>
              </div>
            </article>

            <article className="campaign-detail-card">
              <h2>Service information</h2>

              <div className="campaign-information-list">
                <div>
                  <span>Service</span>
                  <strong>{campaign.service}</strong>
                </div>

                <div>
                  <span>Category</span>
                  <strong>{campaign.category}</strong>
                </div>

                <div>
                  <span>Reward</span>
                  <strong>₦{campaign.rewardPerPerson} per person</strong>
                </div>

                <div>
                  <span>Advertiser</span>
                  <strong>{campaign.advertiser}</strong>
                </div>
              </div>
            </article>
          </aside>
        </section>
      </div>
    </main>
  );
}