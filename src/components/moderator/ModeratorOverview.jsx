import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
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

import "../../styles/ModeratorOverview.css";

const pendingReviews = [
  {
    id: "proof-1",
    initials: "CO",
    name: "Chinedu Okafor",
    task: "Follow @PayWithFin on Instagram",
    category: "Social task",
    amount: "₦10",
    submittedAt: "3 minutes ago",
    advertiser: "PayWithFin",
    proofTitle: "Instagram follow proof",
    proofDescription:
      "Screenshot shows the requested account followed successfully.",
    checklist: [
      "Action clearly visible in the screenshot",
      "Handle matches the task requirement",
      "Screenshot is uncropped and readable",
      "No duplicate or earlier submission",
    ],
  },
  {
    id: "proof-2",
    initials: "AB",
    name: "Aisha Bello",
    task: "Answer a 6-question data plan survey",
    category: "Survey",
    amount: "₦25",
    submittedAt: "8 minutes ago",
    advertiser: "SwiftTel",
    proofTitle: "Survey completion proof",
    proofDescription:
      "Confirmation screen shows all six survey questions completed.",
    checklist: [
      "All questions have been answered",
      "Confirmation screen is attached",
      "Response is relevant to the campaign",
      "No duplicate or earlier submission",
    ],
  },
  {
    id: "proof-3",
    initials: "TA",
    name: "Tunde Adeyemi",
    task: "Install the Bloom Savings app and open it",
    category: "App task",
    amount: "₦20",
    submittedAt: "14 minutes ago",
    advertiser: "Bloom Savings",
    proofTitle: "App activation proof",
    proofDescription:
      "The submitted screen shows the Bloom Savings app opened successfully.",
    checklist: [
      "Correct application is visible",
      "App has been opened successfully",
      "Submission matches the task instructions",
      "Proof is clear and readable",
    ],
  },
  {
    id: "proof-4",
    initials: "EE",
    name: "Grace Effiong",
    task: "Retweet and comment on a launch post",
    category: "Social task",
    amount: "₦15",
    submittedAt: "18 minutes ago",
    advertiser: "TecoTask Launch",
    proofTitle: "Social engagement proof",
    proofDescription:
      "The screenshot shows the post retweeted with a comment added.",
    checklist: [
      "Correct post is visible",
      "Retweet action is visible",
      "Comment is present and relevant",
      "No duplicate or earlier submission",
    ],
  },
  {
    id: "proof-5",
    initials: "BN",
    name: "Bola Nwosu",
    task: "Write a Google review for Mama Chi Kitchen",
    category: "Review task",
    amount: "₦30",
    submittedAt: "24 minutes ago",
    advertiser: "Mama Chi Kitchen",
    proofTitle: "Google review proof",
    proofDescription:
      "The submitted screenshot shows the published Google review.",
    checklist: [
      "Correct business listing is visible",
      "Review has been published",
      "Review is not copied or duplicated",
      "Screenshot is readable",
    ],
  },
];

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
    <article className={`moderator-session-card moderator-session-card--${tone}`}>
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
  decision,
  onSelect,
}) {
  return (
    <button
      type="button"
      className={`moderator-pending-row ${
        selected ? "moderator-pending-row--active" : ""
      }`}
      onClick={onSelect}
    >
      <Avatar initials={review.initials} />

      <span className="moderator-pending-row__content">
        <strong>{review.task}</strong>

        <small>
          {review.name} · {review.submittedAt}
        </small>
      </span>

      <span className="moderator-pending-row__amount">
        {decision === "approved" ? (
          <CheckCircle2 size={13} />
        ) : decision === "rejected" ? (
          <XCircle size={13} />
        ) : (
          review.amount
        )}
      </span>
    </button>
  );
}

function ReviewDetails({ review, decision, onDecision }) {
  return (
    <section className="moderator-review-panel">
      <div className="moderator-review-panel__header">
        <div>
          <span className="moderator-review-status">
            {decision ? decision : "Pending review"}
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
          <span>Reward</span>
          <strong>{review.amount}</strong>
        </div>
      </div>

      <div className="moderator-proof-section">
        <div className="moderator-proof-heading">
          <div>
            <h3>{review.proofTitle}</h3>
            <p>{review.proofDescription}</p>
          </div>

          <FileImage size={16} />
        </div>

        <div className="moderator-proof-preview">
          <FileImage size={28} />
          <strong>Submitted proof</strong>
          <span>Screenshot attached by the earner</span>
        </div>
      </div>

      <div className="moderator-checklist">
        <h3>Review checklist</h3>

        {review.checklist.map((item) => (
          <div key={item} className="moderator-checklist__item">
            <CheckCircle2 size={14} />
            <span>{item}</span>
          </div>
        ))}
      </div>

      <div className="moderator-review-actions">
        <button
          type="button"
          className="moderator-action-button moderator-action-button--approve"
          disabled={Boolean(decision)}
          onClick={() => onDecision("approved")}
        >
          <CheckCircle2 size={15} />
          Approve · earn {review.amount}
        </button>

        <button
          type="button"
          className="moderator-action-button moderator-action-button--reject"
          disabled={Boolean(decision)}
          onClick={() => onDecision("rejected")}
        >
          <XCircle size={15} />
          Reject · earn {review.amount}
        </button>

        <span>
          Decisions are final and logged against your moderator account.
        </span>
      </div>
    </section>
  );
}

