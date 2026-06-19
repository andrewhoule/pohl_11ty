import loadPages from "./pages.js";

const templateMap = {
  "blog.php": "articles",
  "frontpage.php": "frontpage",
  "scripture.php": "scripture",
  "books.php": "bookshelf"
};

export default function () {
  const pages = loadPages();
  const specialPages = {
    articles: null,
    frontpage: null,
    scripture: null,
    bookshelf: null
  };

  for (const page of pages) {
    const key = templateMap[page.template];
    if (key) {
      specialPages[key] = page;
    }
  }

  return specialPages;
}
