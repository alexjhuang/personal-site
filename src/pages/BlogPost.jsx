import { useEffect, useRef, useState } from "react";
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
        <h1 className="blog-title">{post.title}</h1>
        <p className="blog-excerpt">{post.excerpt}</p>
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
