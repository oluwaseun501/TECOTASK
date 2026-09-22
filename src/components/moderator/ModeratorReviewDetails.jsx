import { useState } from "react";
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

import {
  getModeratorDecisions,
  moderatorReviews,
  saveModeratorDecision,
} from "./moderatorReviewData";

import "../../styles/ModeratorReviewDetails.css";

const rejectionReasons = [
  "Proof is unclear or unreadable",
  "Task instructions were not completed",
  "Wrong campaign or task submitted",
  "Duplicate submission",
  "Proof appears altered or misleading",
  "Other reason",
];

export default function ModeratorReviewDetails() {
  const { reviewId } = useParams();
  const navigate = useNavigate();

  const review = moderatorReviews.find(
    (item) => item.id === reviewId
  );

  const [decisions, setDecisions] = useState(() =>
    getModeratorDecisions()
  );
  const [decision, setDecision] = useState(
    decisions[reviewId] || ""
  );
  const [rejectionReason, setRejectionReason] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  if (!review) {
    return (
      <main className="moderator-review-details">
        <div className="moderator-review-details__not-found">
          <h1>Review not found</h1>
          <Link to="/moderator/reviews">
            Return to review queue
          </Link>
        </div>
      </main>
    );
  }

  const handleDecision = (nextDecision) => {
    setError("");

    if (nextDecision === "rejected" && !rejectionReason) {
      setError("Select a rejection reason before rejecting this task.");
      return;
    }

    if (nextDecision === "rejected" && !comment.trim()) {
      setError("Add a comment explaining why this task was rejected.");
      return;
    }

    const updatedDecisions = saveModeratorDecision(
      review.id,
      nextDecision
    );

    setDecisions(updatedDecisions);
    setDecision(nextDecision);

    window.setTimeout(() => {
      navigate("/moderator/reviews");
    }, 700);
  };

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
            {decision ? (
              <span
                className={`moderator-detail-status moderator-detail-status--${decision}`}
              >
                {decision === "approved" ? "Approved" : "Rejected"}
              </span>
            ) : (
              <span className="moderator-detail-status moderator-detail-status--pending">
                Pending review
              </span>
            )}
          </div>
        </header>

        <section className="moderator-review-details__layout">
          <div className="moderator-review-details__main">
            <section className="moderator-detail-card">
              <div className="moderator-detail-card__heading">
                <div>
                  <h2>Submitted proof</h2>
                  <p>Review the links and screenshots provided by the earner.</p>
                </div>

                <FileImage size={17} />
              </div>

              <div className="moderator-proof-image-grid">
                {review.proofImages.map((image) => (
                  <a
                    href={image.url}
                    target="_blank"
                    rel="noreferrer"
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

              <div className="moderator-proof-links">
                <h3>Submitted links</h3>

                {review.proofLinks.map((link) => (
                  <a
                    href={link.url}
                    target={link.url.startsWith("#") ? "_self" : "_blank"}
                    rel="noreferrer"
                    key={link.label}
                  >
                    <ExternalLink size={14} />
                    {link.label}
                  </a>
                ))}
              </div>
            </section>

            <section className="moderator-detail-card">
              <div className="moderator-detail-card__heading">
                <div>
                  <h2>Task instructions</h2>
                  <p>Compare the submitted proof against these requirements.</p>
                </div>

                <Flag size={17} />
              </div>

              <ol className="moderator-instruction-list">
                {review.instructions.map((instruction) => (
                  <li key={instruction}>{instruction}</li>
                ))}
              </ol>

              <div className="moderator-submitted-response">
                <span>Earner&apos;s response</span>
                <p>{review.submittedResponse}</p>
              </div>
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
                  <p>Leave a note when more context is needed.</p>
                </div>
              </div>

              <label>
                Rejection reason
                <select
                  value={rejectionReason}
                  onChange={(event) =>
                    setRejectionReason(event.target.value)
                  }
                  disabled={Boolean(decision)}
                >
                  <option value="">Select a reason</option>

                  {rejectionReasons.map((reason) => (
                    <option value={reason} key={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Comment
                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Add a comment for the earner or explain your decision..."
                  disabled={Boolean(decision)}
                  rows={5}
                />
              </label>

              {error ? (
                <p className="moderator-decision-error">
                  {error}
                </p>
              ) : null}

              <div className="moderator-decision-actions">
                <button
                  type="button"
                  className="moderator-decision-button moderator-decision-button--approve"
                  disabled={Boolean(decision)}
                  onClick={() => handleDecision("approved")}
                >
                  <CheckCircle2 size={15} />
                  Approve task
                </button>

                <button
                  type="button"
                  className="moderator-decision-button moderator-decision-button--reject"
                  disabled={Boolean(decision)}
                  onClick={() => handleDecision("rejected")}
                >
                  <XCircle size={15} />
                  Reject task
                </button>
              </div>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}