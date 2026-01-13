import { marked } from "marked";

const renderer = new marked.Renderer();
renderer.heading = (text, level) => {
  const id = slugify(text);
  return `<h${level} id="${id}">${text}</h${level}>`;
};

marked.setOptions({
  renderer,
  mangle: false,
});

const blogFiles = import.meta.glob("/content/blog/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

export const blogs = Object.entries(blogFiles)
  .map(([path, raw]) => {
    const { data, content } = parseFrontmatter(raw);
    const slug = data.slug || path.split("/").pop().replace(/\.md$/, "");

    return {
      slug,
      title: data.title || "Untitled",
      date: data.date || "",
      cover: data.cover || "",
      tags: data.tags || [],
      excerpt: data.excerpt || "",
      html: marked.parse(content),
      wordCount: countWords(content),
    };
  })
  .sort((a, b) => new Date(b.date) - new Date(a.date));

export const blogIndex = blogs.reduce((acc, blog) => {
  acc[blog.slug] = blog;
  return acc;
}, {});

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function countWords(text) {
  return text
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean).length;
}

function parseFrontmatter(raw) {
  if (!raw.startsWith("---")) {
    return { data: {}, content: raw };
  }

  const parts = raw.split("\n");
  let index = 1;
  const data = {};
  let currentKey = null;
  let tags = [];

  for (; index < parts.length; index += 1) {
    const line = parts[index];
    if (line.trim() === "---") {
      index += 1;
      break;
    }

    if (line.trim().startsWith("- ") && currentKey === "tags") {
      tags.push(line.replace("- ", "").trim());
      continue;
    }

    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (match) {
      const key = match[1];
      const value = match[2].trim();
      currentKey = key;
      if (key === "tags") {
        tags = [];
      } else {
        data[key] = value;
      }
    }
  }

  if (tags.length) {
    data.tags = tags;
  }

  return {
    data,
    content: parts.slice(index).join("\n"),
  };
}
