import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Share2 } from "lucide-react";
import {
  SiFacebook,
  SiInstagram,
  SiTiktok,
  SiWhatsapp,
  SiX,
  SiYoutube,
} from "react-icons/si";
import { authApi } from "../../services/auth.js";
import "./MarketplacePostManager.css";


const MAX_IMAGES = 5;
const MARKETPLACE_POSTING_FEE = 1000;

const EMPTY_FORM = {
  title: "",
  description: "",
  category: "",
  hashtags: "",
  websiteUrl: "",
  socialProfiles: {},
};

const SOCIAL_PLATFORMS = [
  { id: "instagram", label: "Instagram", Icon: SiInstagram },
  { id: "tiktok", label: "TikTok", Icon: SiTiktok },
  { id: "facebook", label: "Facebook", Icon: SiFacebook },
  { id: "x", label: "X", Icon: SiX },
  { id: "youtube", label: "YouTube", Icon: SiYoutube },
  { id: "linkedin", label: "LinkedIn", Icon: Share2 },
  { id: "whatsapp", label: "WhatsApp", Icon: SiWhatsapp },
  { id: "other", label: "Other", Icon: Share2 },
];

const STATUS_LABELS = {
  draft: "Draft",
  payment_pending: "Payment in progress",
  pending_review: "Awaiting admin review",
  approved: "Published",
  rejected: "Rejected",
};

