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
  eleventyConfig.addGlobalData("build", {
    year: new Date().getFullYear()
  });

  eleventyConfig.addPassthroughCopy({
    "assets": "assets"
  });
  eleventyConfig.addPassthroughCopy({
    "assets/favicon.ico": "favicon.ico"
  });
  eleventyConfig.addPassthroughCopy({
    "wp-content/uploads": "wp-content/uploads"
  });

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
      .replace(/(src|href)=["']https?:\/\/[^/"']+\/wp-content\/uploads\//gi, '$1="/wp-content/uploads/')
      .replace(/srcset=["']https?:\/\/[^/"']+\/wp-content\/uploads\//gi, 'srcset="/wp-content/uploads/')
      .replace(/, https?:\/\/[^/,"']+\/wp-content\/uploads\//gi, ', /wp-content/uploads/');
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
