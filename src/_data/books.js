import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const booksDir = path.join(process.cwd(), "src", "_data", "books");

export default function () {
  if (!fs.existsSync(booksDir)) {
    return [];
  }

  return fs
    .readdirSync(booksDir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const fullPath = path.join(booksDir, file);
      const parsed = matter(fs.readFileSync(fullPath, "utf8"));
      return {
        ...parsed.data,
        description: parsed.content.trim()
      };
    })
    .sort((a, b) => (a.displayOrder ?? 9999) - (b.displayOrder ?? 9999));
}
