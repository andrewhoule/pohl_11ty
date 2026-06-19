import fs from "node:fs";
import path from "node:path";

const categoriesPath = path.join(process.cwd(), "src", "_data", "scripture", "categories.json");

export default function () {
  if (!fs.existsSync(categoriesPath)) {
    return [];
  }

  return JSON.parse(fs.readFileSync(categoriesPath, "utf8"));
}
