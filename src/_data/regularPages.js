import loadPages from "./pages.js";

export default function () {
  return loadPages().filter((page) => page.template === "default");
}
