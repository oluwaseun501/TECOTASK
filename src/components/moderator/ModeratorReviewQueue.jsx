import { useMemo, useState } from "react";
import {
  ChevronRight,
  Clock3,
  FileCheck2,
  Filter,
  Flag,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  getModeratorDecisions,
  moderatorReviews,
} from "./moderatorReviewData";

import "../../styles/ModeratorReviewQueue.css";

function QueueStatus({ decision }) {
  if (decision === "approved") {
    return (
      <span className="moderator-queue-status moderator-queue-status--approved">
        Approved
      </span>
    );
  }

  if (decision === "rejected") {
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

function PriorityBadge({ priority }) {
  return (
    <span
      className={`moderator-priority moderator-priority--${priority.toLowerCase()}`}
    >
      {priority}
    </span>
  );
}

export default function ModeratorReviewQueue() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [decisions] = useState(() => getModeratorDecisions());

  const filteredReviews = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();

    return moderatorReviews.filter((review) => {
      const matchesSearch =
        !normalizedSearch ||
        review.earnerName.toLowerCase().includes(normalizedSearch) ||
        review.taskTitle.toLowerCase().includes(normalizedSearch) ||
        review.category.toLowerCase().includes(normalizedSearch);

      const matchesFilter =
        filter === "All" || review.priority === filter;

      return matchesSearch && matchesFilter;
    });
  }, [filter, search]);

  const pendingCount = moderatorReviews.filter(
    (review) => !decisions[review.id]
  ).length;

  const highPriorityCount = moderatorReviews.filter(
    (review) =>
      review.priority === "High" && !decisions[review.id]
  ).length;

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
              <strong>{pendingCount}</strong>
              <span>Pending reviews</span>
            </div>

            <div>
              <strong>{highPriorityCount}</strong>
              <span>High priority</span>
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

            {["All", "High", "Normal"].map((item) => (
              <button
                type="button"
                key={item}
                className={
                  filter === item
                    ? "moderator-review-filter moderator-review-filter--active"
                    : "moderator-review-filter"
                }
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        <section className="moderator-review-list">
          <div className="moderator-review-list__heading">
            <div>
              <h2>Pending proofs</h2>
              <p>
                Select a submission to inspect the proof and task details.
              </p>
            </div>

            <span>
              <Flag size={14} />
              {filteredReviews.length} results
            </span>
          </div>

          <div className="moderator-review-list__table">
            {filteredReviews.map((review) => (
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
                    <span>{review.category}</span>
                  </div>
                </div>

                <div className="moderator-review-list__task">
                  <strong>{review.taskTitle}</strong>
                  <span>
                    {review.advertiser} · Submitted {review.submittedAt}
                  </span>
                </div>

                <div className="moderator-review-list__time">
                  <Clock3 size={13} />
                  {review.submittedAt}
                </div>

                <PriorityBadge priority={review.priority} />

                <QueueStatus decision={decisions[review.id]} />

                <Link
                  to={`/moderator/reviews/${review.id}`}
                  className="moderator-review-list__details"
                >
                  View details
                  <ChevronRight size={14} />
                </Link>
              </article>
            ))}

            {filteredReviews.length === 0 ? (
              <div className="moderator-review-list__empty">
                <FileCheck2 size={24} />
                <strong>No reviews found</strong>
                <span>Try another search or filter.</span>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}