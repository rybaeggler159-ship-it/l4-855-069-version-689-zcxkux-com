(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }

        document.addEventListener("DOMContentLoaded", fn);
    }

    function setupMenu() {
        var toggle = document.querySelector(".nav-toggle");
        var nav = document.querySelector(".site-nav");
        var search = document.querySelector(".nav-search");

        if (!toggle || !nav || !search) {
            return;
        }

        toggle.addEventListener("click", function () {
            nav.classList.toggle("open");
            search.classList.toggle("open");
        });
    }

    function setupHero() {
        var slider = document.querySelector(".hero-slider");
        if (!slider) {
            return;
        }

        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
        var index = 0;

        if (slides.length < 2) {
            return;
        }

        function show(next) {
            index = (next + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
            });
        });

        window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function setupListingFilter() {
        var filters = document.querySelector(".page-filter");
        var grid = document.querySelector("[data-listing-grid]");

        if (!filters || !grid) {
            return;
        }

        var input = filters.querySelector("input");
        var select = filters.querySelector("select");
        var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

        function normalize(value) {
            return (value || "").toString().toLowerCase().trim();
        }

        function apply() {
            var keyword = normalize(input ? input.value : "");
            var year = normalize(select ? select.value : "");

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-tags"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year")
                ].join(" "));

                var cardYear = normalize(card.getAttribute("data-year"));
                var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchedYear = !year || cardYear === year;

                card.style.display = matchedKeyword && matchedYear ? "" : "none";
            });
        }

        if (input) {
            input.addEventListener("input", apply);
        }

        if (select) {
            select.addEventListener("change", apply);
        }

        apply();
    }

    function setupSearchPage() {
        var container = document.querySelector("[data-search-results]");
        var form = document.querySelector("[data-search-form]");
        var input = document.querySelector("[data-search-input]");

        if (!container || !form || !input || !window.SEARCH_MOVIES) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        input.value = initial;

        function normalize(value) {
            return (value || "").toString().toLowerCase().trim();
        }

        function render(query) {
            var q = normalize(query);
            var data = window.SEARCH_MOVIES;
            var results = q
                ? data.filter(function (item) {
                    return normalize([
                        item.title,
                        item.year,
                        item.region,
                        item.type,
                        item.genre,
                        item.tags,
                        item.category
                    ].join(" ")).indexOf(q) !== -1;
                })
                : data.slice(0, 48);

            results = results.slice(0, 160);

            if (!results.length) {
                container.innerHTML = '<div class="empty-state">没有找到匹配内容，可以更换关键词继续搜索。</div>';
                return;
            }

            container.innerHTML = results.map(function (item) {
                return [
                    '<article class="movie-card">',
                    '<a class="poster-link" href="' + item.file + '" aria-label="' + escapeHtml(item.title) + '">',
                    '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
                    '<span class="duration">' + escapeHtml(item.duration) + '</span>',
                    '<span class="play-badge">播放</span>',
                    '</a>',
                    '<div class="card-body">',
                    '<a class="card-title" href="' + item.file + '">' + escapeHtml(item.title) + '</a>',
                    '<p>' + escapeHtml(item.oneLine) + '</p>',
                    '<div class="meta-row">',
                    '<span>' + escapeHtml(item.year) + '</span>',
                    '<span>' + escapeHtml(item.region) + '</span>',
                    '<span>' + escapeHtml(item.category) + '</span>',
                    '</div>',
                    '<div class="tag-row"><span>' + escapeHtml(item.genre) + '</span></div>',
                    '</div>',
                    '</article>'
                ].join("");
            }).join("");
        }

        function escapeHtml(value) {
            return String(value || "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;");
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();

            var query = input.value.trim();
            var url = query ? "search.html?q=" + encodeURIComponent(query) : "search.html";
            window.history.replaceState(null, "", url);
            render(query);
        });

        input.addEventListener("input", function () {
            render(input.value);
        });

        render(initial);
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupListingFilter();
        setupSearchPage();
    });
})();
