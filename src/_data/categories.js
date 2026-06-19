import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const categoriesDir = path.join(process.cwd(), "src", "_data", "categories");

export default function () {
  if (!fs.existsSync(categoriesDir)) {
    return [];
  }

  return fs
    .readdirSync(categoriesDir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const fullPath = path.join(categoriesDir, file);
      const parsed = matter(fs.readFileSync(fullPath, "utf8"));
      return {
        ...parsed.data
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}