export default function MarketplacePostManager({
  workspaceRole = "earner",
}) {
  const managerRef = useRef(null);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedSocials, setSelectedSocials] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyPostId, setBusyPostId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editingPostId, setEditingPostId] = useState("");

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

  function toggleSocialPlatform(platform) {
    setSelectedSocials((current) =>
      current.includes(platform)
        ? current.filter((item) => item !== platform)
        : [...current, platform],
    );
  }

  function updateSocialProfile(platform, field, value) {
    setForm((current) => ({
      ...current,
      socialProfiles: {
        ...current.socialProfiles,
        [platform]: {
          ...current.socialProfiles[platform],
          [field]: value,
        },
      },
    }));
  }

  function startEditingPost(post) {
    const profiles =
      Array.isArray(post.socialProfiles) && post.socialProfiles.length > 0
        ? post.socialProfiles
        : post.socialProfile?.platform
          ? [post.socialProfile]
          : [];

    const editableProfiles = profiles.filter((profile) =>
      SOCIAL_PLATFORMS.some((item) => item.id === profile.platform),
    );

    setForm({
      title: post.title || "",
      description: post.description || "",
      category: post.category || "",
      hashtags: Array.isArray(post.hashtags) ? post.hashtags.join(", ") : "",
      websiteUrl: post.websiteUrl || "",
      socialProfiles: editableProfiles.reduce(
        (result, profile) => ({
          ...result,
          [profile.platform]: {
            handle: profile.handle || "",
            url: profile.url || "",
          },
        }),
        {},
      ),
    });

    setSelectedSocials(editableProfiles.map((profile) => profile.platform));
    setSelectedImages([]);
    setEditingPostId(post.id);
    setError("");
    setNotice("");

    managerRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function cancelEditingPost() {
    setForm(EMPTY_FORM);
    setSelectedSocials([]);
    setSelectedImages([]);
    setEditingPostId("");
    setError("");
    setNotice("");
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

    if (!editingPostId && selectedImages.length === 0) {
      setError("Add at least one image before creating your post.");
      return;
    }

    const socialProfiles = selectedSocials
      .map((platform) => {
        const profile = form.socialProfiles[platform] || {};

        return {
          platform,
          handle: profile.handle?.trim() || "",
          url: profile.url?.trim() || "",
        };
      })
      .filter((profile) => profile.handle || profile.url);

    const details = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      websiteUrl: form.websiteUrl.trim(),
      hashtags: form.hashtags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      socialProfiles,
      socialProfile: socialProfiles[0] || null,
    };

    let createdPost = null;
    setSaving(true);

    try {
      if (editingPostId) {
        await authApi.updateMarketplacePost(editingPostId, details, token);

        setForm(EMPTY_FORM);
        setSelectedSocials([]);
        setSelectedImages([]);
        setEditingPostId("");
        setNotice("Draft updated.");
        await loadPosts();
        return;
      }

      const result = await authApi.createMarketplacePost(details, token);
      createdPost = result.post;

      for (const image of selectedImages) {
        await authApi.uploadMarketplacePostImage(createdPost.id, image, token);
      }

      setForm(EMPTY_FORM);
      setSelectedSocials([]);
      setSelectedImages([]);
      setNotice(
        "Draft created. Pay the posting fee to send it for admin review.",
      );
      await loadPosts();
    } catch (requestError) {
      if (createdPost) {
        setForm(EMPTY_FORM);
        setSelectedSocials([]);
        setSelectedImages([]);
        setNotice(
          "Your draft was created, but an image did not upload. Add the remaining image(s) from the draft below.",
        );
        await loadPosts();
      } else {
        setError(requestError.message || "Could not save the post.");
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
      setError(
        "Add at least one image before submitting this post for payment.",
      );
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

          <h1>Put your business in the spotlight</h1>

          <p>
            Help new customers discover what you offer. Create a post with
            photos, and add your website or social links if you want.
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
              <span className="marketplace-manager__step">
                {editingPostId ? "EDIT DRAFT" : "NEW POST"}
              </span>

              <h2>
                {editingPostId
                  ? "Edit your business post"
                  : "Create your business post"}
              </h2>

              <p className="marketplace-manager__section-description">
                Share what makes your product or service worth discovering.
              </p>
            </div>
          </div>

          <div className="marketplace-manager__quick-guide">
            <strong>Quick guide</strong>
            <p>
              {editingPostId
                ? "Update your details and save. Existing images will stay on your draft."
                : "Add a clear title and description, upload 1–5 photos, then create your draft. The posting fee is ₦1,000."}
            </p>
          </div>

          <label className="marketplace-manager__field">
            <span>Post title</span>
            <input
              name="title"
              value={form.title}
              onChange={updateForm}
              maxLength={120}
              required
              placeholder="e.g. Handmade skincare made with natural ingredients"
            />
          </label>

          <label className="marketplace-manager__field">
            <span>Tell customers about your business</span>
            <textarea
              name="description"
              value={form.description}
              onChange={updateForm}
              maxLength={5000}
              rows={5}
              required
              placeholder="What do you offer? What makes it special? Help customers understand why they’ll love it."
            />
          </label>

          <label className="marketplace-manager__field">
            <span>
              Category <em>(optional)</em>
            </span>
            <input
              name="category"
              value={form.category}
              onChange={updateForm}
              maxLength={80}
              placeholder="e.g. Fashion, food, beauty, home"
            />
          </label>

          <label className="marketplace-manager__field">
            <span>
              Hashtags <em>(optional)</em>
            </span>
            <input
              name="hashtags"
              value={form.hashtags}
              onChange={updateForm}
              placeholder="Add keywords separated by commas"
            />
          </label>

          <label className="marketplace-manager__field">
            <span>
              Website <em>(optional)</em>
            </span>
            <input
              name="websiteUrl"
              type="url"
              value={form.websiteUrl}
              onChange={updateForm}
              maxLength={500}
              placeholder="https://yourbusiness.com"
            />
          </label>

          <div className="marketplace-manager__social-section">
            <div className="marketplace-manager__social-heading">
              <div>
                <strong>
                  Social media <em>(optional)</em>
                </strong>
                <p>Select any platforms you’d like customers to find you on.</p>
              </div>
              <span>Optional</span>
            </div>

            <div className="marketplace-manager__social-picker">
              {SOCIAL_PLATFORMS.map((platform) => {
                const isSelected = selectedSocials.includes(platform.id);
                const Icon = platform.Icon;

                return (
                  <button
                    key={platform.id}
                    type="button"
                    className={`marketplace-manager__social-option${
                      isSelected ? " is-selected" : ""
                    }`}
                    aria-pressed={isSelected}
                    onClick={() => toggleSocialPlatform(platform.id)}
                  >
                    <span
                      className="marketplace-manager__social-mark"
                      aria-hidden="true"
                    >
                      <Icon size={16} />
                    </span>
                    <span>{platform.label}</span>
                    <span
                      className="marketplace-manager__social-check"
                      aria-hidden="true"
                    >
                      {isSelected ? "✓" : "+"}
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedSocials.length > 0 && (
              <div className="marketplace-manager__social-inputs">
                {selectedSocials.map((platformId) => {
                  const platform = SOCIAL_PLATFORMS.find(
                    (item) => item.id === platformId,
                  );
                  const Icon = platform.Icon;
                  const profile = form.socialProfiles[platformId] || {};

                  return (
                    <div
                      className="marketplace-manager__social-card"
                      key={platformId}
                    >
                      <div className="marketplace-manager__social-card-title">
                        <span
                          className="marketplace-manager__social-mark"
                          aria-hidden="true"
                        >
                          <Icon size={16} />
                        </span>
                        <strong>{platform.label}</strong>
                      </div>

                      <label className="marketplace-manager__field">
                        <span>
                          Handle <em>(optional)</em>
                        </span>
                        <input
                          value={profile.handle || ""}
                          onChange={(event) =>
                            updateSocialProfile(
                              platformId,
                              "handle",
                              event.target.value,
                            )
                          }
                          maxLength={100}
                          placeholder="@yourhandle"
                        />
                      </label>

                      <label className="marketplace-manager__field">
                        <span>
                          Profile link <em>(optional)</em>
                        </span>
                        <input
                          type="url"
                          value={profile.url || ""}
                          onChange={(event) =>
                            updateSocialProfile(
                              platformId,
                              "url",
                              event.target.value,
                            )
                          }
                          maxLength={500}
                          placeholder="https://..."
                        />
                      </label>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {!editingPostId ? (
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
          ) : (
            <p className="marketplace-manager__fine-print">
              Existing images stay attached. Use “Add images” on the draft card
              to add more.
            </p>
          )}

          <button
            type="submit"
            className="marketplace-manager__primary-button"
            disabled={saving}
          >
            {saving
              ? editingPostId
                ? "Saving changes…"
                : "Saving post…"
              : editingPostId
                ? "Save changes"
                : "Create draft"}
          </button>

          {editingPostId && (
            <button
              type="button"
              className="marketplace-manager__secondary-button"
              disabled={saving}
              onClick={cancelEditingPost}
            >
              Cancel editing
            </button>
          )}

          <p className="marketplace-manager__fine-print">
            Posting fee: ₦1,000. You’ll pay this when you submit the draft for
            review.
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
                        <p>{post.category || "Marketplace"}</p>

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

                    {post.status === "draft" && (
                      <div className="marketplace-manager__post-fee">
                        <span>Posting fee</span>
                        <strong>
                          ₦{MARKETPLACE_POSTING_FEE.toLocaleString("en-NG")}
                        </strong>
                      </div>
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
                          className="marketplace-manager__secondary-button"
                          disabled={isBusy || saving}
                          onClick={() => startEditingPost(post)}
                        >
                          Edit draft
                        </button>
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