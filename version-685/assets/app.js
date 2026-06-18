(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function text(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function setupMenu() {
        var header = document.querySelector(".site-header");
        var button = document.querySelector(".menu-toggle");
        if (!header || !button) {
            return;
        }
        button.addEventListener("click", function () {
            header.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        if (!slides.length) {
            return;
        }
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var prev = document.querySelector(".hero-prev");
        var next = document.querySelector(".hero-next");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(parseInt(dot.getAttribute("data-hero-dot"), 10));
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        var carousel = document.querySelector(".hero-carousel");
        if (carousel) {
            carousel.addEventListener("mouseenter", stop);
            carousel.addEventListener("mouseleave", start);
        }

        start();
    }

    function setupFilters() {
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        if (!cards.length) {
            return;
        }
        var search = document.querySelector(".js-filter-search");
        var type = document.querySelector(".js-filter-type");
        var region = document.querySelector(".js-filter-region");
        var year = document.querySelector(".js-filter-year");
        var category = document.querySelector(".js-filter-category");
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        if (q && search) {
            search.value = q;
        }

        function matches(card) {
            var query = search ? text(search.value) : "";
            var typeValue = type ? text(type.value) : "";
            var regionValue = region ? text(region.value) : "";
            var yearValue = year ? text(year.value) : "";
            var categoryValue = category ? text(category.value) : "";
            var haystack = text(card.getAttribute("data-search"));
            var cardType = text(card.getAttribute("data-type"));
            var cardRegion = text(card.getAttribute("data-region"));
            var cardYear = text(card.getAttribute("data-year"));
            var cardCategory = text(card.getAttribute("data-category"));
            return (!query || haystack.indexOf(query) !== -1) &&
                (!typeValue || cardType === typeValue) &&
                (!regionValue || cardRegion === regionValue) &&
                (!yearValue || cardYear === yearValue) &&
                (!categoryValue || cardCategory === categoryValue);
        }

        function apply() {
            cards.forEach(function (card) {
                card.classList.toggle("is-hidden", !matches(card));
            });
        }

        [search, type, region, year, category].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });

        apply();
    }

    function setupPlayerScroll() {
        var links = Array.prototype.slice.call(document.querySelectorAll("[data-scroll-player]"));
        links.forEach(function (link) {
            link.addEventListener("click", function (event) {
                var shell = document.querySelector(".video-shell");
                if (shell) {
                    event.preventDefault();
                    shell.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            });
        });
    }

    window.setupPlayer = function (source) {
        var video = document.querySelector(".js-player-video");
        var cover = document.querySelector(".js-player-cover");
        var button = document.querySelector(".js-play-button");
        var attached = false;
        var hls = null;
        if (!video || !source) {
            return;
        }

        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function play() {
            attach();
            video.setAttribute("controls", "controls");
            if (cover) {
                cover.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener("click", play);
        }
        if (button) {
            button.addEventListener("click", play);
        }
        video.addEventListener("play", function () {
            if (cover) {
                cover.classList.add("is-hidden");
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayerScroll();
    });
})();
