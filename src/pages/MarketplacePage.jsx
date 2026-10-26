import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ExternalLink, Globe, Share2 } from "lucide-react";
import {
  SiFacebook,
  SiInstagram,
  SiTiktok,
  SiWhatsapp,
  SiX,
  SiYoutube,
} from "react-icons/si";

import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { authApi } from "../services/auth.js";
import "../styles/MarketplacePage.css";

const PAGE_SIZE = 12;

const SOCIAL_PLATFORM_LABELS = {
  instagram: "Instagram",
  tiktok: "TikTok",
  facebook: "Facebook",
  x: "X",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  whatsapp: "WhatsApp",
  other: "Social profile",
};

const SOCIAL_PLATFORM_ICONS = {
  instagram: SiInstagram,
  tiktok: SiTiktok,
  facebook: SiFacebook,
  x: SiX,
  youtube: SiYoutube,
  linkedin: Share2,
  whatsapp: SiWhatsapp,
  other: Share2,
};

function getSocialProfiles(post) {
  if (Array.isArray(post?.socialProfiles) && post.socialProfiles.length > 0) {
    return post.socialProfiles;
  }

  const legacyProfile = post?.socialProfile;

  return legacyProfile &&
    (legacyProfile.platform || legacyProfile.handle || legacyProfile.url)
    ? [legacyProfile]
    : [];
}

function formatHandle(value) {
  if (!value) return "";
  return value.startsWith("@") ? value : `@${value}`;
}

function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
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

function upsertMetaTag(attribute, key, content) {
  const selector = `meta[${attribute}="${key}"]`;
  let tag = document.head.querySelector(selector);

  if (!content) {
    tag?.remove();
    return;
  }

  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }

  tag.setAttribute("content", content);
}

function upsertCanonical(url) {
  let tag = document.head.querySelector('link[rel="canonical"]');

  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", "canonical");
    document.head.appendChild(tag);
  }

  tag.setAttribute("href", url);
}

function absoluteUrl(value) {
  if (!value) return "";

  try {
    return new URL(value, window.location.origin).href;
  } catch {
    return "";
  }
}

function makeMetaDescription(value) {
  const cleanText = String(value || "").replace(/\s+/g, " ").trim();

  if (cleanText.length <= 160) return cleanText;

  return `${cleanText.slice(0, 157).trimEnd()}…`;
}

