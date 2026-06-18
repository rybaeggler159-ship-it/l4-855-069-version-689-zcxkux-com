(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initializeNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initializeHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("is-active", position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("is-active", position === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });
    show(0);
    restart();
  }

  function initializeImageFallback() {
    var images = document.querySelectorAll("img");
    images.forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("image-missing");
      });
    });
  }

  function initializeCardTools() {
    var grid = document.querySelector("[data-card-grid]");
    if (!grid) {
      return;
    }
    var filter = document.querySelector("[data-card-filter]");
    var sort = document.querySelector("[data-card-sort]");
    var empty = document.querySelector("[data-empty-state]");
    var originalCards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));

    function applyFilter() {
      var query = filter ? filter.value.trim().toLowerCase() : "";
      var visibleCount = 0;
      originalCards.forEach(function (card) {
        var text = card.textContent.toLowerCase();
        var match = !query || text.indexOf(query) !== -1;
        card.style.display = match ? "" : "none";
        if (match) {
          visibleCount += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visibleCount === 0);
      }
    }

    function applySort() {
      var value = sort ? sort.value : "default";
      var cards = originalCards.slice();
      if (value !== "default") {
        cards.sort(function (a, b) {
          if (value === "year") {
            return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
          }
          return Number(b.getAttribute("data-" + value)) - Number(a.getAttribute("data-" + value));
        });
      }
      cards.forEach(function (card) {
        grid.appendChild(card);
      });
      applyFilter();
    }

    if (filter) {
      filter.addEventListener("input", applyFilter);
    }
    if (sort) {
      sort.addEventListener("change", applySort);
    }
    applySort();
  }

  ready(function () {
    initializeNavigation();
    initializeHero();
    initializeImageFallback();
    initializeCardTools();
  });
})();
