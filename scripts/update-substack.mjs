import fs from "node:fs";

const FEED = "https://alexjhuang.substack.com/feed";
const OUT = "public/substack.json";

const response = await fetch(FEED);
if (!response.ok) throw new Error(`Failed to fetch feed: ${response.status}`);
const xml = await response.text();

// ponytail: regex over Substack's fixed RSS shape; swap for fast-xml-parser if the feed ever changes format
const tag = (block, name) => {
  const m = block.match(new RegExp(`<${name}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${name}>`));
  return m ? decode(m[1].trim()) : "";
};
const decode = (s) =>
  s.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n))
   .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');

const posts = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, item]) => ({
  title: tag(item, "title"),
  description: tag(item, "description"),
  link: tag(item, "link"),
  date: new Date(tag(item, "pubDate")).toISOString().slice(0, 10),
  cover: item.match(/<enclosure url="([^"]+)"/)?.[1] ?? "",
}));

if (posts.length === 0) throw new Error("Parsed zero posts; feed shape changed?");
fs.writeFileSync(OUT, JSON.stringify(posts, null, 2) + "\n");
console.log(`Wrote ${posts.length} posts to ${OUT}`);
