(function () {
  var resultContainer = document.querySelector("[data-search-results]");
  var status = document.querySelector("[data-search-status]");
  var pageForm = document.querySelector("[data-search-page-form]");
  var pageInput = document.querySelector("[data-search-input]");

  if (!resultContainer || !status || !pageForm || !pageInput) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get("q") || "";
  pageInput.value = initialQuery;

  pageForm.addEventListener("submit", function (event) {
    var query = pageInput.value.trim();
    if (!query) {
      event.preventDefault();
      pageInput.focus();
    }
  });

  if (!initialQuery.trim()) {
    status.textContent = "Enter a search term to find posts, books, and scripture.";
    return;
  }

  function normalize(value) {
    return (value || "").toString().toLowerCase();
  }

  function escapeHtml(value) {
    return (value || "").toString().replace(/[&<>"']/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[character];
    });
  }

  function scoreResult(item, terms) {
    var title = normalize(item.title);
    var meta = normalize(item.meta);
    var text = normalize(item.text);
    var score = 0;

    terms.forEach(function (term) {
      if (title === term) {
        score += 50;
      }
      if (title.indexOf(term) !== -1) {
        score += 20;
      }
      if (meta.indexOf(term) !== -1) {
        score += 10;
      }
      if (text.indexOf(term) !== -1) {
        score += 3;
      }
    });

    return score;
  }

  function renderResults(items, query) {
    var terms = normalize(query).split(/\s+/).filter(Boolean);
    var results = items
      .map(function (item) {
        return Object.assign({}, item, { score: scoreResult(item, terms) });
      })
      .filter(function (item) {
        return item.score > 0;
      })
      .sort(function (a, b) {
        return b.score - a.score || a.title.localeCompare(b.title);
      });

    if (!results.length) {
      status.textContent = 'No results for "' + query + '".';
      resultContainer.innerHTML = "";
      return;
    }

    status.textContent = results.length + ' result' + (results.length === 1 ? "" : "s") + ' for "' + query + '".';
    resultContainer.innerHTML = results.slice(0, 60).map(function (item) {
      var image = item.image || "/assets/images/default.jpg";
      var category = item.categoryName
        ? '<a href="' + escapeHtml(item.categoryUrl || item.url) + '">' + escapeHtml(item.categoryName) + '</a>'
        : escapeHtml(item.type);

      return [
        '<article class="blog-excerpt-wrap">',
        '<div class="blog-excerpt">',
        '<div class="blog-excerpt-img">',
        '<a href="' + escapeHtml(item.url) + '">',
        '<img src="' + escapeHtml(image) + '" alt="' + escapeHtml(item.title) + '">',
        '</a>',
        '</div>',
        '<div class="blog-excerpt-details">',
        '<h3 class="title"><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>',
        '<div class="meta">By <span class="author">' + escapeHtml(item.author || item.type) + '</span> on <span class="category">' + category + '</span></div>',
        '<div class="excerpt">' + escapeHtml(item.excerpt || "") + '</div>',
        '</div>',
        '</div>',
        '</article>'
      ].join("");
    }).join("");
  }

  status.textContent = "Searching...";

  fetch("/search-index.json")
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Search index failed to load.");
      }
      return response.json();
    })
    .then(function (items) {
      renderResults(items, initialQuery.trim());
    })
    .catch(function () {
      status.textContent = "Search is temporarily unavailable.";
    });
}());
