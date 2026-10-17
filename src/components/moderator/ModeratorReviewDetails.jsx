import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FileImage,
  Flag,
  MessageSquare,
  XCircle,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { authApi } from "../../services/auth.js";
import "../../styles/ModeratorReviewDetails.css";

function getStoredToken() {
  if (typeof window === "undefined") return "";

  return (
    window.sessionStorage.getItem("tecotaskToken") ||
    window.localStorage.getItem("tecotaskToken") ||
    ""
  );
}

function formatMoney(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "₦0";

  return `₦${new Intl.NumberFormat("en-NG", {
    maximumFractionDigits: 0,
  }).format(amount)}`;
}

function formatRelativeTime(value) {
  if (!value) return "Time unavailable";

  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return "Time unavailable";

  const minutes = Math.max(
    0,
    Math.floor((Date.now() - timestamp) / 60000),
  );

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(timestamp));
}

function formatTaskType(value) {
  if (!value) return "Task";

  return String(value)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function toInstructionList(value) {
  if (Array.isArray(value)) {
    return value.map(String).filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    return value
      .split(/\r?\n/)
      .map((item) => item.replace(/^\s*[-•\d.)]+\s*/, "").trim())
      .filter(Boolean);
  }

  return ["No task instructions were provided."];
}

function resolveProofUrl(value) {
  if (!value) return "";

  const url = String(value).trim();
  if (/^(https?:|data:|blob:)/i.test(url)) return url;

  const apiUrl = (
    import.meta.env.VITE_API_URL ||
    window.location.origin
  ).replace(/\/+$/, "");

  return `${apiUrl}/${url.replace(/^\/+/, "")}`;
}