function MarketplaceCard({ post }) {
  const image = post.images?.[0];
  const websiteUrl = safeHttpsUrl(post.websiteUrl);
  const socialProfiles = getSocialProfiles(post);
  const postUrl = `/marketplace/${encodeURIComponent(post.slug)}`;
  const initial = String(post.title || "B").trim().charAt(0).toUpperCase() || "B";

  return (
    <article className="marketplace-card" data-reveal>
      <div className="marketplace-card__identity">
        <span className="marketplace-card__monogram" aria-hidden="true">
          {initial}
        </span>

        <div className="marketplace-card__identity-copy">
          <span className="marketplace-card__category">
            {post.category || "Business"}
          </span>

          <h2 className="marketplace-card__title">
            <Link to={postUrl}>{post.title}</Link>
          </h2>
        </div>
      </div>

      <Link
        to={postUrl}
        className="marketplace-card__image-link"
        aria-label={`Explore ${post.title}`}
      >
        {image?.url ? (
          <img
            className="marketplace-card__image"
            src={image.url}
            alt={image.altText || post.title}
            loading="lazy"
          />
        ) : (
          <div className="marketplace-card__image-placeholder">
            <span>{post.title || "TecoTask"}</span>
            <small>{post.category || "Marketplace"}</small>
          </div>
        )}
      </Link>

      <div className="marketplace-card__content">
        <p className="marketplace-card__description">{post.description}</p>

        {post.hashtags?.length > 0 && (
          <div className="marketplace-card__tags">
            {post.hashtags.slice(0, 3).map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        )}

        {(websiteUrl || socialProfiles.length > 0) && (
          <div className="marketplace-card__links" aria-label="Business links">
            {websiteUrl && (
              <a
                className="marketplace-link-chip"
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="marketplace-link-chip__mark" aria-hidden="true">
                  <Globe size={14} />
                </span>
                Website
                <ExternalLink size={12} aria-hidden="true" />
              </a>
            )}

            {socialProfiles.slice(0, 3).map((profile) => {
              const profileUrl = safeHttpsUrl(profile.url);
              const label =
                SOCIAL_PLATFORM_LABELS[profile.platform] || "Social profile";
              const Icon = SOCIAL_PLATFORM_ICONS[profile.platform] || Share2;
              const handle = formatHandle(profile.handle);
              const linkLabel = `${label}${handle ? ` ${handle}` : ""}`;

              const content = (
                <>
                  <span
                    className="marketplace-link-chip__mark"
                    aria-hidden="true"
                  >
                    <Icon size={14} />
                  </span>
                  {linkLabel}
                  {profileUrl && <ExternalLink size={12} aria-hidden="true" />}
                </>
              );

              return profileUrl ? (
                <a
                  className="marketplace-link-chip"
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={profile.platform}
                >
                  {content}
                </a>
              ) : (
                <span className="marketplace-link-chip" key={profile.platform}>
                  {content}
                </span>
              );
            })}

            {socialProfiles.length > 3 && (
              <span className="marketplace-link-chip marketplace-link-chip--more">
                +{socialProfiles.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="marketplace-card__footer">
          <span className="marketplace-card__date">
            {formatDate(post.publishedAt)}
          </span>

          <Link to={postUrl} className="marketplace-card__explore">
            Explore business
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function MarketplaceDetail({ post }) {
  const image = post.images?.[0];
  const websiteUrl = safeHttpsUrl(post.websiteUrl);
  const socialProfiles = getSocialProfiles(post);

  return (
    <section className="marketplace-detail">
      <Link
        to="/marketplace"
        className="marketplace-back-link"
        data-reveal
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Back to Marketplace
      </Link>

      <div className="marketplace-detail__grid">
        <div className="marketplace-detail__media" data-reveal>
          {image?.url ? (
            <img
              src={image.url}
              alt={image.altText || post.title}
              className="marketplace-detail__image"
            />
          ) : (
            <div className="marketplace-detail__image-placeholder">
              <span>TecoTask</span>
              <small>Marketplace</small>
            </div>
          )}
        </div>

        <div className="marketplace-detail__body" data-reveal>
          <span className="marketplace-card__category">
            {post.category || "Marketplace"}
          </span>

          <h1>{post.title}</h1>

          <p className="marketplace-detail__description">
            {post.description}
          </p>

          {post.hashtags?.length > 0 && (
            <div className="marketplace-card__tags">
              {post.hashtags.map((tag) => (
                <span key={tag}>#{tag}</span>
              ))}
            </div>
          )}

          {(websiteUrl || socialProfiles.length > 0) && (
            <div
              className="marketplace-detail__social"
              aria-label="Business links"
            >
              {websiteUrl && (
                <a
                  className="marketplace-link-chip"
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span
                    className="marketplace-link-chip__mark"
                    aria-hidden="true"
                  >
                    <Globe size={15} />
                  </span>
                  Visit website
                  <ExternalLink size={14} aria-hidden="true" />
                </a>
              )}

              {socialProfiles.map((profile) => {
                const profileUrl = safeHttpsUrl(profile.url);
                const label =
                  SOCIAL_PLATFORM_LABELS[profile.platform] || "Social profile";
                const Icon = SOCIAL_PLATFORM_ICONS[profile.platform] || Share2;
                const handle = formatHandle(profile.handle);
                const linkLabel = `${label}${handle ? ` · ${handle}` : ""}`;

                const content = (
                  <>
                    <span
                      className="marketplace-link-chip__mark"
                      aria-hidden="true"
                    >
                      <Icon size={15} />
                    </span>
                    {linkLabel}
                    {profileUrl && <ExternalLink size={14} aria-hidden="true" />}
                  </>
                );

                return profileUrl ? (
                  <a
                    className="marketplace-link-chip"
                    href={profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    key={profile.platform}
                  >
                    {content}
                  </a>
                ) : (
                  <span
                    className="marketplace-link-chip"
                    key={profile.platform}
                  >
                    {content}
                  </span>
                );
              })}
            </div>
          )}

          <p className="marketplace-detail__date">
            Published {formatDate(post.publishedAt)}
          </p>

          <Link to="/signup" className="marketplace-button">
            Join TecoTask
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function MarketplacePage() {
  const { slug } = useParams();
  const marketplaceRef = useRef(null);

  const [posts, setPosts] = useState([]);
  const [post, setPost] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadMarketplace() {
      setLoading(true);
      setError("");

      try {
        if (slug) {
          const data = await authApi.getMarketplacePost(slug);

          if (isActive) {
            setPost(data.post || null);
          }
        } else {
          const data = await authApi.getMarketplacePosts(page, PAGE_SIZE);

          if (isActive) {
            setPosts(data.posts || []);
            setPagination(data.pagination || null);
          }
        }
      } catch (requestError) {
        if (isActive) {
          setError(requestError.message || "Could not load the Marketplace.");
          setPost(null);
          setPosts([]);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    void loadMarketplace();

    return () => {
      isActive = false;
    };
  }, [slug, page, reloadKey]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    const currentPost = slug && post?.slug === slug ? post : null;

    const hiddenStatuses = [
      "draft",
      "payment_pending",
      "pending_review",
      "rejected",
    ];

    const isHiddenPost =
      currentPost && hiddenStatuses.includes(currentPost.status);

    const shouldNoindex =
      Boolean(slug) &&
      !loading &&
      (Boolean(error) || !currentPost || Boolean(isHiddenPost));

    const title = currentPost
      ? `${currentPost.title} | TecoTask Marketplace`
      : slug
        ? "Marketplace post | TecoTask"
        : "TecoTask Marketplace | Social media promotion offers";

    const socialPlatformNames = currentPost
      ? getSocialProfiles(currentPost)
          .map((profile) => SOCIAL_PLATFORM_LABELS[profile.platform])
          .filter(Boolean)
      : [];

    const postDescription = [
      currentPost?.description,
      currentPost?.category
        ? `Category: ${currentPost.category}.`
        : "",
      socialPlatformNames.length > 0
        ? `Social: ${socialPlatformNames.join(", ")}.`
        : "",
    ]
      .filter(Boolean)
      .join(" ");

    const description = makeMetaDescription(
      postDescription ||
        "Browse approved social media promotion posts on the TecoTask Marketplace.",
    );

    const canonicalSlug = currentPost?.slug || slug;
    const canonicalUrl = slug
      ? new URL(
          `/marketplace/${encodeURIComponent(canonicalSlug)}`,
          window.location.origin,
        ).href
      : new URL("/marketplace", window.location.origin).href;

    const imageUrl = absoluteUrl(currentPost?.images?.[0]?.url);

    document.title = title;

    upsertMetaTag("name", "description", description);
    upsertMetaTag(
      "name",
      "robots",
      shouldNoindex ? "noindex,follow" : "index,follow",
    );

    upsertMetaTag("property", "og:title", title);
    upsertMetaTag("property", "og:description", description);
    upsertMetaTag("property", "og:url", canonicalUrl);
    upsertMetaTag("property", "og:site_name", "TecoTask");
    upsertMetaTag(
      "property",
      "og:type",
      currentPost ? "article" : "website",
    );
    upsertMetaTag("property", "og:image", imageUrl);

    upsertMetaTag(
      "name",
      "twitter:card",
      imageUrl ? "summary_large_image" : "summary",
    );
    upsertMetaTag("name", "twitter:title", title);
    upsertMetaTag("name", "twitter:description", description);

    upsertCanonical(canonicalUrl);
  }, [slug, post, loading, error]);

  useEffect(() => {
    const root = marketplaceRef.current;

    if (typeof window === "undefined" || !root) return;

    const prefersReducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (
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

  return (
    <>
      <Navbar />

      <main ref={marketplaceRef} className="marketplace-page">
        <div className="marketplace-page__container">
          {slug ? (
            loading ? (
              <div className="marketplace-state" role="status" data-reveal>
                <span
                  className="marketplace-state__loader"
                  aria-hidden="true"
                />
               <h1>Discover businesses worth sharing</h1>

<p>
  Explore brands, products, and services featured by the TecoTask community.
</p>
              </div>
            ) : error || !post ? (
              <div
                className="marketplace-state marketplace-state--error"
                role="alert"
                data-reveal
              >
                <h1>Post unavailable</h1>
                <p>{error || "This Marketplace post could not be found."}</p>
                <Link to="/marketplace" className="marketplace-button">
                  Browse Marketplace
                </Link>
              </div>
            ) : (
              <MarketplaceDetail post={post} />
            )
          ) : (
            <>
              <header className="marketplace-page__header" data-reveal>
                <div>
                  <span className="marketplace-eyebrow">
                    TecoTask Marketplace
                  </span>

                  <h1>Discover products worth sharing</h1>

                  <p>
                    Explore products and businesses featured on the TecoTask
                    Marketplace, and find your next collaboration.
                  </p>
                </div>

                <Link to="/signup" className="marketplace-button">
                  Create an account
                </Link>
              </header>

              {loading ? (
                <div className="marketplace-state" role="status" data-reveal>
                  <span
                    className="marketplace-state__loader"
                    aria-hidden="true"
                  />
                  <h2>Loading Marketplace posts…</h2>
                  <p>New opportunities will be here shortly.</p>
                </div>
              ) : error ? (
                <div
                  className="marketplace-state marketplace-state--error"
                  role="alert"
                  data-reveal
                >
                  <h2>We couldn’t load the Marketplace</h2>
                  <p>{error}</p>
                  <button
                    type="button"
                    className="marketplace-button"
                    onClick={() => setReloadKey((value) => value + 1)}
                  >
                    Try again
                  </button>
                </div>
              ) : posts.length === 0 ? (
                <div className="marketplace-state" data-reveal>
                  <h2>No approved posts yet</h2>
                  <p>Check back soon for new Marketplace posts.</p>
                </div>
              ) : (
                <>
                  <section
                    className="marketplace-grid"
                    aria-label="Approved Marketplace posts"
                  >
                    {posts.map((item) => (
                      <MarketplaceCard
                        key={item.id || item.slug}
                        post={item}
                      />
                    ))}
                  </section>

                  {pagination?.totalPages > 1 && (
                    <nav
                      className="marketplace-pagination"
                      aria-label="Marketplace pages"
                      data-reveal
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setPage((value) => Math.max(1, value - 1))
                        }
                        disabled={page <= 1}
                      >
                        <ArrowLeft size={15} aria-hidden="true" />
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
                        disabled={page >= pagination.totalPages}
                      >
                        Next
                        <ArrowRight size={15} aria-hidden="true" />
                      </button>
                    </nav>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}