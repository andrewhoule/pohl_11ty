import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const dataDir = path.join(process.cwd(), "src", "_data");

function stripHtml(value = "") {
  return value
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function excerpt(value = "", length = 180) {
  const plain = stripHtml(value);
  if (plain.length <= length) {
    return plain;
  }

  return `${plain.slice(0, length).trimEnd()}...`;
}

function readMarkdownCollection(directory, mapper) {
  const fullDir = path.join(dataDir, directory);
  if (!fs.existsSync(fullDir)) {
    return [];
  }

  return fs
    .readdirSync(fullDir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const parsed = matter(fs.readFileSync(path.join(fullDir, file), "utf8"));
      return mapper(parsed.data, parsed.content.trim());
    });
}

export default function () {
  const posts = readMarkdownCollection("posts", (data, content) => ({
    type: "Post",
    title: data.title,
    url: data.url,
    image: data.featuredImage || "",
    author: data.author || "",
    categoryName: data.displayCategory?.name || data.categories?.[0]?.name || "",
    categoryUrl: data.displayCategory?.url || data.categories?.[0]?.url || "",
    meta: [data.author, data.displayCategory?.name].filter(Boolean).join(" | "),
    excerpt: data.excerpt || excerpt(content),
    text: stripHtml([
      data.title,
      data.author,
      data.displayCategory?.name,
      ...(data.categories || []).map((category) => category.name),
      data.excerpt,
      content
    ].filter(Boolean).join(" "))
  }));

  const books = readMarkdownCollection("books", (data, content) => ({
    type: "Book",
    title: data.name,
    url: `/bookshelf/#book-${data.slug}`,
    image: data.image || "",
    author: data.author || "",
    categoryName: "Bookshelf",
    categoryUrl: "/bookshelf/",
    meta: data.author || "",
    excerpt: excerpt(content),
    text: stripHtml([data.name, data.author, content].filter(Boolean).join(" "))
  }));

  const scriptures = readMarkdownCollection("scripture", (data, content) => ({
    type: "Scripture",
    title: data.name,
    url: data.url,
    image: "",
    author: "Scripture",
    categoryName: data.categories?.[0]?.name || "Scripture",
    categoryUrl: data.categories?.[0]?.url || "/scripture/",
    meta: [data.book, data.verse].filter(Boolean).join(" "),
    excerpt: excerpt(content),
    text: stripHtml([
      data.name,
      data.book,
      data.verse,
      ...(data.categories || []).map((category) => category.name),
      content
    ].filter(Boolean).join(" "))
  }));

  return [...posts, ...books, ...scriptures];
}
