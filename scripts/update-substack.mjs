import fs from "node:fs";

const SITE = "https://alexjhuang.substack.com";
const OUT = "public/substack.json";
// Substack's edge 403s bare bot user agents from some hosting ranges.
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
  Accept: "application/json, application/rss+xml;q=0.9, */*;q=0.8",
};

const decode = (s) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');

async function fromApi() {
  const res = await fetch(`${SITE}/api/v1/posts?limit=50`, { headers: HEADERS });
  if (!res.ok) throw new Error(`api ${res.status}`);
  const data = await res.json();
  return (Array.isArray(data) ? data : data.posts)
    .filter((p) => p.is_published !== false)
    .map((p) => ({
      title: p.title,
      description: p.subtitle ?? "",
      link: p.canonical_url,
      date: p.post_date.slice(0, 10),
      cover: p.cover_image ?? "",
    }));
}

async function fromRss() {
  const res = await fetch(`${SITE}/feed`, { headers: HEADERS });
  if (!res.ok) throw new Error(`rss ${res.status}`);
  const xml = await res.text();
  // ponytail: regex over Substack's fixed RSS shape; the API path above is primary.
  const tag = (block, name) => {
    const m = block.match(
      new RegExp(`<${name}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${name}>`)
    );
    return m ? decode(m[1].trim()) : "";
  };
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, item]) => ({
    title: tag(item, "title"),
    description: tag(item, "description"),
    link: tag(item, "link"),
    date: new Date(tag(item, "pubDate")).toISOString().slice(0, 10),
    cover: item.match(/<enclosure url="([^"]+)"/)?.[1] ?? "",
  }));
}

let posts;
try {
  posts = await fromApi();
} catch (apiErr) {
  console.warn(`API failed (${apiErr.message}); trying RSS`);
  posts = await fromRss();
}

if (posts.length === 0) throw new Error("Parsed zero posts; feed shape changed?");
fs.writeFileSync(OUT, JSON.stringify(posts, null, 2) + "\n");
console.log(`Wrote ${posts.length} posts to ${OUT}`);
