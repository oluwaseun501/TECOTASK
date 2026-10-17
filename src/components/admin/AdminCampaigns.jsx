import {
  BarChart3,
  ChevronRight,
  ClipboardList,
  Pencil,
  Plus,
  Power,
  Settings2,
  WalletCards,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getAdminCampaigns,
  getAdminServices,
  updateAdminService,
} from "../data/adminCampaignApi.js";
import "../../styles/AdminCampaigns.css";

const tabs = [
  { key: "campaigns", label: "Campaign list", icon: ClipboardList },
  { key: "progress", label: "Campaign progress", icon: BarChart3 },
  { key: "services", label: "Service pricing", icon: Settings2 },
];

const statusLabels = {
  draft: "Draft",
  pending_review: "Pending review",
  active: "Published",
  paused: "Paused",
  completed: "Completed",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

const statusClasses = {
  draft: "campaign-status campaign-status--paused",
  pending_review: "campaign-status campaign-status--pending",
  active: "campaign-status campaign-status--published",
  paused: "campaign-status campaign-status--paused",
  completed: "campaign-status campaign-status--published",
  rejected: "campaign-status campaign-status--changes",
  cancelled: "campaign-status campaign-status--changes",
};

const statusFilters = [
  ["pending_review", "Pending review"],
  ["active", "Published"],
  ["paused", "Paused"],
  ["completed", "Completed"],
  ["rejected", "Rejected"],
  ["draft", "Draft"],
  ["cancelled", "Cancelled"],
];

function formatNumber(value) {
  return new Intl.NumberFormat("en-NG").format(Number(value || 0));
}

function toCampaignViewModel(campaign) {
  const submissionCounts = campaign.submissionCounts || {};

  return {
    ...campaign,
    advertiser:
      campaign.advertiser?.fullName || "Unknown advertiser",
    serviceName:
      campaign.service?.name || "Service unavailable",
    platform:
      campaign.service?.platform || "",
    rewardPerPerson: Number(
      campaign.pricing?.earnerRewardPerPerson ||
        campaign.service?.earnerRewardPerPerson ||
        0,
    ),
    totalBudget: Number(
      campaign.pricing?.totalBudget || 0,
    ),
    totalSlots: Number(campaign.targetQuantity || 0),
    approved: Number(
      submissionCounts.approved ??
        campaign.completedQuantity ??
        0,
    ),
    pending: Number(submissionCounts.submitted || 0),
    rejected: Number(submissionCounts.rejected || 0),
    statusLabel:
      statusLabels[campaign.status] || campaign.status,
  };
}

function SummaryCard({
  label,
  value,
  detail,
  tone = "default",
}) {
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

function CampaignLoader({ label, compact = false }) {
  return (
    <div
      className={`campaign-loading ${
        compact ? "campaign-loading--compact" : ""
      }`}
      role="status"
      aria-live="polite"
    >
      <span className="campaign-loading__roller" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

function CampaignList({
  campaigns,
  basePath,
  loading,
}) {
  const [statusFilter, setStatusFilter] = useState("");

  const filteredCampaigns = useMemo(() => {
    if (!statusFilter) {
      return campaigns;
    }

    return campaigns.filter(
      (campaign) => campaign.status === statusFilter,
    );
  }, [campaigns, statusFilter]);

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
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
          aria-label="Filter campaigns by status"
        >
          <option value="">All statuses</option>
          {statusFilters.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
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
            {loading ? (
             <tr>
  <td colSpan={6}>
    <CampaignLoader label="Loading campaigns…" compact />
  </td>
</tr>
            ) : filteredCampaigns.length === 0 ? (
              <tr>
                <td colSpan="6">
                  No campaigns match this status.
                </td>
              </tr>
            ) : (
              filteredCampaigns.map((campaign) => {
                const progress = campaign.totalSlots
                  ? Math.min(
                      Math.round(
                        (campaign.approved /
                          campaign.totalSlots) *
                          100,
                      ),
                      100,
                    )
                  : 0;

                return (
                  <tr key={campaign.id}>
                    <td>
                      <div className="campaign-name-cell">
                        <span className="campaign-list-icon">
                          <ClipboardList size={15} />
                        </span>

                        <div>
                          <strong>{campaign.name}</strong>
                          <small>{campaign.serviceName}</small>
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
                        ₦{formatNumber(campaign.rewardPerPerson)}
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
                          {campaign.approved}/
                          {campaign.totalSlots}
                        </small>
                      </div>
                    </td>

                    <td>
                      <span
                        className={
                          statusClasses[campaign.status] ||
                          statusClasses.draft
                        }
                      >
                        <i />
                        {campaign.statusLabel}
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
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function CampaignProgress({ campaigns, loading }) {
  const progressItems = campaigns.filter((campaign) =>
    ["active", "paused", "completed"].includes(
      campaign.status,
    ),
  );

  return (
    <section className="campaign-content-card">
      <div className="campaign-content-header">
        <div>
          <h2>Campaign progress</h2>
          <p>Track approved tasks and current campaign activity.</p>
        </div>
      </div>

      {loading ? (
        <CampaignLoader label="Loading campaign progress…" />
      ) : progressItems.length === 0 ? (
        <p style={{ padding: 16 }}>
          No published campaigns to show yet.
        </p>
      ) : (
        <div className="campaign-progress-list">
          {progressItems.map((campaign) => {
            const percentage = campaign.totalSlots
              ? Math.min(
                  Math.round(
                    (campaign.approved /
                      campaign.totalSlots) *
                      100,
                  ),
                  100,
                )
              : 0;

            return (
              <div
                className="campaign-progress-item"
                key={campaign.id}
              >
                <div className="campaign-progress-heading">
                  <div>
                    <strong>{campaign.name}</strong>
                    <small>{campaign.advertiser}</small>
                  </div>

                  <span>{percentage}% complete</span>
                </div>

                <div className="campaign-large-progress-track">
                  <span
                    style={{ width: `${percentage}%` }}
                  />
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
      )}
    </section>
  );
}

function ServicePricing({
  services,
  basePath,
  loading,
  onUpdate,
}) {
  const [editingService, setEditingService] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [busyServiceId, setBusyServiceId] = useState("");
  const [notice, setNotice] = useState({ type: "", text: "" });

  function openEditor(service) {
    setEditingService(service);
    setForm({
      name: service.name || "",
      platform: service.platform || "",
      description: service.description || "",
      defaultInstructions: Array.isArray(service.defaultInstructions)
        ? service.defaultInstructions.join("\n")
        : "",
      advertiserPricePerPerson: String(
        service.advertiserPricePerPerson ?? "",
      ),
      earnerRewardPerPerson: String(
        service.earnerRewardPerPerson ?? "",
      ),
      platformFeePerPerson: String(
        service.platformFeePerPerson ?? "",
      ),
    });
    setNotice({ type: "", text: "" });
  }

  function closeEditor() {
    if (saving) return;

    setEditingService(null);
    setForm(null);
  }

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSave(event) {
    event.preventDefault();

    if (!editingService || !form) return;

    const advertiserPricePerPerson = Number(
      form.advertiserPricePerPerson,
    );
    const earnerRewardPerPerson = Number(
      form.earnerRewardPerPerson,
    );
    const platformFeePerPerson = Number(
      form.platformFeePerPerson,
    );

    if (
      !Number.isSafeInteger(advertiserPricePerPerson) ||
      advertiserPricePerPerson < 1 ||
      !Number.isSafeInteger(earnerRewardPerPerson) ||
      earnerRewardPerPerson < 1 ||
      !Number.isSafeInteger(platformFeePerPerson) ||
      platformFeePerPerson < 0
    ) {
      setNotice({
        type: "error",
        text: "Prices must be whole naira amounts. The earner reward must be at least ₦1 and the platform fee cannot be negative.",
      });
      return;
    }

    if (
      advertiserPricePerPerson <
      earnerRewardPerPerson + platformFeePerPerson
    ) {
      setNotice({
        type: "error",
        text: "Advertiser price must cover the earner reward and platform fee.",
      });
      return;
    }

    const defaultInstructions = form.defaultInstructions
      .split(/\r?\n/)
      .map((instruction) => instruction.trim())
      .filter(Boolean);

    if (defaultInstructions.length > 20) {
      setNotice({
        type: "error",
        text: "A service can have at most 20 default instruction steps.",
      });
      return;
    }

    setSaving(true);
    setNotice({ type: "", text: "" });

    try {
      await onUpdate(editingService.id, {
        name: form.name.trim(),
        platform: form.platform.trim(),
        description: form.description.trim(),
        defaultInstructions,
        advertiserPricePerPerson,
        earnerRewardPerPerson,
        platformFeePerPerson,
      });

      setEditingService(null);
      setForm(null);
      setNotice({
        type: "success",
        text: "Service updated. Existing campaigns keep their saved pricing.",
      });
    } catch (error) {
      setNotice({
        type: "error",
        text: error.message || "Could not update this service.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function toggleService(service) {
    setBusyServiceId(service.id);
    setNotice({ type: "", text: "" });

    try {
      const updatedService = await onUpdate(service.id, {
        isActive: !service.isActive,
      });

      setNotice({
        type: "success",
        text: updatedService.isActive
          ? `${updatedService.name} is active and available to advertisers.`
          : `${updatedService.name} is inactive and hidden from advertisers.`,
      });
    } catch (error) {
      setNotice({
        type: "error",
        text: error.message || "Could not update the service status.",
      });
    } finally {
      setBusyServiceId("");
    }
  }

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

      {notice.text && (
        <p
          className={`service-management-notice service-management-notice--${notice.type}`}
          role={notice.type === "error" ? "alert" : "status"}
        >
          {notice.text}
        </p>
      )}

      {loading ? (
        <CampaignLoader label="Loading services…" />
      ) : services.length === 0 ? (
        <p style={{ padding: 16 }}>
          No services have been added yet.
        </p>
      ) : (
        <div className="service-pricing-list">
          {services.map((service) => (
            <div className="service-pricing-row" key={service.id}>
              <div className="service-pricing-icon">
                <WalletCards size={17} />
              </div>

              <div className="service-pricing-details">
                <strong>{service.name}</strong>
                <small>
                  {service.platform}
                  {service.description
                    ? ` · ${service.description}`
                    : ""}
                </small>
                <small>
                  Earner reward: ₦
                  {formatNumber(service.earnerRewardPerPerson)}
                  {" · "}Platform fee: ₦
                  {formatNumber(service.platformFeePerPerson)}
                </small>
              </div>

              <div className="service-price">
                <strong>
                  ₦
                  {formatNumber(
                    service.advertiserPricePerPerson,
                  )}
                </strong>
                <small>per person</small>
              </div>

              <span
                className={
                  service.isActive
                    ? "campaign-status campaign-status--published"
                    : "campaign-status campaign-status--paused"
                }
              >
                <i />
                {service.isActive ? "Active" : "Inactive"}
              </span>

              <div className="service-pricing-actions">
                <button
                  type="button"
                  className="service-management-button"
                  onClick={() => openEditor(service)}
                  aria-label={`Edit ${service.name}`}
                >
                  <Pencil size={14} />
                  Edit
                </button>

                <button
                  type="button"
                  className={`service-management-button ${
                    service.isActive
                      ? "service-management-button--deactivate"
                      : "service-management-button--activate"
                  }`}
                  onClick={() => toggleService(service)}
                  disabled={busyServiceId === service.id}
                >
                  <Power size={14} />
                  {busyServiceId === service.id
                    ? "Saving…"
                    : service.isActive
                      ? "Deactivate"
                      : "Reactivate"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingService && form && (
        <div className="service-edit-overlay">
          <section
            className="service-edit-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="service-edit-title"
          >
            <header className="service-edit-modal__header">
              <div>
                <span>Service pricing</span>
                <h2 id="service-edit-title">Edit service</h2>
                <p>
                  Changes apply to new campaigns. Existing campaigns keep
                  their saved pricing.
                </p>
              </div>

              <button
                type="button"
                className="service-edit-modal__close"
                onClick={closeEditor}
                disabled={saving}
                aria-label="Close edit service"
              >
                ×
              </button>
            </header>

            <form onSubmit={handleSave}>
              <div className="service-edit-form-grid">
                <label>
                  Service name
                  <input
                    value={form.name}
                    onChange={(event) =>
                      updateField("name", event.target.value)
                    }
                    maxLength={100}
                    required
                  />
                </label>

                <label>
                  Category / platform
                  <input
                    value={form.platform}
                    onChange={(event) =>
                      updateField("platform", event.target.value)
                    }
                    maxLength={50}
                    required
                  />
                </label>

                <label className="service-edit-form-grid__full">
                  Service description
                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      updateField("description", event.target.value)
                    }
                    maxLength={500}
                    rows={3}
                  />
                </label>

                <label className="service-edit-form-grid__full">
                  Default instructions
                  <textarea
                    value={form.defaultInstructions}
                    onChange={(event) =>
                      updateField(
                        "defaultInstructions",
                        event.target.value,
                      )
                    }
                    placeholder="Put one instruction on each line"
                    rows={5}
                  />
                  <small>Up to 20 instructions, one per line.</small>
                </label>

                <label>
                  Advertiser price per person (₦)
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={form.advertiserPricePerPerson}
                    onChange={(event) =>
                      updateField(
                        "advertiserPricePerPerson",
                        event.target.value,
                      )
                    }
                    required
                  />
                </label>

                <label>
                  Earner reward per person (₦)
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={form.earnerRewardPerPerson}
                    onChange={(event) =>
                      updateField(
                        "earnerRewardPerPerson",
                        event.target.value,
                      )
                    }
                    required
                  />
                </label>

                <label>
                  Platform fee per person (₦)
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.platformFeePerPerson}
                    onChange={(event) =>
                      updateField(
                        "platformFeePerPerson",
                        event.target.value,
                      )
                    }
                    required
                  />
                </label>
              </div>

              {notice.type === "error" && (
                <p className="service-management-notice service-management-notice--error">
                  {notice.text}
                </p>
              )}

              <div className="service-edit-modal__actions">
                <button
                  type="button"
                  className="service-management-button"
                  onClick={closeEditor}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="campaign-primary-button"
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}

export default function AdminCampaigns({
  basePath = "/admin",
}) {
  const [activeTab, setActiveTab] = useState("campaigns");
  const [campaigns, setCampaigns] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [serviceError, setServiceError] = useState("");


  const handleUpdateService = useCallback(
    async (serviceId, updates) => {
      const updatedService = await updateAdminService(
        serviceId,
        updates,
      );

      setServices((current) =>
        current.map((service) =>
          service.id === updatedService.id
            ? updatedService
            : service,
        ),
      );

      return updatedService;
    },
    [],
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    setServiceError("");

    const [campaignResult, serviceResult] =
      await Promise.allSettled([
        getAdminCampaigns(),
        getAdminServices(),
      ]);

    if (campaignResult.status === "fulfilled") {
      setCampaigns(
        campaignResult.value.map(toCampaignViewModel),
      );
    } else {
      setCampaigns([]);
      setError(
        campaignResult.reason?.message ||
          "Could not load campaigns.",
      );
    }

    if (serviceResult.status === "fulfilled") {
      setServices(serviceResult.value || []);
    } else {
      setServices([]);
      setServiceError(
        serviceResult.reason?.message ||
          "Could not load services.",
      );
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const summary = useMemo(
    () => ({
      activeServices: services.filter(
        (service) => service.isActive,
      ).length,
      pendingReview: campaigns.filter(
        (campaign) => campaign.status === "pending_review",
      ).length,
      published: campaigns.filter(
        (campaign) => campaign.status === "active",
      ).length,
      total: campaigns.length,
    }),
    [campaigns, services],
  );

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
              Set service pricing, review campaigns, and monitor
              progress.
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

        {error && (
          <div
            role="alert"
            style={{
              marginBottom: 16,
              padding: 12,
              color: "#9f2424",
              background: "#fff0f0",
              borderRadius: 8,
            }}
          >
            {error}
          </div>
        )}

        <section className="campaign-summary-grid">
          <SummaryCard
            label="Active services"
            value={loading ? "—" : summary.activeServices}
            detail="Available to advertisers"
            tone="green"
          />

          <SummaryCard
            label="Pending review"
            value={loading ? "—" : summary.pendingReview}
            detail="Waiting for admin approval"
            tone="amber"
          />

          <SummaryCard
            label="Published campaigns"
            value={loading ? "—" : summary.published}
            detail="Currently visible to earners"
            tone="blue"
          />

          <SummaryCard
            label="Total campaigns"
            value={loading ? "—" : summary.total}
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
          <CampaignList
            campaigns={campaigns}
            basePath={basePath}
            loading={loading}
          />
        )}

        {activeTab === "progress" && (
          <CampaignProgress
            campaigns={campaigns}
            loading={loading}
          />
        )}

        {activeTab === "services" && (
          <>
            {serviceError && (
              <div
                role="alert"
                style={{
                  marginBottom: 12,
                  padding: 12,
                  color: "#9f2424",
                  background: "#fff0f0",
                  borderRadius: 8,
                }}
              >
                {serviceError}
              </div>
            )}

           <ServicePricing
  services={services}
  basePath={basePath}
  loading={loading}
  onUpdate={handleUpdateService}
/>
          </>
        )}
      </div>
    </main>
  );
}