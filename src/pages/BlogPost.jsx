import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import renderMathInElement from "katex/dist/contrib/auto-render";
import "katex/dist/katex.min.css";
import SiteFooter from "../components/SiteFooter.jsx";
import SiteHeader from "../components/SiteHeader.jsx";
import { blogIndex } from "../lib/blogs.js";

function BlogPost() {
  const { slug } = useParams();
  const post = blogIndex[slug];
  const metricsEndpoint = import.meta.env.VITE_METRICS_ENDPOINT;
  const [viewCount, setViewCount] = useState(null);
  const bodyRef = useRef(null);
  const [toc, setToc] = useState([]);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const workerBase = useMemo(() => {
    if (!metricsEndpoint) return null;
    return metricsEndpoint.replace(/\/api\/view$/, "");
  }, [metricsEndpoint]);

  useEffect(() => {
    if (!slug || !metricsEndpoint) return;
    const url = new URL(metricsEndpoint);
    url.searchParams.set("slug", slug);
    fetch(url.toString(), { method: "POST", keepalive: true })
      .then((response) => response.json())
      .then((data) => setViewCount(data.views))
      .catch(() => {});
  }, [slug, metricsEndpoint]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  useEffect(() => {
    if (!slug || !workerBase) return;
    const url = new URL(`${workerBase}/api/likes`);
    url.searchParams.set("slug", slug);
    fetch(url.toString())
      .then((response) => response.json())
      .then((data) => setLikes(data.likes ?? 0))
      .catch(() => {});

    const stored = localStorage.getItem(`liked:${slug}`);
    const cookieMatch = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`liked:${slug}=`));
    const cookieLiked = cookieMatch?.split("=")[1] === "true";
    setLiked(stored === "true" || cookieLiked);
  }, [slug, workerBase]);

  const handleLike = () => {
    if (!slug || !workerBase) return;
    const nextLiked = !liked;
    const endpoint = nextLiked ? "/api/like" : "/api/unlike";
    const url = new URL(`${workerBase}${endpoint}`);
    url.searchParams.set("slug", slug);

    setLiked(nextLiked);
    setLikes((prev) => Math.max(0, nextLiked ? prev + 1 : prev - 1));

    localStorage.setItem(`liked:${slug}`, nextLiked ? "true" : "false");
    document.cookie = `liked:${slug}=${nextLiked ? "true" : "false"}; max-age=31536000; path=/`;

    fetch(url.toString(), { method: "POST" })
      .then((response) => response.json())
      .then((data) => setLikes(data.likes ?? likes))
      .catch(() => {});
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  useEffect(() => {
    if (!bodyRef.current) return;
    renderMathInElement(bodyRef.current, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
        { left: "\\\\(", right: "\\\\)", display: false },
        { left: "\\\\[", right: "\\\\]", display: true },
      ],
    });
  }, [post]);

  useEffect(() => {
    if (!bodyRef.current) return;
    const headings = Array.from(
      bodyRef.current.querySelectorAll("h2, h3")
    ).map((heading) => ({
      id: heading.id,
      title: heading.textContent || "",
      level: heading.tagName.toLowerCase(),
    }));
    setToc(headings);
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-screen bg-ink text-fog">
        <SiteHeader />
        <main className="mx-auto w-full px-4 pb-24 pt-12 md:px-6 lg:px-12">
          <h1 className="text-3xl font-semibold">Post not found</h1>
          <p className="mt-4 text-fog/70">
            The post you&apos;re looking for doesn&apos;t exist yet.
          </p>
          <Link className="blog-back" to="/">
            Back to home
          </Link>
        </main>
      </div>
    );
  }

  const readTime = Math.max(1, Math.ceil((post.wordCount || 0) / 150));

  return (
    <div className="min-h-screen bg-ink text-fog">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl px-4 pb-24 pt-12 md:px-6 lg:px-10">
        <Link className="blog-back" to="/">
          ← Back to home
        </Link>
        <div className="blog-hero">
          <img src={post.cover} alt="" />
        </div>
        <h1 className="blog-title">{post.title}</h1>
        <div className="blog-meta">
          <p className="blog-date">{post.date}</p>
          <div className="blog-tags blog-tags--left">
            {post.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <div className="blog-stats">
            <span>{post.wordCount.toLocaleString()} words</span>
            <span>{readTime} min read</span>
          </div>
          {viewCount !== null && (
            <span className="blog-views">{viewCount.toLocaleString()} views</span>
          )}
        </div>
        <div className="blog-excerpt-row">
          <p className="blog-excerpt">{post.excerpt}</p>
          <div className="blog-actions">
            <button
              className={`blog-action blog-like ${liked ? "is-liked" : ""}`}
              type="button"
              onClick={handleLike}
            >
              <span className="blog-action-icon" aria-hidden="true">
                ♥
              </span>
              {liked ? "Liked" : "Like"} · {likes}
            </button>
            <div className="blog-share-menu">
              <button
                className="blog-action blog-share"
                type="button"
                onMouseEnter={() => setShareOpen(true)}
                onFocus={() => setShareOpen(true)}
                aria-expanded={shareOpen}
                aria-haspopup="true"
              >
                <span className="blog-action-icon" aria-hidden="true">
                  ↗
                </span>
                Share
              </button>
              {shareOpen && (
                <div
                  className="blog-share-panel"
                  role="menu"
                  onMouseLeave={() => setShareOpen(false)}
                  onBlur={() => setShareOpen(false)}
                >
                  <button type="button" onClick={handleCopy} role="menuitem">
                    {copied ? "Link copied" : "Copy link"}
                  </button>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                      typeof window !== "undefined" ? window.location.href : ""
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    role="menuitem"
                  >
                    Share on LinkedIn
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                      typeof window !== "undefined" ? window.location.href : ""
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    role="menuitem"
                  >
                    Share on X
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
        <article
          className="blog-body"
          dangerouslySetInnerHTML={{ __html: post.html }}
          ref={bodyRef}
        />
      </main>
      {toc.length > 0 && (
        <nav className="blog-toc" aria-label="On this page">
          <p>On this page</p>
          <ul>
            {toc.map((item) => (
              <li key={item.id} className={item.level === "h3" ? "is-sub" : ""}>
                <a href={`#${item.id}`}>{item.title}</a>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <SiteFooter />
    </div>
  );
}

export default BlogPost;
