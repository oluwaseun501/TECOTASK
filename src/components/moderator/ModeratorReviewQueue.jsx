import { useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  Clock3,
  FileCheck2,
  Filter,
  Flag,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";

import { authApi } from "../../services/auth.js";
import "../../styles/ModeratorReviewQueue.css";

const PAGE_LIMIT = 100;

function getStoredToken() {
  if (typeof window === "undefined") return "";

  return (
    window.sessionStorage.getItem("tecotaskToken") ||
    window.localStorage.getItem("tecotaskToken") ||
    ""
  );
}

function getInitials(name) {
  return (
    String(name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "EA"
  );
}

function formatTaskType(value) {
  if (!value) return "Task";

  return String(value)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
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

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} days ago`;

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(timestamp));
}

function normalizeSubmission(submission) {
  const earner = submission.earner || {};
  const task = submission.task || {};
  const campaign = submission.campaign || {};
  const earnerName =
    earner.fullName || earner.email || "Unknown earner";

  return {
    id: submission.id,
    initials: getInitials(earnerName),
    earnerName,
    earnerEmail: earner.email || "",
    taskTitle: task.title || "Untitled task",
    category: formatTaskType(task.type),
    advertiser:
      task.brand ||
      campaign.serviceName ||
      campaign.name ||
      "Not listed",
    submittedAt: submission.submittedAt || submission.createdAt,
    submittedAtLabel: formatRelativeTime(
      submission.submittedAt || submission.createdAt,
    ),
    status: submission.status || "submitted",
  };
}

function QueueStatus({ status }) {
  if (status === "approved") {
    return (
      <span className="moderator-queue-status moderator-queue-status--approved">
        Approved
      </span>
    );
  }

  if (status === "rejected") {
    return (
      <span className="moderator-queue-status moderator-queue-status--rejected">
        Rejected
      </span>
    );
  }

  return (
    <span className="moderator-queue-status moderator-queue-status--pending">
      Pending
    </span>
  );
}

function CategoryBadge({ category }) {
  return (
    <span className="moderator-review-category">
      {category}
    </span>
  );
}

export default function ModeratorReviewQueue() {
  const [token] = useState(getStoredToken);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("oldest");
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPending, setTotalPending] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadQueue() {
      if (!token) {
        setError("Your moderator session was not found. Sign in again.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const data = await authApi.getModeratorReviewQueue(
          page,
          PAGE_LIMIT,
          token,
        );

        if (!active) return;

        const submissions = Array.isArray(data.submissions)
          ? data.submissions
          : [];

        setReviews(submissions.map(normalizeSubmission));
        setTotalPending(
          Number(data.totalPending ?? data.pagination?.total ?? 0),
        );
        setTotalPages(
          Math.max(1, Number(data.pagination?.totalPages ?? 1)),
        );
      } catch (requestError) {
        if (active) {
          setError(
            requestError.message || "Could not load the review queue.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadQueue();

    return () => {
      active = false;
    };
  }, [page, token]);

  const filteredReviews = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...reviews]
      .filter((review) => {
        if (!query) return true;

        return [
          review.earnerName,
          review.earnerEmail,
          review.taskTitle,
          review.category,
          review.advertiser,
        ].some((value) => value.toLowerCase().includes(query));
      })
      .sort((a, b) => {
        const first = new Date(a.submittedAt || 0).getTime();
        const second = new Date(b.submittedAt || 0).getTime();

        return sortOrder === "newest"
          ? second - first
          : first - second;
      });
  }, [reviews, search, sortOrder]);

  return (
    <main className="moderator-review-queue">
      <div className="moderator-review-queue__inner">
        <header className="moderator-review-queue__header">
          <div>
            <span className="moderator-review-queue__eyebrow">
              Moderation
            </span>
            <h1>Review queue</h1>
            <p>
              Review task submissions from earners and decide whether
              each task should be approved or rejected.
            </p>
          </div>

          <div className="moderator-review-queue__summary">
            <div>
              <strong>{totalPending}</strong>
              <span>Pending reviews</span>
            </div>
            <div>
              <strong>{reviews.length}</strong>
              <span>Loaded on this page</span>
            </div>
          </div>
        </header>

        <section className="moderator-review-queue__toolbar">
          <label className="moderator-review-queue__search">
            <Search size={15} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search earner or task"
            />
          </label>

          <div className="moderator-review-queue__filters">
            <Filter size={14} />
            {["oldest", "newest"].map((order) => (
              <button
                type="button"
                key={order}
                aria-pressed={sortOrder === order}
                className={
                  sortOrder === order
                    ? "moderator-review-filter moderator-review-filter--active"
                    : "moderator-review-filter"
                }
                onClick={() => setSortOrder(order)}
              >
                {order === "oldest" ? "Oldest" : "Newest"}
              </button>
            ))}
          </div>
        </section>

        <section className="moderator-review-list">
          <div className="moderator-review-list__heading">
            <div>
              <h2>Pending proofs</h2>
              <p>Select a submission to inspect its proof and task details.</p>
            </div>
            <span>
              <Flag size={14} />
              {filteredReviews.length} shown · {totalPending} pending
            </span>
          </div>

          <div className="moderator-review-list__table">
            {loading ? (
              <div
  className="moderator-review-list__empty"
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
            ) : error ? (
              <div className="moderator-review-list__empty" role="alert">
                <strong>Could not load reviews</strong>
                <span>{error}</span>
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="moderator-review-list__empty">
                <FileCheck2 size={24} />
                <strong>
                  {reviews.length === 0
                    ? "No pending submissions"
                    : "No reviews found"}
                </strong>
                <span>
                  {reviews.length === 0
                    ? "New submitted proofs will appear here."
                    : "Try another search."}
                </span>
              </div>
            ) : (
              filteredReviews.map((review) => (
                <article
                  className="moderator-review-list__row"
                  key={review.id}
                >
                  <div className="moderator-review-list__earner">
                    <span className="moderator-review-list__avatar">
                      {review.initials}
                    </span>
                    <div>
                      <strong>{review.earnerName}</strong>
                      <span>
                        {review.earnerEmail || review.category}
                      </span>
                    </div>
                  </div>

                  <div className="moderator-review-list__task">
                    <strong>{review.taskTitle}</strong>
                    <span>
                      {review.advertiser} · Submitted{" "}
                      {review.submittedAtLabel}
                    </span>
                  </div>

                  <div className="moderator-review-list__time">
                    <Clock3 size={13} />
                    {review.submittedAtLabel}
                  </div>

                  <CategoryBadge category={review.category} />
                  <QueueStatus status={review.status} />

                  <Link
                    to={`/moderator/reviews/${review.id}`}
                    className="moderator-review-list__details"
                  >
                    View details
                    <ChevronRight size={14} />
                  </Link>
                </article>
              ))
            )}
          </div>

          {!loading && totalPages > 1 ? (
            <div className="moderator-review-queue__pagination">
              <button
                type="button"
                className="moderator-review-filter"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1}
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                className="moderator-review-filter"
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                disabled={page >= totalPages}
              >
                Next
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}