function isImageUrl(value) {
  return /\.(png|jpe?g|gif|webp|avif)(?:[?#].*)?$/i.test(value || "");
}
function normalizeSubmission(submission) {
  const earner = submission.earner || {};
  const task = submission.task || {};
  const campaign = submission.campaign || {};

  const proofUrl = resolveProofUrl(submission.proofUrl);
  const uploadedImageUrl = resolveProofUrl(submission.proofImageUrl);

  const proofImages = [];

  if (uploadedImageUrl) {
    proofImages.push({
      label: "Screenshot proof",
      url: uploadedImageUrl,
    });
  } else if (proofUrl && isImageUrl(proofUrl)) {
    proofImages.push({
      label: "Submitted proof",
      url: proofUrl,
    });
  }

  const proofLinks =
    proofUrl && !isImageUrl(proofUrl)
      ? [{ label: "Open submitted proof", url: proofUrl }]
      : [];

  return {
    id: submission.id,
    status: submission.status || "submitted",
    earnerName:
      earner.fullName || earner.email || "Unknown earner",
    taskTitle: task.title || "Untitled task",
    submittedAt: formatRelativeTime(
      submission.submittedAt || submission.createdAt,
    ),
    advertiser:
      task.brand ||
      campaign.serviceName ||
      campaign.name ||
      "Not listed",
    campaign: campaign.name || "Not listed",
    category: formatTaskType(task.type),
    amount: formatMoney(
      submission.rewardAmount ?? task.rewardAmount ?? 0,
    ),
    reviewRewardAmount: Number(submission.reviewRewardAmount ?? 0),
    description: task.description || "No task description was provided.",
    instructions: toInstructionList(task.instructions),
    submittedResponse:
      submission.proofNote || "No written note was included.",
    proofImages,
    proofLinks,
  };
}

export default function ModeratorReviewDetails() {
  const { reviewId } = useParams();
  const navigate = useNavigate();
  const [token] = useState(getStoredToken);

  const [review, setReview] = useState(null);
  const [rejectionReasons, setRejectionReasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reasonsLoading, setReasonsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reasonsError, setReasonsError] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [busyAction, setBusyAction] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPage() {
      if (!token) {
        setLoadError("Your moderator session was not found. Sign in again.");
        setReasonsError("Sign in again to load rejection reasons.");
        setLoading(false);
        setReasonsLoading(false);
        return;
      }

      setLoading(true);
      setReasonsLoading(true);
      setLoadError("");
      setReasonsError("");

      const [reviewResult, reasonsResult] = await Promise.allSettled([
        authApi.getModeratorReview(reviewId, token),
        authApi.getModeratorRejectionReasons(token),
      ]);

      if (!active) return;

      if (reviewResult.status === "fulfilled") {
        setReview(normalizeSubmission(reviewResult.value.submission));
      } else {
        setLoadError(
          reviewResult.reason?.message || "Could not load this submission.",
        );
      }

      if (reasonsResult.status === "fulfilled") {
        setRejectionReasons(
          Array.isArray(reasonsResult.value.reasons)
            ? reasonsResult.value.reasons
            : [],
        );
      } else {
        setReasonsError(
          reasonsResult.reason?.message ||
            "Could not load rejection reasons.",
        );
      }

      setLoading(false);
      setReasonsLoading(false);
    }

    loadPage();

    return () => {
      active = false;
    };
  }, [reviewId, token]);

  const decision =
    review?.status === "approved" || review?.status === "rejected"
      ? review.status
      : "";

  const selectedReason = rejectionReasons.find(
    (reason) => reason.id === rejectionReason,
  );
  const commentRequired = Boolean(selectedReason?.requiresComment);

  async function handleDecision(nextDecision) {
    setError("");
    setSuccessMessage("");

    if (!review || !token || decision || busyAction) return;

    if (nextDecision === "rejected" && !rejectionReason) {
      setError("Select a rejection reason before rejecting this task.");
      return;
    }

    if (
      nextDecision === "rejected" &&
      commentRequired &&
      !comment.trim()
    ) {
      setError("Add a comment for the selected rejection reason.");
      return;
    }

    const confirmation =
      nextDecision === "approved"
        ? `Approve "${review.taskTitle}"? This records the review and updates campaign and wallet balances.`
        : `Reject "${review.taskTitle}"? This records the decision and moderator reward.`;

   

    setBusyAction(nextDecision);

    try {
      const result =
        nextDecision === "approved"
          ? await authApi.approveModeratorReview(review.id, token)
          : await authApi.rejectModeratorReview(
              review.id,
              {
                rejectionReasonId: rejectionReason,
                moderatorComment: comment.trim(),
              },
              token,
            );

      setReview((current) =>
        current ? { ...current, status: nextDecision } : current,
      );
      setSuccessMessage(
        result.message ||
          (nextDecision === "approved"
            ? "Task approved."
            : "Task rejected."),
      );

      window.setTimeout(() => {
        navigate("/moderator/reviews", { replace: true });
      }, 900);
    } catch (requestError) {
      setError(
        requestError.message || "Could not record this review decision.",
      );
    } finally {
      setBusyAction("");
    }
  }

if (loading) {
  return (
    <main className="moderator-review-details">
      <div
        className="moderator-review-details__loading"
        role="status"
        aria-live="polite"
      >
        <span className="moderator-review-loader" aria-hidden="true" />
       <span className="moderator-review-loading-label">
  Loading review queue…
</span>
<span className="moderator-review-sr-only">
  Loading review queue
</span>
      </div>
    </main>
  );
}

  if (!review) {
    return (
      <main className="moderator-review-details">
        <div className="moderator-review-details__not-found">
          <h1>{loadError ? "Could not load review" : "Review not found"}</h1>
          {loadError ? <p>{loadError}</p> : null}
          <Link to="/moderator/reviews">Return to review queue</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="moderator-review-details">
      <div className="moderator-review-details__inner">
        <Link
          to="/moderator/reviews"
          className="moderator-review-details__back"
        >
          <ArrowLeft size={15} />
          Back to review queue
        </Link>

        <header className="moderator-review-details__header">
          <div>
            <span className="moderator-review-details__eyebrow">
              Task submission
            </span>
            <h1>{review.taskTitle}</h1>
            <p>
              Submitted by {review.earnerName} · {review.submittedAt}
            </p>
          </div>

          <div className="moderator-review-details__header-status">
            <span
              className={`moderator-detail-status moderator-detail-status--${
                decision || "pending"
              }`}
            >
              {decision
                ? decision === "approved"
                  ? "Approved"
                  : "Rejected"
                : "Pending review"}
            </span>
          </div>
        </header>

        <section className="moderator-review-details__layout">
          <div className="moderator-review-details__main">
            <section className="moderator-detail-card">
              <div className="moderator-detail-card__heading">
                <div>
                  <h2>Submitted proof</h2>
                  <p>Review the proof supplied by the earner.</p>
                </div>
                <FileImage size={17} />
              </div>

   {review.proofImages.length > 0 && (
  <div className="moderator-proof-image-grid">
    {review.proofImages.map((image) => (
      <a
        href={image.url}
        target="_blank"
        rel="noopener noreferrer"
        className="moderator-proof-image"
        key={image.url}
      >
        <img src={image.url} alt={image.label} />
        <span>
          {image.label}
          <ExternalLink size={13} />
        </span>
      </a>
    ))}
  </div>
)}

{review.proofLinks.length > 0 && (
  <div className="moderator-proof-links">
    <h3>Proof link</h3>
    {review.proofLinks.map((link) => (
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        key={link.url}
      >
        <ExternalLink size={14} />
        Open proof link
      </a>
    ))}
  </div>
)}

{review.proofImages.length === 0 &&
  review.proofLinks.length === 0 && (
    <p className="moderator-detail-empty">
      No proof file or link was attached to this submission.
    </p>
  )}
              <div className="moderator-submitted-response">
                <span>Earner’s note</span>
                <p>{review.submittedResponse}</p>
              </div>
            </section>

            <section className="moderator-detail-card">
              <div className="moderator-detail-card__heading">
                <div>
                  <h2>Task instructions</h2>
                  <p>Compare the proof against these requirements.</p>
                </div>
                <Flag size={17} />
              </div>

              <ol className="moderator-instruction-list">
                {review.instructions.map((instruction, index) => (
                  <li key={`${index}-${instruction}`}>{instruction}</li>
                ))}
              </ol>

              <p className="moderator-task-description">
                {review.description}
              </p>
            </section>
          </div>

          <aside className="moderator-review-details__side">
            <section className="moderator-detail-card">
              <h2>Task details</h2>
              <div className="moderator-detail-facts">
                <div>
                  <span>Earner</span>
                  <strong>{review.earnerName}</strong>
                </div>
                <div>
                  <span>Advertiser</span>
                  <strong>{review.advertiser}</strong>
                </div>
                <div>
                  <span>Campaign</span>
                  <strong>{review.campaign}</strong>
                </div>
                <div>
                  <span>Category</span>
                  <strong>{review.category}</strong>
                </div>
                <div>
                  <span>Reward</span>
                  <strong>{review.amount}</strong>
                </div>
              </div>
              <p className="moderator-task-description">
                {review.description}
              </p>
            </section>

            <section className="moderator-decision-card">
              <div className="moderator-decision-card__heading">
                <MessageSquare size={16} />
                <div>
                  <h2>Make a decision</h2>
                  <p>Choose a rejection reason when rejecting a task.</p>
                </div>
              </div>
<div className="moderator-decision-reward">
  <span>Your reward for this decision</span>
  <strong>
    {review.reviewRewardAmount > 0
      ? formatMoney(review.reviewRewardAmount)
      : "Not configured"}
  </strong>
  <small>Paid for either approval or rejection.</small>
</div>
              <label>
                Rejection reason
                <select
                  value={rejectionReason}
                  onChange={(event) => setRejectionReason(event.target.value)}
                  disabled={
                    Boolean(decision) ||
                    Boolean(busyAction) ||
                    reasonsLoading
                  }
                >
                  <option value="">
                    {reasonsLoading
                      ? "Loading reasons…"
                      : "Select a reason"}
                  </option>
                  {rejectionReasons.map((reason) => (
                    <option value={reason.id} key={reason.id}>
                      {reason.label}
                      {reason.requiresComment ? " (comment required)" : ""}
                    </option>
                  ))}
                </select>
              </label>

              {reasonsError ? (
                <p className="moderator-decision-error" role="alert">
                  {reasonsError}
                </p>
              ) : selectedReason?.description ? (
                <p>{selectedReason.description}</p>
              ) : null}

              <label>
                Comment {commentRequired ? "(required)" : "(optional)"}
                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Add context for the rejection, if helpful."
                  disabled={Boolean(decision) || Boolean(busyAction)}
                  required={commentRequired}
                  maxLength={2000}
                  rows={5}
                />
              </label>

              {error ? (
                <p className="moderator-decision-error" role="alert">
                  {error}
                </p>
              ) : null}

              {successMessage ? (
                <p className="moderator-decision-success" role="status">
                  {successMessage}
                </p>
              ) : null}

              <div className="moderator-decision-actions">
                <button
                  type="button"
                  className="moderator-decision-button moderator-decision-button--approve"
                  disabled={Boolean(decision) || Boolean(busyAction)}
                  onClick={() => handleDecision("approved")}
                >
                  <CheckCircle2 size={15} />
                  {busyAction === "approved" ? "Approving…" : "Approve task"}
                </button>

                <button
                  type="button"
                  className="moderator-decision-button moderator-decision-button--reject"
                  disabled={Boolean(decision) || Boolean(busyAction)}
                  onClick={() => handleDecision("rejected")}
                >
                  <XCircle size={15} />
                  {busyAction === "rejected" ? "Rejecting…" : "Reject task"}
                </button>
              </div>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}