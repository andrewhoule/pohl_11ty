import os from "node:os";
import path from "node:path";

function stripHtml(value = "") {
  return value
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeUrl(value = "") {
  return value.replace(/\/index\.html$/, "/");
}

export default function (eleventyConfig) {
  const cssReloadFile = path.join(os.tmpdir(), "pohl_11ty-css-reload.txt");

  eleventyConfig.addGlobalData("build", {
    year: new Date().getFullYear()
  });

  eleventyConfig.addPassthroughCopy({
    "assets/components": "assets/components",
    "assets/favicon.ico": "assets/favicon.ico",
    "assets/favicon.svg": "assets/favicon.svg",
    "assets/images": "assets/images",
    "assets/js": "assets/js",
    "assets/svg": "assets/svg",
    "assets/uploads": "assets/uploads",
    "dist/assets/css/app.css": "assets/css/app.css",
    "dist/assets/css/app.css.map": "assets/css/app.css.map"
  });
  eleventyConfig.addPassthroughCopy({
    "assets/favicon.ico": "favicon.ico"
  });
  eleventyConfig.addWatchTarget(cssReloadFile);

  eleventyConfig.addFilter("postDate", (value) => {
    if (!value) {
      return "";
    }
    return new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  });

  eleventyConfig.addFilter("stripHtml", stripHtml);

  eleventyConfig.addFilter("excerpt", (value, length = 180) => {
    const plain = stripHtml(value);
    if (plain.length <= length) {
      return plain;
    }
    return `${plain.slice(0, length).trimEnd()}...`;
  });

  eleventyConfig.addFilter("rewriteContent", (value = "", site = {}) => {
    return value
      .replace(/http:\/\/fonts\.googleapis\.com/gi, "https://fonts.googleapis.com")
      .replace(/http:\/\/www\.pouredouthislove\.com/gi, "")
      .replace(/https:\/\/www\.pouredouthislove\.com/gi, "")
      .replace(/http:\/\/pouredouthislove\.com/gi, "")
      .replace(/https:\/\/pouredouthislove\.com/gi, "")
      .replace(/(src|href)=["']https?:\/\/[^/"']+\/wp-content\/uploads\//gi, '$1="/assets/uploads/')
      .replace(/srcset=["']https?:\/\/[^/"']+\/wp-content\/uploads\//gi, 'srcset="/assets/uploads/')
      .replace(/, https?:\/\/[^/,"']+\/wp-content\/uploads\//gi, ', /assets/uploads/')
      .replace(/(src|href)=["']\/wp-content\/uploads\//gi, '$1="/assets/uploads/')
      .replace(/srcset=["']\/wp-content\/uploads\//gi, 'srcset="/assets/uploads/')
      .replace(/, \/wp-content\/uploads\//gi, ', /assets/uploads/');
  });

  eleventyConfig.addFilter("topCategory", (post) => {
    if (!post || !Array.isArray(post.categories) || post.categories.length === 0) {
      return null;
    }
    return post.displayCategory || post.categories[0];
  });

  eleventyConfig.addFilter("postsInCategory", (posts = [], categorySlug) =>
    posts.filter((post) => post.categories.some((category) => category.slug === categorySlug))
  );

  eleventyConfig.addFilter("findBySlug", (items = [], slug) =>
    items.find((item) => item.slug === slug)
  );

  eleventyConfig.addFilter("withDefault", (value, fallback) => value || fallback);
  eleventyConfig.addFilter("normalizeUrl", normalizeUrl);
  eleventyConfig.addFilter("json", (value) => JSON.stringify(value));

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site"
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["njk", "md"]
  };
}
