import {
  BarChart3,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  Plus,
  Settings2,
  WalletCards,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

import {
  adminCampaigns,
  serviceTemplates,
} from "../data/adminCampaignData";

import "../../styles/AdminCampaigns.css";

const tabs = [
  {
    key: "campaigns",
    label: "Campaign list",
    icon: ClipboardList,
  },
  {
    key: "progress",
    label: "Campaign progress",
    icon: BarChart3,
  },
  {
    key: "services",
    label: "Service pricing",
    icon: Settings2,
  },
];

const statusClasses = {
  Published: "campaign-status campaign-status--published",
  "Pending review": "campaign-status campaign-status--pending",
  "Needs changes": "campaign-status campaign-status--changes",
  Paused: "campaign-status campaign-status--paused",
};

function SummaryCard({ label, value, detail, tone = "default" }) {
  return (
    <article
      className={`campaign-summary-card campaign-summary-card--${tone}`}
    >
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </article>
  );
}

function CampaignList({ basePath }) {
  const [statusFilter, setStatusFilter] = useState("All statuses");

  const filteredCampaigns =
    statusFilter === "All statuses"
      ? adminCampaigns
      : adminCampaigns.filter(
          (campaign) => campaign.status === statusFilter
        );

  return (
    <section className="campaign-content-card">
      <div className="campaign-content-header">
        <div>
          <h2>Campaign list</h2>
          <p>Review and manage advertiser campaigns.</p>
        </div>

        <select
          className="campaign-status-filter"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option>All statuses</option>
          <option>Pending review</option>
          <option>Published</option>
          <option>Needs changes</option>
          <option>Paused</option>
        </select>
      </div>

      <div className="campaign-table-wrapper">
        <table className="campaign-table">
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Advertiser</th>
              <th>Reward</th>
              <th>Progress</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {filteredCampaigns.map((campaign) => {
              const progress = Math.round(
                (campaign.approved / campaign.totalSlots) * 100
              );

              return (
                <tr key={campaign.id}>
                  <td>
                    <div className="campaign-name-cell">
                      <span className="campaign-list-icon">
                        <ClipboardList size={15} />
                      </span>

                      <div>
                        <strong>{campaign.name}</strong>
                        <small>{campaign.service}</small>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="campaign-muted-text">
                      {campaign.advertiser}
                    </span>
                  </td>

                  <td>
                    <strong className="campaign-price">
                      ₦{campaign.rewardPerPerson}
                    </strong>
                    <small className="campaign-per-person">
                      per person
                    </small>
                  </td>

                  <td>
                    <div className="campaign-progress-cell">
                      <div className="campaign-progress-track">
                        <span
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <small>
                        {campaign.approved}/{campaign.totalSlots}
                      </small>
                    </div>
                  </td>

                  <td>
                    <span className={statusClasses[campaign.status]}>
                      <i />
                      {campaign.status}
                    </span>
                  </td>

                  <td>
                    <Link
                      to={`${basePath}/campaigns/${campaign.id}`}
                      className="campaign-view-link"
                    >
                      View
                      <ChevronRight size={14} />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function CampaignProgress() {
  const progressItems = adminCampaigns.filter(
    (campaign) =>
      campaign.status === "Published" ||
      campaign.status === "Paused"
  );

  return (
    <section className="campaign-content-card">
      <div className="campaign-content-header">
        <div>
          <h2>Campaign progress</h2>
          <p>Track approved tasks and current campaign activity.</p>
        </div>
      </div>

      <div className="campaign-progress-list">
        {progressItems.map((campaign) => {
          const percentage = Math.round(
            (campaign.approved / campaign.totalSlots) * 100
          );

          return (
            <div className="campaign-progress-item" key={campaign.id}>
              <div className="campaign-progress-heading">
                <div>
                  <strong>{campaign.name}</strong>
                  <small>{campaign.advertiser}</small>
                </div>

                <span>{percentage}% complete</span>
              </div>

              <div className="campaign-large-progress-track">
                <span style={{ width: `${percentage}%` }} />
              </div>

              <div className="campaign-progress-meta">
                <span>{campaign.approved} approved</span>
                <span>{campaign.pending} pending</span>
                <span>{campaign.rejected} rejected</span>
                <span>{campaign.totalSlots} total slots</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ServicePricing({ basePath }) {
  return (
    <section className="campaign-content-card">
      <div className="campaign-content-header">
        <div>
          <h2>Service pricing</h2>
          <p>
            Set the reward advertisers will pay per approved earner.
          </p>
        </div>

        <Link
          to={`${basePath}/campaigns/new-service`}
          className="campaign-primary-button"
        >
          <Plus size={15} />
          Add service
        </Link>
      </div>

      <div className="service-pricing-list">
        {serviceTemplates.map((service) => (
          <div className="service-pricing-row" key={service.id}>
            <div className="service-pricing-icon">
              <WalletCards size={17} />
            </div>

            <div className="service-pricing-details">
              <strong>{service.name}</strong>
              <small>
                {service.category} · {service.description}
              </small>
            </div>

            <div className="service-price">
              <strong>₦{service.pricePerPerson}</strong>
              <small>per person</small>
            </div>

            <span
              className={
                service.status === "Active"
                  ? "campaign-status campaign-status--published"
                  : "campaign-status campaign-status--paused"
              }
            >
              <i />
              {service.status}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function AdminCampaigns({
  basePath = "/admin",
}) {
  const [activeTab, setActiveTab] = useState("campaigns");

  return (
    <main className="admin-campaigns-page">
      <div className="admin-campaigns-container">
        <header className="admin-campaigns-header">
          <div>
            <p className="admin-campaigns-eyebrow">
              Campaign management
            </p>

            <h1>Campaigns</h1>

            <p>
              Set service pricing, review campaigns, and monitor progress.
            </p>
          </div>

          <Link
            to={`${basePath}/campaigns/new-service`}
            className="campaign-primary-button"
          >
            <Plus size={15} />
            Add service
          </Link>
        </header>

        <section className="campaign-summary-grid">
          <SummaryCard
            label="Active services"
            value={serviceTemplates.filter(
              (service) => service.status === "Active"
            ).length}
            detail="Available to advertisers"
            tone="green"
          />

          <SummaryCard
            label="Pending review"
            value={adminCampaigns.filter(
              (campaign) => campaign.status === "Pending review"
            ).length}
            detail="Waiting for admin approval"
            tone="amber"
          />

          <SummaryCard
            label="Published campaigns"
            value={adminCampaigns.filter(
              (campaign) => campaign.status === "Published"
            ).length}
            detail="Currently visible to earners"
            tone="blue"
          />

          <SummaryCard
            label="Total campaigns"
            value={adminCampaigns.length}
            detail="Across all statuses"
            tone="default"
          />
        </section>

        <div className="campaign-tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;

            return (
              <button
                type="button"
                key={tab.key}
                className={`campaign-tab ${
                  active ? "campaign-tab--active" : ""
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "campaigns" && (
          <CampaignList basePath={basePath} />
        )}

        {activeTab === "progress" && <CampaignProgress />}

        {activeTab === "services" && (
          <ServicePricing basePath={basePath} />
        )}
      </div>
    </main>
  );
}