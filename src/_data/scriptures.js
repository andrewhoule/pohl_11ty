import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const scriptureDir = path.join(process.cwd(), "src", "_data", "scripture");

export default function () {
  if (!fs.existsSync(scriptureDir)) {
    return [];
  }

  return fs
    .readdirSync(scriptureDir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const fullPath = path.join(scriptureDir, file);
      const parsed = matter(fs.readFileSync(fullPath, "utf8"));
      return {
        ...parsed.data,
        scripture: parsed.content.trim()
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}
