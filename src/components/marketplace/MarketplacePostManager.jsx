import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../../services/auth.js";
import "./MarketplacePostManager.css";

const MAX_IMAGES = 5;

const EMPTY_FORM = {
  title: "",
  description: "",
  category: "",
  price: "",
  hashtags: "",
  platform: "instagram",
  handle: "",
  profileUrl: "",
};

const STATUS_LABELS = {
  draft: "Draft",
  payment_pending: "Payment in progress",
  pending_review: "Awaiting admin review",
  approved: "Published",
  rejected: "Rejected",
};

function formatPrice(price, currency = "NGN") {
  if (price == null) return "Price not specified";

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export default function MarketplacePostManager({
  workspaceRole = "earner",
}) {
  const managerRef = useRef(null);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedImages, setSelectedImages] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyPostId, setBusyPostId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const roleName = workspaceRole === "advertiser" ? "Advertiser" : "Earner";

  const loadPosts = useCallback(async () => {
    const token = sessionStorage.getItem("tecotaskToken");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setLoading(true);

    try {
      const data = await authApi.getMyMarketplacePosts(token);
      setPosts(data.posts || []);
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Could not load your posts.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    const root = managerRef.current;

    if (typeof window === "undefined") return;

    const prefersReducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (
      !root ||
      prefersReducedMotion ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -24px 0px",
      },
    );

    const observeElement = (element) => {
      if (element.nodeType !== 1) return;

      if (element.matches("[data-reveal]")) {
        observer.observe(element);
      }

      element
        .querySelectorAll("[data-reveal]")
        .forEach((child) => observer.observe(child));
    };

    root.dataset.revealReady = "true";

    root.querySelectorAll("[data-reveal]").forEach((element) => {
      observer.observe(element);
    });

    const mutationObserver =
      "MutationObserver" in window
        ? new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              mutation.addedNodes.forEach(observeElement);
            });
          })
        : null;

    mutationObserver?.observe(root, {
      childList: true,
      subtree: true,
    });

    return () => {
      mutationObserver?.disconnect();
      observer.disconnect();
      root.removeAttribute("data-reveal-ready");
    };
  }, []);

  function updateForm(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleImageSelection(event) {
    const files = Array.from(event.target.files || []);
    setSelectedImages(files.slice(0, MAX_IMAGES));
    setError("");

    if (files.length > MAX_IMAGES) {
      setError(`Choose up to ${MAX_IMAGES} images for a post.`);
    }
  }

  async function handleCreatePost(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    const token = sessionStorage.getItem("tecotaskToken");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    if (selectedImages.length === 0) {
      setError("Add at least one image before creating your post.");
      return;
    }

    if (!form.platform || (!form.handle.trim() && !form.profileUrl.trim())) {
      setError("Choose a social platform and enter a handle or profile link.");
      return;
    }

    if (
      form.price &&
      (!Number.isSafeInteger(Number(form.price)) || Number(form.price) < 0)
    ) {
      setError("Enter the price as a whole number of naira.");
      return;
    }

    const details = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      price: form.price === "" ? null : Number(form.price),
      hashtags: form.hashtags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      socialProfile: {
        platform: form.platform,
        handle: form.handle.trim(),
        url: form.profileUrl.trim(),
      },
    };

    let createdPost = null;
    setSaving(true);

    try {
      const result = await authApi.createMarketplacePost(details, token);
      createdPost = result.post;

      for (const image of selectedImages) {
        await authApi.uploadMarketplacePostImage(createdPost.id, image, token);
      }

      setForm(EMPTY_FORM);
      setSelectedImages([]);
      setNotice("Draft created. Pay the posting fee to send it for admin review.");
      await loadPosts();
    } catch (requestError) {
      if (createdPost) {
        setForm(EMPTY_FORM);
        setSelectedImages([]);
        setNotice(
          "Your draft was created, but an image did not upload. Add the remaining image(s) from the draft below.",
        );
        await loadPosts();
      } else {
        setError(requestError.message || "Could not create the post.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleAddImages(post, files) {
    const selected = Array.from(files || []);
    const existingCount = post.images?.length || 0;

    if (existingCount + selected.length > MAX_IMAGES) {
      setError(`A post can have at most ${MAX_IMAGES} images.`);
      return;
    }

    const token = sessionStorage.getItem("tecotaskToken");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setError("");
    setNotice("");
    setBusyPostId(post.id);

    try {
      for (const image of selected) {
        await authApi.uploadMarketplacePostImage(post.id, image, token);
      }

      setNotice("Post images uploaded.");
      await loadPosts();
    } catch (requestError) {
      setError(requestError.message || "Could not upload the image.");
      await loadPosts();
    } finally {
      setBusyPostId("");
    }
  }

  async function handleStartPayment(post) {
    const token = sessionStorage.getItem("tecotaskToken");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    if (!post.images?.length) {
      setError("Add at least one image before submitting this post for payment.");
      return;
    }

    setError("");
    setNotice("");
    setBusyPostId(post.id);

    try {
      const result = await authApi.initializeMarketplacePostPayment(
        post.id,
        token,
      );

      if (result.payment?.provider === "wallet") {
        setNotice(
          result.message ||
            "The fee was deducted from your wallet. Your post is awaiting review.",
        );
        await loadPosts();
        setBusyPostId("");
        return;
      }

      const checkoutUrl = result.payment?.checkoutUrl;

      if (!checkoutUrl) {
        throw new Error(result.message || "Could not open payment checkout.");
      }

      window.location.assign(checkoutUrl);
    } catch (requestError) {
      setError(requestError.message || "Could not start payment.");
      await loadPosts();
      setBusyPostId("");
    }
  }

  async function handleCheckPayment(post) {
    const token = sessionStorage.getItem("tecotaskToken");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setError("");
    setNotice("");
    setBusyPostId(post.id);

    try {
      const result = await authApi.getMarketplacePostPaymentStatus(
        post.id,
        token,
      );

      setNotice(result.message || "Payment status updated.");
      await loadPosts();
    } catch (requestError) {
      setError(requestError.message || "Could not check payment status.");
      await loadPosts();
    } finally {
      setBusyPostId("");
    }
  }

  return (
    <section ref={managerRef} className="marketplace-manager">
      <header className="marketplace-manager__header" data-reveal>
        <div>
          <span className="marketplace-manager__eyebrow">
            {roleName} workspace
          </span>

          <h1>Your Marketplace posts</h1>

          <p>
            Create a post, add its image and social profile, then submit it for
            payment and review.
          </p>
        </div>

        <Link to="/marketplace" className="marketplace-manager__secondary-link">
          View public Marketplace
        </Link>
      </header>

      {error && (
        <div
          className="marketplace-manager__alert marketplace-manager__alert--error"
          role="alert"
          data-reveal
        >
          {error}
        </div>
      )}

      {notice && (
        <div
          className="marketplace-manager__alert marketplace-manager__alert--success"
          role="status"
          data-reveal
        >
          {notice}
        </div>
      )}

      <div className="marketplace-manager__grid">
        <form
          className="marketplace-manager__form"
          onSubmit={handleCreatePost}
          data-reveal
        >
          <div className="marketplace-manager__section-heading">
            <div>
              <span className="marketplace-manager__step">NEW POST</span>
              <h2>Create a Marketplace post</h2>
            </div>
          </div>

          <label className="marketplace-manager__field">
            <span>Title</span>
            <input
              name="title"
              value={form.title}
              onChange={updateForm}
              maxLength={120}
              required
              placeholder="Give your post a clear title"
            />
          </label>

          <label className="marketplace-manager__field">
            <span>Description</span>
            <textarea
              name="description"
              value={form.description}
              onChange={updateForm}
              maxLength={5000}
              rows={5}
              required
              placeholder="Describe what your post is about"
            />
          </label>

          <div className="marketplace-manager__two-columns">
            <label className="marketplace-manager__field">
              <span>Category</span>
              <input
                name="category"
                value={form.category}
                onChange={updateForm}
                maxLength={80}
                placeholder="e.g. Social media"
              />
            </label>

            <label className="marketplace-manager__field">
              <span>Price in naira (optional)</span>
              <input
                name="price"
                type="number"
                min="0"
                step="1"
                value={form.price}
                onChange={updateForm}
                placeholder="e.g. 5000"
              />
            </label>
          </div>

          <label className="marketplace-manager__field">
            <span>Hashtags (comma-separated, optional)</span>
            <input
              name="hashtags"
              value={form.hashtags}
              onChange={updateForm}
              placeholder="design, writing, social"
            />
          </label>

          <div className="marketplace-manager__two-columns">
            <label className="marketplace-manager__field">
              <span>Social platform</span>
              <select
                name="platform"
                value={form.platform}
                onChange={updateForm}
                required
              >
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="facebook">Facebook</option>
                <option value="x">X</option>
                <option value="youtube">YouTube</option>
                <option value="linkedin">LinkedIn</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="other">Other</option>
              </select>
            </label>

            <label className="marketplace-manager__field">
              <span>Handle</span>
              <input
                name="handle"
                value={form.handle}
                onChange={updateForm}
                maxLength={100}
                placeholder="@yourhandle"
              />
            </label>
          </div>

          <label className="marketplace-manager__field">
            <span>Social profile URL (optional)</span>
            <input
              name="profileUrl"
              type="url"
              value={form.profileUrl}
              onChange={updateForm}
              maxLength={500}
              placeholder="https://..."
            />
          </label>

          <label className="marketplace-manager__field">
            <span>Post images (1–5)</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelection}
            />
            <small>
              {selectedImages.length
                ? `${selectedImages.length} image(s) selected`
                : "Choose at least one image."}
            </small>
          </label>

          <button
            type="submit"
            className="marketplace-manager__primary-button"
            disabled={saving}
          >
            {saving ? "Saving post…" : "Create draft"}
          </button>

          <p className="marketplace-manager__fine-print">
            The payment fee is set by the server and will be shown in the
            checkout flow.
          </p>
        </form>

        <section className="marketplace-manager__posts" data-reveal>
          <div className="marketplace-manager__section-heading">
            <div>
              <span className="marketplace-manager__step">POST STATUS</span>
              <h2>Your posts</h2>
            </div>

            <button
              type="button"
              className="marketplace-manager__refresh"
              onClick={() => void loadPosts()}
              disabled={loading}
            >
              {loading ? "Refreshing…" : "Refresh"}
            </button>
          </div>

          {loading ? (
            <div className="marketplace-manager__empty" data-reveal>
              Loading your posts…
            </div>
          ) : posts.length === 0 ? (
            <div className="marketplace-manager__empty" data-reveal>
              Your posts will appear here after you create a draft.
            </div>
          ) : (
            <div className="marketplace-manager__post-list">
              {posts.map((post) => {
                const statusLabel =
                  STATUS_LABELS[post.status] || post.status || "Unknown status";
                const imageCount = post.images?.length || 0;
                const isBusy = busyPostId === post.id;

                return (
                  <article
                    className="marketplace-manager__post"
                    key={post.id}
                    data-reveal
                  >
                    <div className="marketplace-manager__post-top">
                      {post.images?.[0]?.url ? (
                        <img
                          src={post.images[0].url}
                          alt={post.images[0].altText || post.title}
                        />
                      ) : (
                        <div className="marketplace-manager__post-placeholder">
                          No image
                        </div>
                      )}

                      <div className="marketplace-manager__post-info">
                        <span
                          className={`marketplace-manager__status marketplace-manager__status--${post.status}`}
                        >
                          {statusLabel}
                        </span>

                        <h3>{post.title}</h3>

                        <p>
                          {post.category || "Marketplace"} ·{" "}
                          {formatPrice(post.price, post.currency)}
                        </p>

                        <small>
                          {imageCount} of {MAX_IMAGES} images
                          {post.paymentStatus
                            ? ` · Payment: ${post.paymentStatus.replaceAll("_", " ")}`
                            : ""}
                        </small>
                      </div>
                    </div>

                    {post.status === "rejected" && post.rejectionReason && (
                      <p className="marketplace-manager__rejection">
                        {post.rejectionReason}
                      </p>
                    )}

                    <div className="marketplace-manager__post-actions">
                      {post.status === "draft" && imageCount < MAX_IMAGES && (
                        <label className="marketplace-manager__upload-button">
                          {isBusy ? "Uploading…" : "Add images"}
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            disabled={isBusy}
                            onChange={(event) => {
                              const files = event.currentTarget.files;
                              void handleAddImages(post, files);
                              event.currentTarget.value = "";
                            }}
                          />
                        </label>
                      )}

                      {post.status === "draft" && (
                        <button
                          type="button"
                          className="marketplace-manager__primary-button marketplace-manager__primary-button--small"
                          disabled={isBusy || imageCount === 0}
                          onClick={() => void handleStartPayment(post)}
                        >
                          {isBusy
                            ? "Opening checkout…"
                            : "Pay & submit for review"}
                        </button>
                      )}

                      {post.status === "payment_pending" && (
                        <button
                          type="button"
                          className="marketplace-manager__secondary-button"
                          disabled={isBusy}
                          onClick={() => void handleCheckPayment(post)}
                        >
                          {isBusy ? "Checking…" : "Check payment"}
                        </button>
                      )}

                      {post.status === "approved" && post.slug && (
                        <Link
                          to={`/marketplace/${encodeURIComponent(post.slug)}`}
                          className="marketplace-manager__secondary-link"
                        >
                          View published post
                        </Link>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}