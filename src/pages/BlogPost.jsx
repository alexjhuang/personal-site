import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SiteFooter from "../components/SiteFooter.jsx";
import SiteHeader from "../components/SiteHeader.jsx";
import { blogIndex } from "../lib/blogs.js";

function BlogPost() {
  const { slug } = useParams();
  const post = blogIndex[slug];
  const metricsEndpoint = import.meta.env.VITE_METRICS_ENDPOINT;
  const [viewCount, setViewCount] = useState(null);

  useEffect(() => {
    if (!slug || !metricsEndpoint) return;
    const url = new URL(metricsEndpoint);
    url.searchParams.set("slug", slug);
    fetch(url.toString(), { method: "POST", keepalive: true })
      .then((response) => response.json())
      .then((data) => setViewCount(data.views))
      .catch(() => {});
  }, [slug, metricsEndpoint]);

  if (!post) {
    return (
      <div className="min-h-screen bg-ink text-fog">
        <SiteHeader />
        <main className="mx-auto w-full max-w-4xl px-8 pb-24 pt-12">
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

  return (
    <div className="min-h-screen bg-ink text-fog">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl px-8 pb-24 pt-12">
        <Link className="blog-back" to="/">
          ← Back to home
        </Link>
        <div className="blog-hero">
          <img src={post.cover} alt="" />
        </div>
        <div className="blog-meta">
          <p className="blog-date">{post.date}</p>
          <div className="blog-tags">
            {post.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
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
        />
      </main>
      <SiteFooter />
    </div>
  );
}

export default BlogPost;
