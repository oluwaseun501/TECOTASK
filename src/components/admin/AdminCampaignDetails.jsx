import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Edit3,
  Megaphone,
  WalletCards,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

import {
  approveAdminCampaign,
  getAdminCampaign,
  rejectAdminCampaign,
  saveAdminCampaignReviewNotes,
} from "../data/adminCampaignApi.js";

import "../../styles/AdminCampaigns.css";

const statusClasses = {
  pending_review: "campaign-status campaign-status--pending",
  active: "campaign-status campaign-status--published",
  paused: "campaign-status campaign-status--paused",
  completed: "campaign-status campaign-status--published",
  rejected: "campaign-status campaign-status--changes",
  draft: "campaign-status campaign-status--paused",
  cancelled: "campaign-status campaign-status--changes",
};

const statusLabels = {
  draft: "Draft",
  pending_review: "Pending review",
  active: "Published",
  paused: "Paused",
  completed: "Completed",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

function formatCurrency(value) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
  }).format(date);
}

function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function AdminCampaignDetails({ basePath = "/admin" }) {
  const { campaignId } = useParams();

  const [campaign, setCampaign] = useState(null);
  const [adminTaskInstructions, setAdminTaskInstructions] = useState("");
  const [adminPrivateNote, setAdminPrivateNote] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const cancelConfirmationRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCampaign() {
      setLoading(true);
      setError("");
      setNotice("");

      try {
        const result = await getAdminCampaign(campaignId);

        if (cancelled) return;

        setCampaign(result);
        setAdminTaskInstructions(result.adminTaskInstructions || "");
        setAdminPrivateNote(result.adminPrivateNote || "");
        setRejectionReason(result.rejectionReason || "");
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message || "Could not load this campaign.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadCampaign();

    return () => {
      cancelled = true;
    };
  }, [campaignId]);

  useEffect(() => {
    if (!confirmation) return;

    cancelConfirmationRef.current?.focus();

    function handleConfirmationKeyDown(event) {
      if (event.key === "Escape" && !busy) {
        setConfirmation(null);
      }
    }

    window.addEventListener("keydown", handleConfirmationKeyDown);

    return () => {
      window.removeEventListener("keydown", handleConfirmationKeyDown);
    };
  }, [confirmation, busy]);

  const mergeCampaignUpdate = (updatedCampaign) => {
    setCampaign((current) => ({
      ...current,
      ...updatedCampaign,
      submissionCounts:
        updatedCampaign.submissionCounts ||
        current?.submissionCounts || {
          started: 0,
          submitted: 0,
          approved: 0,
          rejected: 0,
        },
    }));
  };

  const requestApprovalConfirmation = () => {
    setError("");
    setNotice("");
    setConfirmation("approve");
  };

  const requestRejectionConfirmation = () => {
    if (!rejectionReason.trim()) {
      setError(
        "Enter a rejection reason. The advertiser will be able to see it.",
      );
      return;
    }

    setError("");
    setNotice("");
    setConfirmation("reject");
  };

  const handleSaveNotes = async () => {
    setBusy("save");
    setError("");
    setNotice("");

    try {
      const updatedCampaign = await saveAdminCampaignReviewNotes(
        campaignId,
        {
          adminTaskInstructions,
          adminPrivateNote,
        },
      );

      mergeCampaignUpdate(updatedCampaign);
      setNotice("Review notes saved.");
    } catch (saveError) {
      setError(saveError.message || "Could not save review notes.");
    } finally {
      setBusy("");
    }
  };

  const handleApprove = async () => {
    setBusy("approve");
    setError("");
    setNotice("");

    try {
      const result = await approveAdminCampaign(campaignId, {
        adminTaskInstructions,
        adminPrivateNote,
      });

      mergeCampaignUpdate(result.campaign);
      setNotice(result.message || "Campaign approved and published.");
    } catch (approveError) {
      setError(
        approveError.message || "Could not approve this campaign.",
      );
    } finally {
      setBusy("");
    }
  };

  const handleReject = async () => {
    const reason = rejectionReason.trim();

    if (!reason) {
      setError(
        "Enter a rejection reason. The advertiser will be able to see it.",
      );
      return;
    }

    setBusy("reject");
    setError("");
    setNotice("");

    try {
      const result = await rejectAdminCampaign(campaignId, {
        rejectionReason: reason,
        adminTaskInstructions,
        adminPrivateNote,
      });

      mergeCampaignUpdate(result.campaign);
      setNotice(
        result.message ||
          "Campaign rejected and reserved funds refunded.",
      );
    } catch (rejectError) {
      setError(
        rejectError.message || "Could not reject this campaign.",
      );
    } finally {
      setBusy("");
    }
  };

  const confirmCampaignDecision = async () => {
    if (!confirmation || busy) return;

    if (confirmation === "approve") {
      await handleApprove();
    } else if (confirmation === "reject") {
      await handleReject();
    }

    setConfirmation(null);
  };

  if (loading) {
    return (
      <main className="admin-campaigns-page">
        <div className="admin-campaigns-container">
          <div
            className="campaign-loading campaign-loading--page"
            role="status"
            aria-live="polite"
          >
            <span className="campaign-loading__roller" aria-hidden="true" />
            <span>Loading campaign details…</span>
            <small>Fetching campaign information for review.</small>
          </div>
        </div>
      </main>
    );
  }

  if (!campaign) {
    return (
      <main className="admin-campaigns-page">
        <div className="admin-campaigns-container">
          <div className="campaign-not-found">
            <h1>Campaign not found</h1>
            <p>{error || "This campaign could not be loaded."}</p>
            <Link to={`${basePath}/campaigns`}>Return to campaigns</Link>
          </div>
        </div>
      </main>
    );
  }

  const counts = campaign.submissionCounts || {};
  const approvedCount = Number(
    counts.approved ?? campaign.completedQuantity ?? 0,
  );
  const pendingCount = Number(counts.submitted || 0);
  const rejectedCount = Number(counts.rejected || 0);
  const totalSlots = Number(campaign.targetQuantity || 0);

  const progress = totalSlots
    ? Math.min(Math.round((approvedCount / totalSlots) * 100), 100)
    : 0;

  const isPendingReview = campaign.status === "pending_review";

  const advertiserInstructions = Array.isArray(campaign.instructions)
    ? campaign.instructions.join("\n")
    : String(campaign.instructions || "");

  const statusLabel = statusLabels[campaign.status] || campaign.status;
  const isApprovalConfirmation = confirmation === "approve";

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

        {error && (
          <div
            className="campaign-feedback campaign-feedback--error"
            role="alert"
          >
            {error}
          </div>
        )}

        {notice && (
          <div
            className="campaign-feedback campaign-feedback--success"
            role="status"
          >
            {notice}
          </div>
        )}

        <section className="campaign-detail-header">
          <div className="campaign-detail-title">
            <span className="campaign-detail-icon">
              <Megaphone size={19} />
            </span>

            <div>
              <p className="admin-campaigns-eyebrow">Campaign review</p>
              <h1>{campaign.name}</h1>
              <p>
                Submitted by{" "}
                {campaign.advertiser?.fullName || "Unknown advertiser"} ·{" "}
                {formatDate(campaign.submittedAt)}
              </p>
            </div>
          </div>

          <span
            className={
              statusClasses[campaign.status] || statusClasses.draft
            }
          >
            <i />
            {statusLabel}
          </span>
        </section>

        <section className="campaign-detail-stat-grid">
          <article>
            <p>Earner reward per person</p>
            <strong>
              {formatCurrency(campaign.pricing?.earnerRewardPerPerson)}
            </strong>
            <span>Reward for each approved submission</span>
          </article>

          <article>
            <p>Total budget</p>
            <strong>{formatCurrency(campaign.pricing?.totalBudget)}</strong>
            <span>Advertiser-funded campaign budget</span>
          </article>

          <article>
            <p>Available slots</p>
            <strong>{campaign.remainingQuantity ?? totalSlots}</strong>
            <span>{approvedCount} already approved</span>
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
                  <h2>Campaign brief</h2>
                  <p>Details submitted by the advertiser.</p>
                </div>
                <Edit3 size={17} />
              </div>

              <div className="campaign-information-list">
                <div>
                  <span>Brief</span>
                  <strong>{campaign.shortBrief || "—"}</strong>
                </div>

                <div>
                  <span>Proof required</span>
                  <strong>{campaign.proofRequirements || "—"}</strong>
                </div>

                <div>
                  <span>Advertiser</span>
                  <strong>
                    {campaign.advertiser?.fullName || "Unknown advertiser"}
                  </strong>
                </div>

                <div>
                  <span>Advertiser email</span>
                  <strong>{campaign.advertiser?.email || "—"}</strong>
                </div>

                <div>
                  <span>Submitted</span>
                  <strong>{formatDateTime(campaign.submittedAt)}</strong>
                </div>
              </div>
            </article>

            <article className="campaign-detail-card">
              <div className="campaign-detail-card-heading">
                <div>
                  <h2>Campaign instructions</h2>
                  <p>Review the advertiser’s task instructions.</p>
                </div>
                <Edit3 size={17} />
              </div>

              <div className="campaign-instruction-block">
                <span>Advertiser instructions</span>
                <p>
                  {advertiserInstructions || "No instructions provided."}
                </p>
              </div>

              <label className="campaign-form-field">
                <span>Additional instructions for earners (optional)</span>
                <textarea
                  rows="5"
                  maxLength={3000}
                  value={adminTaskInstructions}
                  onChange={(event) =>
                    setAdminTaskInstructions(event.target.value)
                  }
                  placeholder="Add clarifying details to help earners complete the task."
                  disabled={!isPendingReview || Boolean(busy)}
                />
              </label>

              <label className="campaign-form-field">
                <span>Private admin note (admins only)</span>
                <textarea
                  rows="4"
                  maxLength={2000}
                  value={adminPrivateNote}
                  onChange={(event) =>
                    setAdminPrivateNote(event.target.value)
                  }
                  placeholder="Optional internal note. This is not shown to advertisers or earners."
                  disabled={!isPendingReview || Boolean(busy)}
                />
              </label>

              {isPendingReview && (
                <button
                  type="button"
                  className="campaign-primary-button"
                  onClick={handleSaveNotes}
                  disabled={Boolean(busy)}
                >
                  {busy === "save" ? "Saving…" : "Save notes"}
                </button>
              )}
            </article>

            {campaign.rejectionReason && (
              <article className="campaign-detail-card">
                <h2>Rejection reason</h2>
                <p>{campaign.rejectionReason}</p>
              </article>
            )}
          </div>

          <aside className="campaign-detail-side">
            <article className="campaign-detail-card">
              <div className="campaign-detail-card-heading">
                <div>
                  <h2>Campaign activity</h2>
                  <p>Submission status and progress.</p>
                </div>
                <Clock3 size={17} />
              </div>

              <div className="campaign-detail-progress">
                <div className="campaign-progress-heading">
                  <strong>{progress}% complete</strong>
                  <span>
                    {approvedCount} of {totalSlots}
                  </span>
                </div>

                <div className="campaign-large-progress-track">
                  <span style={{ width: `${progress}%` }} />
                </div>

                <div className="campaign-progress-meta">
                  <span>{approvedCount} approved</span>
                  <span>{pendingCount} pending</span>
                  <span>{rejectedCount} rejected</span>
                </div>
              </div>
            </article>

            <article className="campaign-detail-card">
              <div className="campaign-detail-card-heading">
                <div>
                  <h2>Review decision</h2>
                  <p>
                    {isPendingReview
                      ? "Approve the campaign or reject it with a reason."
                      : "This campaign is no longer awaiting review."}
                  </p>
                </div>
                <WalletCards size={17} />
              </div>

              {isPendingReview ? (
                <>
                  <label className="campaign-form-field">
                    <span>Rejection reason for advertiser</span>
                    <textarea
                      rows="4"
                      maxLength={1000}
                      value={rejectionReason}
                      onChange={(event) =>
                        setRejectionReason(event.target.value)
                      }
                      placeholder="Required if rejecting. The advertiser will see this reason."
                      disabled={Boolean(busy)}
                    />
                  </label>

                  <div className="campaign-review-actions">
                    <button
                      type="button"
                      className="campaign-primary-button"
                      onClick={requestApprovalConfirmation}
                      disabled={Boolean(busy)}
                    >
                      <CheckCircle2 size={15} />
                      {busy === "approve"
                        ? "Approving…"
                        : "Approve and publish"}
                    </button>

                    <button
                      type="button"
                      className="campaign-danger-button"
                      onClick={requestRejectionConfirmation}
                      disabled={Boolean(busy)}
                    >
                      <AlertTriangle size={15} />
                      {busy === "reject"
                        ? "Rejecting…"
                        : "Reject and refund"}
                    </button>
                  </div>
                </>
              ) : (
                <p>
                  Current status: <strong>{statusLabel}</strong>
                </p>
              )}
            </article>

            <article className="campaign-detail-card">
              <h2>Service information</h2>

              <div className="campaign-information-list">
                <div>
                  <span>Service</span>
                  <strong>{campaign.service?.name || "—"}</strong>
                </div>

                <div>
                  <span>Platform</span>
                  <strong>{campaign.service?.platform || "—"}</strong>
                </div>

                <div>
                  <span>Advertiser price</span>
                  <strong>
                    {formatCurrency(
                      campaign.pricing?.advertiserPricePerPerson,
                    )}{" "}
                    per person
                  </strong>
                </div>

                <div>
                  <span>Platform fee</span>
                  <strong>
                    {formatCurrency(
                      campaign.pricing?.platformFeePerPerson,
                    )}{" "}
                    per person
                  </strong>
                </div>

                <div>
                  <span>Campaign slots</span>
                  <strong>{totalSlots}</strong>
                </div>
              </div>
            </article>
          </aside>
        </section>
      </div>

      {confirmation && (
        <div
          className="campaign-confirm-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !busy) {
              setConfirmation(null);
            }
          }}
        >
          <section
            className="campaign-confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="campaign-confirm-title"
            aria-describedby="campaign-confirm-description"
            aria-busy={Boolean(busy)}
          >
            <div
              className={`campaign-confirm-modal__icon ${
                isApprovalConfirmation
                  ? "campaign-confirm-modal__icon--approve"
                  : "campaign-confirm-modal__icon--reject"
              }`}
            >
              {isApprovalConfirmation ? (
                <CheckCircle2 size={20} />
              ) : (
                <AlertTriangle size={20} />
              )}
            </div>

            <span className="campaign-confirm-modal__eyebrow">
              CAMPAIGN REVIEW
            </span>

            <h2 id="campaign-confirm-title">
              {isApprovalConfirmation
                ? "Approve and publish this campaign?"
                : "Reject and refund this campaign?"}
            </h2>

            <p id="campaign-confirm-description">
              {isApprovalConfirmation
                ? "An earner task will be created, and this campaign will become available to earners."
                : "The advertiser will see the rejection reason, and unused reserved funds will be refunded."}
            </p>

            {confirmation === "reject" && rejectionReason.trim() && (
              <div className="campaign-confirm-modal__reason">
                <span>Rejection reason</span>
                <p>{rejectionReason.trim()}</p>
              </div>
            )}

            <div className="campaign-confirm-modal__actions">
              <button
                ref={cancelConfirmationRef}
                type="button"
                className="campaign-secondary-button"
                disabled={Boolean(busy)}
                onClick={() => setConfirmation(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className={
                  isApprovalConfirmation
                    ? "campaign-primary-button"
                    : "campaign-danger-button"
                }
                disabled={Boolean(busy)}
                onClick={() => void confirmCampaignDecision()}
              >
                {busy === "approve"
                  ? "Approving…"
                  : busy === "reject"
                    ? "Rejecting…"
                    : isApprovalConfirmation
                      ? "Approve and publish"
                      : "Reject and refund"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}