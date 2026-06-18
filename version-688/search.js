(function () {
  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function createCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<a class=\"movie-card\" href=\"" + escapeHtml(movie.url) + "\">" +
      "<div class=\"poster-frame\">" +
        "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
        "<span class=\"type-pill\">" + escapeHtml(movie.type || "剧集") + "</span>" +
        "<span class=\"year-pill\">" + escapeHtml(movie.year) + "</span>" +
        "<span class=\"play-float\">▶</span>" +
      "</div>" +
      "<div class=\"movie-info\">" +
        "<h3>" + escapeHtml(movie.title) + "</h3>" +
        "<p>" + escapeHtml(movie.oneLine) + "</p>" +
        "<div class=\"meta-row\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.category) + "</span><span>" + escapeHtml(movie.score) + "</span></div>" +
        "<div class=\"tag-row\">" + tags + "</div>" +
      "</div>" +
    "</a>";
  }

  function runSearch() {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var input = document.querySelector("[data-search-input]");
    var title = document.querySelector("[data-search-title]");
    var results = document.querySelector("[data-search-results]");
    var empty = document.querySelector("[data-search-empty]");
    if (input) {
      input.value = query;
    }
    if (!results || !window.MOVIES) {
      return;
    }
    var normalized = query.toLowerCase();
    var matched = window.MOVIES.filter(function (movie) {
      if (!normalized) {
        return movie.featured;
      }
      var haystack = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.category,
        movie.oneLine,
        (movie.tags || []).join(" ")
      ].join(" ").toLowerCase();
      return haystack.indexOf(normalized) !== -1;
    }).slice(0, 120);
    if (title) {
      title.textContent = query ? "关键词：“" + query + "”" : "热门推荐";
    }
    results.innerHTML = matched.map(createCard).join("");
    if (empty) {
      empty.classList.toggle("is-visible", matched.length === 0);
    }
    results.querySelectorAll("img").forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("image-missing");
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runSearch);
  } else {
    runSearch();
  }
})();
