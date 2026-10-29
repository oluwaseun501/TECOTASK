import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../services/auth.js";
import "./AdminMarketplacePosts.css";

const PAGE_SIZE = 20;
const PUBLIC_SITE_ORIGIN = "https://www.tecotask.com";
const SEARCH_CONSOLE_INSPECTION_URL =
  "https://search.google.com/search-console?action=inspect";

const TABS = [
  { status: "pending_review", label: "Pending review" },
  { status: "approved", label: "Published" },
  { status: "archived", label: "Archived" },
];

function formatPrice(amount, currency = "NGN") {
  if (amount == null) return "Not specified";

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function safeHttpsUrl(value) {
  if (!value) return "";

  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

function getMarketplacePostUrl(slug) {
  if (typeof slug !== "string" || !slug.trim()) return "";

  return new URL(
    "/marketplace/" + encodeURIComponent(slug),
    PUBLIC_SITE_ORIGIN,
  ).href;
}

function getStatusLabel(status) {
  if (status === "pending_review") return "Paid · Awaiting review";
  if (status === "approved") return "Published";
  if (status === "archived") return "Archived · Disabled";
  return status;
}

function getEmptyMessage(status) {
  if (status === "pending_review") {
    return {
      title: "No posts awaiting review",
      description: "New paid Marketplace posts will appear here.",
    };
  }

  if (status === "approved") {
    return {
      title: "No published posts",
      description: "Approved Marketplace posts will appear here.",
    };
  }

  return {
    title: "No archived posts",
    description: "Posts you disable will appear here.",
  };
}

export default function AdminMarketplacePosts() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [counts, setCounts] = useState({
    pending_review: 0,
    approved: 0,
    archived: 0,
  });
  const [status, setStatus] = useState("pending_review");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busyPostId, setBusyPostId] = useState("");
  const [rejectingPostId, setRejectingPostId] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [publishedUrl, setPublishedUrl] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [confirmation, setConfirmation] = useState(null);
const cancelConfirmationRef = useRef(null);

  const loadPosts = useCallback(async () => {
    const token = sessionStorage.getItem("tecotaskToken");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await authApi.getAdminMarketplacePosts(
        page,
        PAGE_SIZE,
        token,
        status,
      );

      setPosts(data.posts || []);
      setPagination(data.pagination || null);
      setCounts(
        data.counts || {
          pending_review: 0,
          approved: 0,
          archived: 0,
        },
      );
    } catch (requestError) {
      setError(requestError.message || "Could not load Marketplace posts.");
    } finally {
      setLoading(false);
    }
  }, [navigate, page, status]);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  useEffect(() => {
  if (!confirmation) return;

  cancelConfirmationRef.current?.focus();

  function handleConfirmationKeyDown(event) {
    if (event.key === "Escape") {
      setConfirmation(null);
    }
  }

  window.addEventListener("keydown", handleConfirmationKeyDown);

  return () => {
    window.removeEventListener("keydown", handleConfirmationKeyDown);
  };
}, [confirmation]);

  function handleTabChange(nextStatus) {
    if (nextStatus === status) return;

    setStatus(nextStatus);
    setPage(1);
    setError("");
    setNotice("");
    setPublishedUrl("");
    setCopyStatus("");
    setRejectingPostId("");
    setRejectionReason("");
  }

  async function copyUrl(url) {
    if (!url) return;

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard access is unavailable.");
      }

      await navigator.clipboard.writeText(url);
      setError("");
      setCopyStatus("URL copied.");
      setNotice(
        "Post URL copied. Request indexing only when the post is publicly available.",
      );
    } catch {
      setError(
        "Could not copy automatically. Select the displayed URL and copy it manually.",
      );
    }
  }

  async function handleApprove(post) {
    const token = sessionStorage.getItem("tecotaskToken");
    const postId = post._id || post.id;

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setBusyPostId(postId);
    setError("");
    setNotice("");
    setPublishedUrl("");
    setCopyStatus("");

    try {
      const result = await authApi.approveMarketplacePost(postId, token);
      const approvedPost = result.post || post;

      setPublishedUrl(getMarketplacePostUrl(approvedPost.slug));
      setNotice(result.message || "Post approved and published.");
      setRejectingPostId("");
      setStatus("approved");
      setPage(1);
    } catch (requestError) {
      setError(requestError.message || "Could not approve this post.");
    } finally {
      setBusyPostId("");
    }
  }

  async function handleReject(event, post) {
    event.preventDefault();

    const reason = rejectionReason.trim();
    const postId = post._id || post.id;
    const token = sessionStorage.getItem("tecotaskToken");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    if (!reason) {
      setError("Enter a rejection reason before continuing.");
      return;
    }

    if (reason.length > 1000) {
      setError("The rejection reason must be 1,000 characters or fewer.");
      return;
    }

    setBusyPostId(postId);
    setError("");
    setNotice("");
    setPublishedUrl("");
    setCopyStatus("");

    try {
      const result = await authApi.rejectMarketplacePost(
        postId,
        reason,
        token,
      );

      setNotice(result.message || "Post rejected.");
      setRejectingPostId("");
      setRejectionReason("");
      await loadPosts();
    } catch (requestError) {
      setError(requestError.message || "Could not reject this post.");
    } finally {
      setBusyPostId("");
    }
  }

  async function handleDisable(post) {
    const postId = post._id || post.id;
    const token = sessionStorage.getItem("tecotaskToken");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }


    setBusyPostId(postId);
    setError("");
    setNotice("");
    setPublishedUrl("");
    setCopyStatus("");

    try {
      const result = await authApi.archiveMarketplacePost(postId, token);

      setNotice(result.message || "Post disabled and moved to Archived.");
      setStatus("archived");
      setPage(1);
    } catch (requestError) {
      setError(requestError.message || "Could not disable this post.");
    } finally {
      setBusyPostId("");
    }
  }

  async function handleRestore(post) {
    const postId = post._id || post.id;
    const token = sessionStorage.getItem("tecotaskToken");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setBusyPostId(postId);
    setError("");
    setNotice("");
    setPublishedUrl("");
    setCopyStatus("");

    try {
      const result = await authApi.restoreMarketplacePost(postId, token);

      setNotice(result.message || "Post restored and published.");
      setPublishedUrl(getMarketplacePostUrl(post.slug));
      setStatus("approved");
      setPage(1);
    } catch (requestError) {
      setError(requestError.message || "Could not restore this post.");
    } finally {
      setBusyPostId("");
    }
  }

  async function confirmMarketplaceAction() {
  if (!confirmation) return;

  if (confirmation.type === "approve") {
    await handleApprove(confirmation.post);
  } else if (confirmation.type === "disable") {
    await handleDisable(confirmation.post);
  }

  setConfirmation(null);
}

  const emptyMessage = getEmptyMessage(status);
  const currentCount =
    counts[status] ?? pagination?.total ?? posts.length;

  return (
    <section className="admin-marketplace">
      <header className="admin-marketplace__header">
        <div>
          <span className="admin-marketplace__eyebrow">CONTENT REVIEW</span>
          <h1>Marketplace posts</h1>
          <p>
            Review submissions, manage published posts, and disable or restore
            listings.
          </p>
        </div>

        <button
          type="button"
          className="admin-marketplace__refresh"
          onClick={() => void loadPosts()}
          disabled={loading}
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </header>

      {error && (
        <div
          className="admin-marketplace__alert admin-marketplace__alert--error"
          role="alert"
        >
          {error}
        </div>
      )}

      {notice && (
        <div
          className="admin-marketplace__alert admin-marketplace__alert--success"
          role="status"
        >
          <p>{notice}</p>

          {publishedUrl && (
            <div style={{ display: "grid", gap: "0.6rem" }}>
              <label htmlFor="published-marketplace-url">
                Public post URL
              </label>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <input
                  id="published-marketplace-url"
                  type="text"
                  value={publishedUrl}
                  readOnly
                  onFocus={(event) => event.currentTarget.select()}
                  style={{ flex: "1 1 18rem", minWidth: 0 }}
                />

                <button
                  type="button"
                  className="admin-marketplace__button"
                  onClick={() => void copyUrl(publishedUrl)}
                >
                  <Copy size={15} />
                  {copyStatus === "URL copied." ? "Copied" : "Copy URL"}
                </button>

                <a
                  className="admin-marketplace__button admin-marketplace__button--quiet"
                  href={SEARCH_CONSOLE_INSPECTION_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink size={15} />
                  Open Search Console
                </a>

                <a
                  className="admin-marketplace__button admin-marketplace__button--quiet"
                  href={publishedUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  View post
                </a>
              </div>

              {copyStatus && <small aria-live="polite">{copyStatus}</small>}
              <small>
                In Search Console, select the verified site, paste the copied
                URL into URL Inspection, then choose Request indexing.
              </small>
            </div>
          )}
        </div>
      )}

      <div
        role="tablist"
        aria-label="Marketplace post status"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
          margin: "1.25rem 0",
        }}
      >
        {TABS.map((tab) => {
          const selected = status === tab.status;

          return (
            <button
              key={tab.status}
              type="button"
              role="tab"
              aria-selected={selected}
              className={`admin-marketplace__button ${
                selected
                  ? "admin-marketplace__button--approve"
                  : "admin-marketplace__button--quiet"
              }`}
              onClick={() => handleTabChange(tab.status)}
            >
              {tab.label} ({counts[tab.status] ?? 0})
            </button>
          );
        })}
      </div>

      <div className="admin-marketplace__summary">
        <strong>{currentCount}</strong>
        <span>
          {status === "pending_review"
            ? "paid post(s) awaiting review"
            : status === "approved"
              ? "published post(s)"
              : "disabled post(s)"}
        </span>
      </div>

      {loading ? (
        <div className="admin-marketplace__empty" role="status">
          Loading Marketplace posts…
        </div>
      ) : posts.length === 0 ? (
        <div className="admin-marketplace__empty">
          <span className="admin-marketplace__empty-icon">
            <Check size={20} />
          </span>
          <h2>{emptyMessage.title}</h2>
          <p>{emptyMessage.description}</p>
        </div>
      ) : (
        <div className="admin-marketplace__list">
          {posts.map((post) => {
            const postId = post._id || post.id;
            const author =
              post.author && typeof post.author === "object"
                ? post.author
                : {};
            const socialProfile = post.socialProfile || {};
            const profileUrl = safeHttpsUrl(socialProfile.url);
            const postUrl = getMarketplacePostUrl(post.slug);
            const busy = busyPostId === postId;
            const isPending = post.status === "pending_review";
            const isPublished = post.status === "approved";
            const isArchived = post.status === "archived";

            return (
              <article className="admin-marketplace__card" key={postId}>
                <div className="admin-marketplace__card-header">
                  <div>
                    <span className="admin-marketplace__status">
                      {getStatusLabel(post.status)}
                    </span>
                    <h2>{post.title}</h2>
                    <p className="admin-marketplace__category">
                      {post.category || "Uncategorized"}
                    </p>
                  </div>

                  <div className="admin-marketplace__amount">
                    {formatPrice(post.payment?.amount, post.payment?.currency)}
                  </div>
                </div>

                <p className="admin-marketplace__description">
                  {post.description}
                </p>

                {post.images?.length > 0 && (
                  <div className="admin-marketplace__images">
                    {post.images.map((image, index) => {
                      const imageUrl = safeHttpsUrl(image.url);
                      if (!imageUrl) return null;

                      return (
                        <a
                          key={image.publicId || imageUrl || index}
                          href={imageUrl}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Open post image ${index + 1}`}
                        >
                          <img
                            src={imageUrl}
                            alt={
                              image.altText ||
                              `${post.title} image ${index + 1}`
                            }
                          />
                          <span>
                            <ExternalLink size={13} />
                          </span>
                        </a>
                      );
                    })}
                  </div>
                )}

                <div className="admin-marketplace__details">
                  <div>
                    <span className="admin-marketplace__detail-label">
                      Submitted by
                    </span>
                    <strong>{author.fullName || "User"}</strong>
                    <small>{author.email || "Email unavailable"}</small>
                  </div>

                  <div>
                    <span className="admin-marketplace__detail-label">
                      Social profile
                    </span>
                    <strong>
                      {socialProfile.platform || "Not specified"}
                      {socialProfile.handle
                        ? ` · ${
                            socialProfile.handle.startsWith("@") ? "" : "@"
                          }${socialProfile.handle}`
                        : ""}
                    </strong>
                    {profileUrl && (
                      <a href={profileUrl} target="_blank" rel="noreferrer">
                        Open profile <ExternalLink size={12} />
                      </a>
                    )}
                  </div>

                  <div>
                    <span className="admin-marketplace__detail-label">
                      Submitted
                    </span>
                    <strong>{formatDate(post.submittedAt)}</strong>
                  </div>

                  {post.publishedAt && (
                    <div>
                      <span className="admin-marketplace__detail-label">
                        Published
                      </span>
                      <strong>{formatDate(post.publishedAt)}</strong>
                    </div>
                  )}

                  {post.archivedAt && (
                    <div>
                      <span className="admin-marketplace__detail-label">
                        Disabled
                      </span>
                      <strong>{formatDate(post.archivedAt)}</strong>
                    </div>
                  )}
                </div>

                {postUrl && (
                  <div
                    style={{
                      display: "grid",
                      gap: "0.6rem",
                      marginTop: "1rem",
                      padding: "0.85rem",
                      border: "1px solid #e5e7eb",
                      borderRadius: "0.75rem",
                    }}
                  >
                    <label htmlFor={`marketplace-post-url-${postId}`}>
                      {isPublished
                        ? "Public post URL"
                        : isArchived
                          ? "Post URL · currently disabled"
                          : "Post URL · available after publishing"}
                    </label>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <input
                        id={`marketplace-post-url-${postId}`}
                        type="text"
                        value={postUrl}
                        readOnly
                        onFocus={(event) => event.currentTarget.select()}
                        style={{ flex: "1 1 18rem", minWidth: 0 }}
                      />

                      <button
                        type="button"
                        className="admin-marketplace__button admin-marketplace__button--quiet"
                        disabled={busy}
                        onClick={() => void copyUrl(postUrl)}
                      >
                        <Copy size={15} />
                        Copy URL
                      </button>

                      {isPublished && (
                        <a
                          className="admin-marketplace__button admin-marketplace__button--quiet"
                          href={postUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View post
                        </a>
                      )}
                    </div>

                    <small>
                      {isPublished
                        ? "You can copy this URL and optionally request indexing in Search Console."
                        : isArchived
                          ? "This page is hidden from the public Marketplace until you restore it."
                          : "The public page becomes available after approval and publishing."}
                    </small>
                  </div>
                )}

                {post.hashtags?.length > 0 && (
                  <div className="admin-marketplace__tags">
                    {post.hashtags.map((tag) => (
                      <span key={tag}>#{tag}</span>
                    ))}
                  </div>
                )}

                {isPending && rejectingPostId === postId ? (
                  <form
                    className="admin-marketplace__reject-form"
                    onSubmit={(event) => void handleReject(event, post)}
                  >
                    <label htmlFor={`rejection-${postId}`}>
                      Rejection reason
                    </label>
                    <textarea
                      id={`rejection-${postId}`}
                      value={rejectionReason}
                      onChange={(event) =>
                        setRejectionReason(event.target.value)
                      }
                      maxLength={1000}
                      rows={3}
                      required
                      placeholder="Explain what needs to be corrected"
                    />
                    <div className="admin-marketplace__reject-actions">
                      <button
                        type="button"
                        className="admin-marketplace__button admin-marketplace__button--quiet"
                        disabled={busy}
                        onClick={() => {
                          setRejectingPostId("");
                          setRejectionReason("");
                          setError("");
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="admin-marketplace__button admin-marketplace__button--reject"
                        disabled={busy}
                      >
                        {busy ? "Rejecting…" : "Confirm rejection"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="admin-marketplace__actions">
                    {isPending && (
                      <>
                        <button
                          type="button"
                          className="admin-marketplace__button admin-marketplace__button--reject"
                          disabled={busy}
                          onClick={() => {
                            setRejectingPostId(postId);
                            setRejectionReason("");
                            setError("");
                          }}
                        >
                          <X size={15} />
                          Reject
                        </button>

                        <button
                          type="button"
                          className="admin-marketplace__button admin-marketplace__button--approve"
                          disabled={busy}
                          onClick={() => setConfirmation({ type: "approve", post })}
                        >
                          <Check size={15} />
                          {busy ? "Approving…" : "Approve and publish"}
                        </button>
                      </>
                    )}

                    {isPublished && (
                      <button
                        type="button"
                        className="admin-marketplace__button admin-marketplace__button--reject"
                        disabled={busy}
                        onClick={() => setConfirmation({ type: "disable", post })}
                      >
                        <X size={15} />
                        {busy ? "Disabling…" : "Disable post"}
                      </button>
                    )}

                    {isArchived && (
                      <button
                        type="button"
                        className="admin-marketplace__button admin-marketplace__button--approve"
                        disabled={busy}
                        onClick={() => void handleRestore(post)}
                      >
                        <Check size={15} />
                        {busy ? "Restoring…" : "Restore post"}
                      </button>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {pagination?.totalPages > 1 && (
        <nav
          className="admin-marketplace__pagination"
          aria-label="Marketplace post pages"
        >
          <button
            type="button"
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            disabled={page <= 1 || loading}
          >
            <ArrowLeft size={15} />
            Previous
          </button>

          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <button
            type="button"
            onClick={() =>
              setPage((value) =>
                Math.min(pagination.totalPages, value + 1),
              )
            }
            disabled={page >= pagination.totalPages || loading}
          >
            Next
            <ArrowRight size={15} />
          </button>
        </nav>
      )}

      {confirmation && (() => {
  const isApproval = confirmation.type === "approve";
  const confirmationPostId =
    confirmation.post._id || confirmation.post.id;
  const isBusy = busyPostId === confirmationPostId;

  return (
    <div
      className="admin-marketplace__modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isBusy) {
          setConfirmation(null);
        }
      }}
    >
      <section
        className="admin-marketplace__modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="marketplace-confirm-title"
        aria-describedby="marketplace-confirm-description"
        aria-busy={isBusy}
      >
        <div
          className={`admin-marketplace__modal-icon ${
            isApproval
              ? "admin-marketplace__modal-icon--approve"
              : "admin-marketplace__modal-icon--disable"
          }`}
        >
          {isApproval ? <Check size={20} /> : <X size={20} />}
        </div>

        <span className="admin-marketplace__modal-eyebrow">
          {isApproval ? "PUBLISH LISTING" : "LISTING STATUS"}
        </span>

        <h2 id="marketplace-confirm-title">
          {isApproval
            ? "Approve and publish this post?"
            : "Disable this post?"}
        </h2>

        <p id="marketplace-confirm-description">
          {isApproval
            ? "This post will become visible in the public Marketplace. You can disable it later from the Published tab."
            : "This post will be hidden from the public Marketplace and sitemap. You can restore it later from Archived."}
        </p>

        <div className="admin-marketplace__modal-actions">
          <button
            ref={cancelConfirmationRef}
            type="button"
            className="admin-marketplace__button admin-marketplace__button--quiet"
            disabled={isBusy}
            onClick={() => setConfirmation(null)}
          >
            Cancel
          </button>

          <button
            type="button"
            className={`admin-marketplace__button ${
              isApproval
                ? "admin-marketplace__button--approve"
                : "admin-marketplace__button--reject"
            }`}
            disabled={isBusy}
            onClick={() => void confirmMarketplaceAction()}
          >
            {isBusy
              ? isApproval
                ? "Publishing…"
                : "Disabling…"
              : isApproval
                ? "Approve and publish"
                : "Disable post"}
          </button>
        </div>
      </section>
    </div>
  );
})()}
    </section>
  );
}