function ModerationGuide() {
  return (
    <aside className="moderator-guide-panel">
      <div className="moderator-guide-panel__heading">
        <div>
          <h2>How to review</h2>
          <p>Use these checks before you approve or reject.</p>
        </div>

        <HelpCircle size={16} />
      </div>

      <div className="moderator-guide-note">
        <AlertCircle size={15} />

        <p>
          If the proof is unclear, reject the task and select the reason
          that best matches the issue.
        </p>
      </div>

      <div className="moderator-guide-section">
        <h3>Moderator instructions</h3>

        <p>
          Review each proof carefully before making a decision. Check that
          the submission matches the task instructions and that it has not
          been submitted before.
        </p>

        <p>
          A task should only be approved when the proof is clear,
          complete, and connected to the correct campaign.
        </p>
      </div>

      <div className="moderator-guide-section">
        <h3>Task context</h3>

        <div className="moderator-context-row">
          <span>Advertiser</span>
          <strong>PayWithFin</strong>
        </div>

        <div className="moderator-context-row">
          <span>Campaign</span>
          <strong>Financial awareness</strong>
        </div>

        <div className="moderator-context-row">
          <span>Review target</span>
          <strong>6 tasks</strong>
        </div>
      </div>

      <div className="moderator-guide-status">
        <ShieldCheck size={15} />
        <span>All moderation actions are monitored for quality.</span>
      </div>
    </aside>
  );
}

export default function ModeratorOverview() {
  const [selectedId, setSelectedId] = useState(pendingReviews[0].id);
  const [decisions, setDecisions] = useState({});
  const [notice, setNotice] = useState("");

  const selectedReview =
    pendingReviews.find((review) => review.id === selectedId) ||
    pendingReviews[0];

  const reviewedCount = Object.keys(decisions).length;
  const waitingCount = pendingReviews.length - reviewedCount;
  const earnedAmount = Object.entries(decisions)
    .filter(([, value]) => value === "approved")
    .reduce((total, [reviewId]) => {
      const review = pendingReviews.find((item) => item.id === reviewId);
      return total + Number(review?.amount.replace("₦", "") || 0);
    }, 0);

  const handleDecision = (decision) => {
    setDecisions((current) => ({
      ...current,
      [selectedReview.id]: decision,
    }));

    setNotice(
      decision === "approved"
        ? "Task approved successfully."
        : "Task rejected successfully."
    );

    window.setTimeout(() => {
      setNotice("");
    }, 2500);
  };

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
              onClick={() => window.location.reload()}
            >
              <RefreshCw size={15} />
            </button>

            <button
              type="button"
              className="moderator-queue-avatar"
              aria-label="Open moderator profile"
            >
              MO
            </button>
          </div>
        </header>

        <section className="moderator-session-grid">
          <SessionCard
            label="Review earnings"
            value={`₦${earnedAmount}`}
            description={
              earnedAmount > 0
                ? "Earned from approved reviews"
                : "No earnings this session"
            }
            tone="green"
            icon={FileCheck2}
          />

          <SessionCard
            label="Reviewed this session"
            value={reviewedCount}
            description={`${reviewedCount} per decision`}
            tone="blue"
            icon={CheckCircle2}
          />

          <SessionCard
            label="Waiting in queue"
            value={waitingCount}
            description="Oldest first · aim for under 30 minutes"
            tone="amber"
            icon={Clock3}
          />
        </section>

        <section className="moderator-review-workspace">
          <section className="moderator-pending-panel">
            <div className="moderator-panel-heading">
              <div>
                <h2>Pending proofs ({waitingCount})</h2>
                <p>Select a task to review.</p>
              </div>

              <span>
                <Flag size={13} />
              </span>
            </div>

            <div className="moderator-pending-list">
              {pendingReviews.map((review) => (
                <PendingReviewRow
                  key={review.id}
                  review={review}
                  selected={selectedReview.id === review.id}
                  decision={decisions[review.id]}
                  onSelect={() => setSelectedId(review.id)}
                />
              ))}
            </div>
          </section>

          <ReviewDetails
            review={selectedReview}
            decision={decisions[selectedReview.id]}
            onDecision={handleDecision}
          />

          <ModerationGuide />
        </section>

        {notice ? (
          <div className="moderator-toast">
            <CheckCircle2 size={15} />
            {notice}
          </div>
        ) : null}
      </div>
    </main>
  );
}