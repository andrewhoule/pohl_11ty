import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const pagesDir = path.join(process.cwd(), "src", "_data", "pages");

function loadPages() {
  if (!fs.existsSync(pagesDir)) {
    return [];
  }

  return fs
    .readdirSync(pagesDir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const fullPath = path.join(pagesDir, file);
      const parsed = matter(fs.readFileSync(fullPath, "utf8"));
      return {
        ...parsed.data,
        content: parsed.content.trim()
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}

export default loadPages;
