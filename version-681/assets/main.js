(function () {
  const menuButton = document.querySelector("[data-menu-button]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  const hero = document.querySelector("[data-hero]");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    let current = 0;
    let timer = null;

    const show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        const active = itemIndex === current;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", active ? "false" : "true");
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === current);
      });
    };

    const start = function () {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    };

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        const index = Number(dot.getAttribute("data-hero-dot"));
        show(index);
        start();
      });
    });

    start();
  }

  const filterForm = document.querySelector("[data-filter-form]");

  if (filterForm) {
    const cards = Array.from(document.querySelectorAll("[data-film-card]"));

    const applyFilters = function () {
      const formData = new FormData(filterForm);
      const year = String(formData.get("year") || "").trim();
      const region = String(formData.get("region") || "").trim();
      const type = String(formData.get("type") || "").trim();
      const keyword = String(formData.get("keyword") || "").trim().toLowerCase();

      cards.forEach(function (card) {
        const text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre")
        ].join(" ").toLowerCase();

        const matched = (!year || card.getAttribute("data-year") === year) &&
          (!region || card.getAttribute("data-region") === region) &&
          (!type || card.getAttribute("data-type") === type) &&
          (!keyword || text.indexOf(keyword) > -1);

        card.style.display = matched ? "" : "none";
      });
    };

    filterForm.addEventListener("input", applyFilters);
    filterForm.addEventListener("change", applyFilters);
  }

  const searchRoot = document.querySelector("[data-search-root]");
  const searchForm = document.querySelector("[data-site-search]");
  const searchResults = document.querySelector("[data-search-results]");

  if (searchRoot && searchForm && searchResults && Array.isArray(window.filmCatalog)) {
    const input = searchForm.querySelector("input[name='q']");
    const params = new URLSearchParams(window.location.search);
    const initial = params.get("q") || "";

    if (input) {
      input.value = initial;
    }

    const renderCard = function (movie) {
      const tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");

      return "<article class=\"movie-card\" data-film-card>" +
        "<a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"观看" + escapeHtml(movie.title) + "\">" +
        "<img src=\"./" + escapeHtml(movie.cover) + ".jpg\" alt=\"" + escapeHtml(movie.title) + "海报\" loading=\"lazy\">" +
        "<span class=\"type-badge\">" + escapeHtml(movie.type) + "</span>" +
        "</a>" +
        "<div class=\"movie-card-body\">" +
        "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
        "<p>" + escapeHtml(movie.desc) + "</p>" +
        "<div class=\"card-tags\">" + tags + "</div>" +
        "<div class=\"card-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><strong>评分 " + escapeHtml(movie.rating) + "</strong></div>" +
        "</div>" +
        "</article>";
    };

    const render = function (keyword) {
      const value = String(keyword || "").trim().toLowerCase();
      const source = window.filmCatalog;
      let results = source;

      if (value) {
        results = source.filter(function (movie) {
          const haystack = [
            movie.title,
            movie.year,
            movie.region,
            movie.type,
            movie.genre,
            movie.desc,
            (movie.tags || []).join(" ")
          ].join(" ").toLowerCase();
          return haystack.indexOf(value) > -1;
        });
      }

      searchResults.innerHTML = results.slice(0, 96).map(renderCard).join("");
    };

    searchForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const value = input ? input.value : "";
      const url = new URL(window.location.href);
      if (value.trim()) {
        url.searchParams.set("q", value.trim());
      } else {
        url.searchParams.delete("q");
      }
      window.history.replaceState({}, "", url.toString());
      render(value);
    });

    render(initial);
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
