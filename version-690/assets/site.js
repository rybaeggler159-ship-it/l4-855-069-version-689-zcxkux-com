(function () {
  var navButton = document.querySelector(".menu-toggle");
  var mainNav = document.querySelector(".main-nav");
  var navSearch = document.querySelector(".nav-search");

  if (navButton && mainNav && navSearch) {
    navButton.addEventListener("click", function () {
      mainNav.classList.toggle("is-open");
      navSearch.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        restart();
      });
    });

    show(0);
    restart();
  }

  var panel = document.querySelector("[data-filter-panel]");
  if (panel) {
    var searchInput = panel.querySelector(".filter-search");
    var selects = Array.prototype.slice.call(panel.querySelectorAll(".filter-select"));
    var reset = panel.querySelector(".filter-reset");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var empty = document.querySelector(".empty-state");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");

    if (query && searchInput) {
      searchInput.value = query;
    }

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function applyFilters() {
      var text = normalize(searchInput ? searchInput.value : "");
      var active = {};
      selects.forEach(function (select) {
        active[select.getAttribute("data-filter")] = normalize(select.value);
      });

      var visible = 0;
      cards.forEach(function (card) {
        var ok = true;
        var searchText = normalize(card.getAttribute("data-search"));
        if (text && searchText.indexOf(text) === -1) {
          ok = false;
        }
        Object.keys(active).forEach(function (key) {
          if (!active[key]) {
            return;
          }
          var cardValue = normalize(card.getAttribute("data-" + key));
          if (cardValue !== active[key]) {
            ok = false;
          }
        });
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    if (searchInput) {
      searchInput.addEventListener("input", applyFilters);
    }

    selects.forEach(function (select) {
      select.addEventListener("change", applyFilters);
    });

    if (reset) {
      reset.addEventListener("click", function () {
        if (searchInput) {
          searchInput.value = "";
        }
        selects.forEach(function (select) {
          select.value = "";
        });
        applyFilters();
      });
    }

    applyFilters();
  }

  var player = document.querySelector("[data-player]");
  if (player) {
    var video = player.querySelector("video");
    var overlay = player.querySelector(".player-overlay");
    var startButton = player.querySelector(".player-start");
    var url = player.getAttribute("data-play-url");
    var ready = false;

    function begin() {
      if (!video || !url) {
        return;
      }

      if (overlay) {
        overlay.classList.add("is-hidden");
      }

      if (ready) {
        video.play().catch(function () {});
        return;
      }

      ready = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        video.play().catch(function () {});
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new Hls({
          maxBufferLength: 30
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        return;
      }

      video.src = url;
      video.play().catch(function () {});
    }

    if (overlay) {
      overlay.addEventListener("click", begin);
    }

    if (startButton) {
      startButton.addEventListener("click", function (event) {
        event.stopPropagation();
        begin();
      });
    }

    if (video) {
      video.addEventListener("click", function () {
        if (!ready) {
          begin();
        }
      }, {
        once: true
      });
    }
  }
})();
