import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Copy, ExternalLink, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../services/auth.js";
import "./AdminMarketplacePosts.css";

const PAGE_SIZE = 20;
const PUBLIC_SITE_ORIGIN = "https://www.tecotask.com";
const SEARCH_CONSOLE_INSPECTION_URL =
  "https://search.google.com/search-console?action=inspect";

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

export default function AdminMarketplacePosts() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busyPostId, setBusyPostId] = useState("");
  const [rejectingPostId, setRejectingPostId] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [publishedUrl, setPublishedUrl] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  const loadQueue = useCallback(async () => {
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
      );
      setPosts(data.posts || []);
      setPagination(data.pagination || null);
    } catch (requestError) {
      setError(requestError.message || "Could not load the review queue.");
    } finally {
      setLoading(false);
    }
  }, [navigate, page]);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  async function copyPublishedUrl() {
    if (!publishedUrl) return;

    try {
      if (!navigator.clipboard?.writeText) {
        setCopyStatus(
          "Clipboard access is unavailable. Select the URL and copy it manually.",
        );
        return;
      }

      await navigator.clipboard.writeText(publishedUrl);
      setCopyStatus("URL copied.");
    } catch {
      setCopyStatus(
        "Could not copy automatically. Select the URL and copy it manually.",
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
      const slug = result.post?.slug || post.slug;

      if (slug) {
        setPublishedUrl(
          new URL(
            "/marketplace/" + encodeURIComponent(slug),
            PUBLIC_SITE_ORIGIN,
          ).href,
        );
      }

      setNotice(result.message || "Post approved and published.");
      setRejectingPostId("");
      await loadQueue();
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
      await loadQueue();
    } catch (requestError) {
      setError(requestError.message || "Could not reject this post.");
    } finally {
      setBusyPostId("");
    }
  }

  return (
    <section className="admin-marketplace">
      <header className="admin-marketplace__header">
        <div>
          <span className="admin-marketplace__eyebrow">CONTENT REVIEW</span>
          <h1>Marketplace posts</h1>
          <p>
            Review paid posts before they appear in the public Marketplace.
          </p>
        </div>

        <button
          type="button"
          className="admin-marketplace__refresh"
          onClick={() => void loadQueue()}
          disabled={loading}
        >
          {loading ? "Refreshing…" : "Refresh queue"}
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
              <label htmlFor="published-marketplace-url">Public post URL</label>

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
                  onClick={() => void copyPublishedUrl()}
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

      <div className="admin-marketplace__summary">
        <strong>{pagination?.total ?? posts.length}</strong>
        <span>post(s) awaiting review</span>
      </div>

      {loading ? (
        <div className="admin-marketplace__empty" role="status">
          Loading review queue…
        </div>
      ) : posts.length === 0 ? (
        <div className="admin-marketplace__empty">
          <span className="admin-marketplace__empty-icon">
            <Check size={20} />
          </span>
          <h2>Queue is clear</h2>
          <p>There are no paid Marketplace posts awaiting review.</p>
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
            const busy = busyPostId === postId;

            return (
              <article className="admin-marketplace__card" key={postId}>
                <div className="admin-marketplace__card-header">
                  <div>
                    <span className="admin-marketplace__status">
                      Paid · Awaiting review
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
                            alt={image.altText || `${post.title} image ${index + 1}`}
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
                        ? ` · ${socialProfile.handle.startsWith("@") ? "" : "@"}${socialProfile.handle}`
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
                </div>

                {post.hashtags?.length > 0 && (
                  <div className="admin-marketplace__tags">
                    {post.hashtags.map((tag) => (
                      <span key={tag}>#{tag}</span>
                    ))}
                  </div>
                )}

                {rejectingPostId === postId ? (
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
                      onChange={(event) => setRejectionReason(event.target.value)}
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
                      onClick={() => void handleApprove(post)}
                    >
                      <Check size={15} />
                      {busy ? "Approving…" : "Approve and publish"}
                    </button>
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
          aria-label="Review queue pages"
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
    </section>
  );
}