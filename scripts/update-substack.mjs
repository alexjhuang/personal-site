import fs from "node:fs";

const SITE = "https://alexjhuang.substack.com";
// Cloudflare worker (cloudflare/worker.js) that proxies the posts API; GitHub runner IPs get 403 from Substack directly.
const PROXY =
  process.env.SUBSTACK_PROXY_URL ||
  "https://floral-water-0f68.alexjinghuang.workers.dev/api/substack";
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

async function fromApi(url) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`${url} ${res.status}`);
  const data = await res.json();
  if (Array.isArray(data) && data[0]?.link) return data; // worker already mapped it
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

const sources = [
  () => fromApi(PROXY),
  () => fromApi(`${SITE}/api/v1/posts?limit=50`),
  fromRss,
];
let posts;
for (const source of sources) {
  try {
    posts = await source();
    break;
  } catch (err) {
    console.warn(`Source failed: ${err.message}`);
  }
}
if (!posts) throw new Error("All Substack sources failed");

if (posts.length === 0) throw new Error("Parsed zero posts; feed shape changed?");
fs.writeFileSync(OUT, JSON.stringify(posts, null, 2) + "\n");
console.log(`Wrote ${posts.length} posts to ${OUT}`);
