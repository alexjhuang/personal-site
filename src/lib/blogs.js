import matter from "gray-matter";
import { marked } from "marked";

const blogFiles = import.meta.glob("/content/blog/*.md", {
  as: "raw",
  eager: true,
});

export const blogs = Object.entries(blogFiles)
  .map(([path, raw]) => {
    const { data, content } = matter(raw);
    const slug = data.slug || path.split("/").pop().replace(/\.md$/, "");

    return {
      slug,
      title: data.title || "Untitled",
      date: data.date || "",
      cover: data.cover || "",
      tags: data.tags || [],
      excerpt: data.excerpt || "",
      html: marked.parse(content),
    };
  })
  .sort((a, b) => new Date(b.date) - new Date(a.date));

export const blogIndex = blogs.reduce((acc, blog) => {
  acc[blog.slug] = blog;
  return acc;
}, {});
