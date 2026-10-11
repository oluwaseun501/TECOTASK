import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileImage,
  Flag,
  HelpCircle,
  MoreHorizontal,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { authApi } from "../../services/auth.js";
import "../../styles/ModeratorOverview.css";

const PAGE_LIMIT = 100;

function getStoredValue(key) {
  return (
    sessionStorage.getItem(key) ||
    localStorage.getItem(key) ||
    ""
  );
}

function formatMoney(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "₦0";
  }

  return `₦${new Intl.NumberFormat("en-NG", {
    maximumFractionDigits: 0,
  }).format(amount)}`;
}

function formatRelativeTime(value) {
  if (!value) {
    return "Time unavailable";
  }

  const timestamp = new Date(value).getTime();

  if (!Number.isFinite(timestamp)) {
    return "Time unavailable";
  }

  const minutes = Math.max(
    0,
    Math.floor((Date.now() - timestamp) / 60000),
  );

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} days ago`;

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(timestamp));
}

function formatLabel(value) {
  if (!value) return "Task";

  return String(value)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function toText(value) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.join("\n");
  if (value == null) return "";
  return String(value);
}

function getInitials(name) {
  const initials = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return initials || "EA";
}

function normalizeReview(submission) {
  const earner = submission.earner || {};
  const task = submission.task || {};
  const campaign = submission.campaign || {};
  const name =
    earner.fullName ||
    earner.email ||
    "Unknown earner";

  return {
    id: submission.id,
    name,
    initials: getInitials(name),
    task: task.title || "Untitled task",
    category: formatLabel(task.type),
    amount: Number(
      submission.rewardAmount ??
        task.rewardAmount ??
        0,
    ),
    submittedAt: formatRelativeTime(
      submission.submittedAt || submission.createdAt,
    ),
    advertiser:
      task.brand ||
      campaign.serviceName ||
      campaign.name ||
      "Not listed",
    campaign: campaign.name || "Not listed",
    platform: campaign.platform || "Not listed",
    taskDescription: toText(task.description),
    instructions: toText(task.instructions),
    proofUrl: toText(submission.proofUrl).trim(),
    proofNote: toText(submission.proofNote).trim(),
  };
}

function resolveProofUrl(value) {
  if (!value) return "";

  if (/^(https?:|data:|blob:)/i.test(value)) {
    return value;
  }

  const apiUrl = (
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000"
  ).replace(/\/+$/, "");

  return `${apiUrl}/${value.replace(/^\/+/, "")}`;
}

function isImageUrl(value) {
  return /\.(png|jpe?g|gif|webp|avif)(?:[?#].*)?$/i.test(
    value || "",
  );
}

function Avatar({ initials }) {
  return (
    <span className="moderator-review-avatar">
      {initials}
    </span>
  );
}

function SessionCard({
  label,
  value,
  description,
  tone = "neutral",
  icon: Icon,
}) {
  return (
    <article
      className={`moderator-session-card moderator-session-card--${tone}`}
    >
      <div className="moderator-session-card__top">
        <span>{label}</span>
        <Icon size={14} strokeWidth={1.8} />
      </div>

      <strong>{value}</strong>

      <p>{description}</p>
    </article>
  );
}

function PendingReviewRow({
  review,
  selected,
  onSelect,
}) {
  return (
    <button
      type="button"
      className={`moderator-pending-row ${
        selected ? "moderator-pending-row--active" : ""
      }`}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <Avatar initials={review.initials} />

      <span className="moderator-pending-row__content">
        <strong>{review.task}</strong>

        <small>
          {review.name} · {review.submittedAt}
        </small>
      </span>

      <span className="moderator-pending-row__amount">
        {formatMoney(review.amount)}
      </span>
    </button>
  );
}

function ReviewDetails({
  review,
  reasons,
  reasonsLoading,
  reasonsError,
  rejecting,
  selectedReasonId,
  moderatorComment,
  busyAction,
  actionError,
  onApprove,
  onOpenReject,
  onCancelReject,
  onReasonChange,
  onCommentChange,
  onReject,
}) {
  if (!review) {
    return (
      <section className="moderator-review-panel">
        <div className="moderator-live-state">
          Select a pending submission to review its proof and task
          details.
        </div>
      </section>
    );
  }

  const selectedReason = reasons.find(
    (reason) => reason.id === selectedReasonId,
  );
  const commentRequired =
    Boolean(selectedReason?.requiresComment);
  const canSubmitRejection =
    Boolean(selectedReasonId) &&
    (!commentRequired || moderatorComment.trim().length > 0) &&
    !busyAction;

  const proofHref = resolveProofUrl(review.proofUrl);
  const proofIsImage = isImageUrl(review.proofUrl);

  return (
    <section className="moderator-review-panel">
      <div className="moderator-review-panel__header">
        <div>
          <span className="moderator-review-status">
            Pending review
          </span>

          <h2>{review.task}</h2>

          <p>
            Submitted by {review.name} · {review.submittedAt}
          </p>
        </div>

        <button
          type="button"
          className="moderator-icon-button"
          aria-label="More review options"
          title="More review options"
        >
          <MoreHorizontal size={17} />
        </button>
      </div>

      <div className="moderator-review-summary">
        <div className="moderator-review-summary__avatar">
          <Avatar initials={review.initials} />
        </div>

        <div>
          <span>Submitted by</span>
          <strong>{review.name}</strong>
        </div>

        <div>
          <span>Task category</span>
          <strong>{review.category}</strong>
        </div>

        <div>
          <span>Earner reward</span>
          <strong>{formatMoney(review.amount)}</strong>
        </div>
      </div>

      <div className="moderator-proof-section">
        <div className="moderator-proof-heading">
          <div>
            <h3>Submission proof</h3>
            <p>Proof attached by the earner</p>
          </div>

          <FileImage size={16} />
        </div>

        <div className="moderator-proof-preview">
          {proofHref ? (
            <>
              {proofIsImage ? (
                <a
                  href={proofHref}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Open submitted proof image"
                >
                  <img
                    className="moderator-proof-image"
                    src={proofHref}
                    alt={`Proof for ${review.task}`}
                  />
                </a>
              ) : (
                <FileImage size={28} />
              )}

              <a
                className="moderator-proof-link"
                href={proofHref}
                target="_blank"
                rel="noreferrer"
              >
                Open submitted proof ↗
              </a>
            </>
          ) : (
            <>
              <FileImage size={28} />
              <strong>No proof file attached</strong>
              <span>
                Check the earner’s proof note or task submission.
              </span>
            </>
          )}
        </div>

        {review.proofNote ? (
          <div className="moderator-proof-note">
            <strong>Earner’s note</strong>
            <p>{review.proofNote}</p>
          </div>
        ) : null}
      </div>

      <div className="moderator-checklist">
        <h3>Task instructions</h3>
        <p className="moderator-task-instructions">
          {review.instructions ||
            review.taskDescription ||
            "No task instructions were provided."}
        </p>
      </div>

      <div className="moderator-review-actions">
        <button
          type="button"
          className="moderator-action-button moderator-action-button--approve"
          disabled={Boolean(busyAction) || rejecting}
          onClick={onApprove}
        >
          <CheckCircle2 size={15} />
          {busyAction === "approve"
            ? "Approving..."
            : "Approve submission"}
        </button>

        {!rejecting ? (
          <button
            type="button"
            className="moderator-action-button moderator-action-button--reject"
            disabled={Boolean(busyAction)}
            onClick={onOpenReject}
          >
            <XCircle size={15} />
            Reject submission
          </button>
        ) : null}

        <span>
          Decisions are recorded against your moderator account.
        </span>
      </div>

      {rejecting ? (
        <form
          className="moderator-rejection-form"
          onSubmit={onReject}
        >
          <div className="moderator-rejection-form__field">
            <label htmlFor="moderator-rejection-reason">
              Rejection reason
            </label>

            {reasonsLoading ? (
              <p className="moderator-live-state">
                Loading active rejection reasons...
              </p>
            ) : reasons.length > 0 ? (
              <select
                id="moderator-rejection-reason"
                value={selectedReasonId}
                onChange={(event) =>
                  onReasonChange(event.target.value)
                }
                required
                disabled={Boolean(busyAction)}
              >
                <option value="">Select a reason</option>
                {reasons.map((reason) => (
                  <option key={reason.id} value={reason.id}>
                    {reason.label}
                    {reason.requiresComment
                      ? " (comment required)"
                      : ""}
                  </option>
                ))}
              </select>
            ) : (
              <p
                className="moderator-live-state moderator-live-state--error"
                role="alert"
              >
                {reasonsError ||
                  "No active rejection reasons are available."}
              </p>
            )}

            {selectedReason?.description ? (
              <small>{selectedReason.description}</small>
            ) : null}
          </div>

          <div className="moderator-rejection-form__field">
            <label htmlFor="moderator-rejection-comment">
              Moderator comment
              {commentRequired ? " (required)" : " (optional)"}
            </label>

            <textarea
              id="moderator-rejection-comment"
              value={moderatorComment}
              onChange={(event) =>
                onCommentChange(event.target.value)
              }
              maxLength={2000}
              rows={4}
              placeholder={
                commentRequired
                  ? "Add a comment for this reason"
                  : "Add context for the rejection, if helpful"
              }
              disabled={Boolean(busyAction)}
              required={commentRequired}
            />
          </div>

          {actionError ? (
            <p
              className="moderator-action-error"
              role="alert"
            >
              {actionError}
            </p>
          ) : null}

          <div className="moderator-rejection-form__actions">
            <button
              type="submit"
              className="moderator-action-button moderator-action-button--reject"
              disabled={!canSubmitRejection}
            >
              <XCircle size={15} />
              {busyAction === "reject"
                ? "Rejecting..."
                : "Confirm rejection"}
            </button>

            <button
              type="button"
              className="moderator-action-button moderator-action-button--cancel"
              disabled={Boolean(busyAction)}
              onClick={onCancelReject}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : actionError ? (
        <p className="moderator-action-error" role="alert">
          {actionError}
        </p>
      ) : null}
    </section>
  );
}

function ModerationGuide({ review }) {
  return (
    <aside className="moderator-guide-panel">
      <div className="moderator-guide-panel__heading">
        <div>
          <h2>How to review</h2>
          <p>Check the proof against the task requirements.</p>
        </div>

        <HelpCircle size={16} />
      </div>

      <div className="moderator-guide-note">
        <AlertCircle size={15} />

        <p>
          If the proof is unclear or incomplete, reject the task
          using the reason that best matches the issue.
        </p>
      </div>

      <div className="moderator-guide-section">
        <h3>Moderator instructions</h3>

        <p>
          Confirm that the submitted proof matches the task
          instructions and belongs to the selected campaign.
        </p>

        <p>
          Approve only when the proof is clear and the required
          action is visible.
        </p>
      </div>

      <div className="moderator-guide-section">
        <h3>Selected task</h3>

        <div className="moderator-context-row">
          <span>Advertiser</span>
          <strong>{review?.advertiser || "—"}</strong>
        </div>

        <div className="moderator-context-row">
          <span>Campaign</span>
          <strong>{review?.campaign || "—"}</strong>
        </div>

        <div className="moderator-context-row">
          <span>Platform</span>
          <strong>{review?.platform || "—"}</strong>
        </div>
      </div>

      <div className="moderator-guide-status">
        <ShieldCheck size={15} />
        <span>
          Review decisions are logged against your moderator account.
        </span>
      </div>
    </aside>
  );
}

export default function ModeratorOverview() {
  const [token] = useState(() =>
    getStoredValue("tecotaskToken"),
  );
  const [reviews, setReviews] = useState([]);
  const [reasons, setReasons] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPending, setTotalPending] = useState(0);
  const [queueLoading, setQueueLoading] = useState(true);
  const [reasonsLoading, setReasonsLoading] = useState(true);
  const [queueError, setQueueError] = useState("");
  const [reasonsError, setReasonsError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyAction, setBusyAction] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [selectedReasonId, setSelectedReasonId] = useState("");
  const [moderatorComment, setModeratorComment] = useState("");
  const [sessionReviewedCount, setSessionReviewedCount] =
    useState(0);
  const [sessionEarnings, setSessionEarnings] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadQueue() {
      if (!token) {
        setQueueError(
          "Your moderator session was not found. Sign in again to load the review queue.",
        );
        setQueueLoading(false);
        return;
      }

      setQueueLoading(true);
      setQueueError("");

      try {
        const data = await authApi.getModeratorReviewQueue(
          page,
          PAGE_LIMIT,
          token,
        );

        if (!isActive) return;

        const nextReviews = Array.isArray(data.submissions)
          ? data.submissions.map(normalizeReview)
          : [];

        setReviews(nextReviews);
        setTotalPending(
          Number(data.totalPending ?? data.pagination?.total ?? 0),
        );
        setTotalPages(
          Math.max(1, Number(data.pagination?.totalPages ?? 1)),
        );
      } catch (error) {
        if (!isActive) return;

        setQueueError(
          error.message || "Could not load the moderator queue.",
        );
      } finally {
        if (isActive) setQueueLoading(false);
      }
    }

    loadQueue();

    return () => {
      isActive = false;
    };
  }, [page, refreshKey, token]);

  useEffect(() => {
    let isActive = true;

    async function loadReasons() {
      if (!token) {
        setReasonsError(
          "Your moderator session was not found. Sign in again.",
        );
        setReasonsLoading(false);
        return;
      }

      setReasonsLoading(true);
      setReasonsError("");

      try {
        const data =
          await authApi.getModeratorRejectionReasons(token);

        if (!isActive) return;

        setReasons(
          Array.isArray(data.reasons) ? data.reasons : [],
        );
      } catch (error) {
        if (!isActive) return;

        setReasonsError(
          error.message ||
            "Could not load rejection reasons.",
        );
      } finally {
        if (isActive) setReasonsLoading(false);
      }
    }

    loadReasons();

    return () => {
      isActive = false;
    };
  }, [refreshKey, token]);

  useEffect(() => {
    if (
      !reviews.some((review) => review.id === selectedId)
    ) {
      setSelectedId(reviews[0]?.id || "");
    }
  }, [reviews, selectedId]);

  useEffect(() => {
    if (!notice) return undefined;

    const timeout = window.setTimeout(() => {
      setNotice("");
    }, 3000);

    return () => window.clearTimeout(timeout);
  }, [notice]);

  const selectedReview =
    reviews.find((review) => review.id === selectedId) || null;

  function handleSelectReview(reviewId) {
    setSelectedId(reviewId);
    setRejecting(false);
    setSelectedReasonId("");
    setModeratorComment("");
    setActionError("");
  }

  function recordSuccessfulDecision(data, decision) {
    const moderatorReward = Number(
      data.submission?.moderatorRewardAmount ?? 0,
    );

    setSessionReviewedCount((count) => count + 1);
    setSessionEarnings((amount) => amount + moderatorReward);
    setNotice(
      data.message ||
        (decision === "approved"
          ? "Submission approved."
          : "Submission rejected."),
    );

    setReviews((current) =>
      current.filter(
        (review) => review.id !== selectedReview?.id,
      ),
    );

    setSelectedId("");
    setRejecting(false);
    setSelectedReasonId("");
    setModeratorComment("");

    if (reviews.length <= 1 && page > 1) {
      setPage((current) => Math.max(1, current - 1));
    }

    setRefreshKey((current) => current + 1);
  }

  async function handleApprove() {
    if (!selectedReview || !token) return;

    const confirmed = window.confirm(
      `Approve "${selectedReview.task}"? This records the review and affects campaign and wallet balances.`,
    );

    if (!confirmed) return;

    setActionError("");
    setBusyAction("approve");

    try {
      const data = await authApi.approveModeratorReview(
        selectedReview.id,
        token,
      );

      recordSuccessfulDecision(data, "approved");
    } catch (error) {
      setActionError(
        error.message || "Could not approve this submission.",
      );
    } finally {
      setBusyAction("");
    }
  }

  async function handleReject(event) {
    event.preventDefault();

    if (!selectedReview || !token) return;

    const chosenReason = reasons.find(
      (reason) => reason.id === selectedReasonId,
    );

    if (!chosenReason) {
      setActionError("Select a valid rejection reason.");
      return;
    }

    if (
      chosenReason.requiresComment &&
      !moderatorComment.trim()
    ) {
      setActionError(
        "Add a comment for the selected rejection reason.",
      );
      return;
    }

    const confirmed = window.confirm(
      `Reject "${selectedReview.task}" for "${chosenReason.label}"? This decision will be recorded.`,
    );

    if (!confirmed) return;

    setActionError("");
    setBusyAction("reject");

    try {
      const data = await authApi.rejectModeratorReview(
        selectedReview.id,
        {
          rejectionReasonId: selectedReasonId,
          moderatorComment: moderatorComment.trim(),
        },
        token,
      );

      recordSuccessfulDecision(data, "rejected");
    } catch (error) {
      setActionError(
        error.message || "Could not reject this submission.",
      );
    } finally {
      setBusyAction("");
    }
  }

  function handleRefresh() {
    setRefreshKey((current) => current + 1);
  }

  return (
    <main className="moderator-overview">
      <div className="moderator-overview__inner">
        <header className="moderator-queue-header">
          <div>
            <span className="moderator-overview__eyebrow">
              Moderator workspace
            </span>

            <h1>Review queue</h1>

            <p>
              Review each proof before you approve or reject.
            </p>
          </div>

          <div className="moderator-queue-header__actions">
            <button
              type="button"
              className="moderator-icon-button"
              aria-label="Refresh review queue"
              title="Refresh review queue"
              onClick={handleRefresh}
              disabled={queueLoading}
            >
              <RefreshCw size={15} />
            </button>

            <span
              className="moderator-queue-avatar"
              aria-label="Moderator account"
            >
              MO
            </span>
          </div>
        </header>

        <section className="moderator-session-grid">
          <SessionCard
            label="Moderator earnings"
            value={formatMoney(sessionEarnings)}
            description="Rewards from reviews this session"
            tone="green"
            icon={FileCheck2}
          />

          <SessionCard
            label="Reviewed this session"
            value={sessionReviewedCount}
            description="Decisions recorded during this visit"
            tone="blue"
            icon={CheckCircle2}
          />

          <SessionCard
            label="Waiting in queue"
            value={totalPending}
            description="Oldest submissions appear first"
            tone="amber"
            icon={Clock3}
          />
        </section>

        <section className="moderator-review-workspace">
          <section className="moderator-pending-panel">
            <div className="moderator-panel-heading">
              <div>
                <h2>Pending proofs ({totalPending})</h2>
                <p>Select a submission to review.</p>
              </div>

              <span>
                <Flag size={13} />
              </span>
            </div>

            {queueError && reviews.length > 0 ? (
              <div
                className="moderator-live-state moderator-live-state--error"
                role="alert"
              >
                {queueError}
              </div>
            ) : null}

            <div className="moderator-pending-list">
              {queueLoading && reviews.length === 0 ? (
             <div className="moderator-live-state" role="status">
  <span className="moderator-loading-roller" aria-hidden="true" />
  <span className="moderator-loading-sr-only">
    Loading pending submissions
  </span>
</div>
              ) : queueError && reviews.length === 0 ? (
                <div
                  className="moderator-live-state moderator-live-state--error"
                  role="alert"
                >
                  {queueError}
                </div>
              ) : reviews.length === 0 ? (
                <div className="moderator-live-state" role="status">
                  No pending submissions in this queue.
                </div>
              ) : (
                reviews.map((review) => (
                  <PendingReviewRow
                    key={review.id}
                    review={review}
                    selected={selectedReview?.id === review.id}
                    onSelect={() =>
                      handleSelectReview(review.id)
                    }
                  />
                ))
              )}
            </div>

            {totalPages > 1 ? (
              <div className="moderator-pending-pagination">
                <button
                  type="button"
                  onClick={() =>
                    setPage((current) =>
                      Math.max(1, current - 1),
                    )
                  }
                  disabled={page <= 1 || queueLoading}
                >
                  Previous
                </button>

                <span>
                  Page {page} of {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setPage((current) =>
                      Math.min(totalPages, current + 1),
                    )
                  }
                  disabled={page >= totalPages || queueLoading}
                >
                  Next
                </button>
              </div>
            ) : null}
          </section>

          <ReviewDetails
            review={selectedReview}
            reasons={reasons}
            reasonsLoading={reasonsLoading}
            reasonsError={reasonsError}
            rejecting={rejecting}
            selectedReasonId={selectedReasonId}
            moderatorComment={moderatorComment}
            busyAction={busyAction}
            actionError={actionError}
            onApprove={handleApprove}
            onOpenReject={() => {
              setActionError("");
              setRejecting(true);
            }}
            onCancelReject={() => {
              setRejecting(false);
              setSelectedReasonId("");
              setModeratorComment("");
              setActionError("");
            }}
            onReasonChange={(value) => {
              setSelectedReasonId(value);
              setActionError("");
            }}
            onCommentChange={(value) => {
              setModeratorComment(value);
              setActionError("");
            }}
            onReject={handleReject}
          />

          <ModerationGuide review={selectedReview} />
        </section>

        {notice ? (
          <div
            className="moderator-toast"
            role="status"
            aria-live="polite"
          >
            <CheckCircle2 size={15} />
            {notice}
          </div>
        ) : null}
      </div>
    </main>
  );
}