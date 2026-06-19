import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const postsDir = path.join(process.cwd(), "src", "_data", "posts");

export default function () {
  if (!fs.existsSync(postsDir)) {
    return [];
  }

  return fs
    .readdirSync(postsDir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const fullPath = path.join(postsDir, file);
      const parsed = matter(fs.readFileSync(fullPath, "utf8"));
      return {
        ...parsed.data,
        content: parsed.content.trim()
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
