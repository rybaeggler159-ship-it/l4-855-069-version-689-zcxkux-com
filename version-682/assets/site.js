(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMobileNav() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var nav = document.querySelector("[data-site-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHeroSlider() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle("is-active", position === index);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle("is-active", position === index);
            });
        }

        function play() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, position) {
            dot.addEventListener("click", function () {
                show(position);
                play();
            });
        });

        show(0);
        play();
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function initListingSearch() {
        var search = document.querySelector(".js-search-input");
        var year = document.querySelector(".js-year-filter");
        var type = document.querySelector(".js-type-filter");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        var empty = document.querySelector(".empty-state");
        if (!cards.length) {
            return;
        }

        function apply() {
            var keyword = normalize(search && search.value);
            var yearValue = normalize(year && year.value);
            var typeValue = normalize(type && type.value);
            var visibleCount = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-filter-text"));
                var cardYear = normalize(card.getAttribute("data-year"));
                var cardType = normalize(card.getAttribute("data-type"));
                var matched = true;

                if (keyword && text.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (yearValue && cardYear !== yearValue) {
                    matched = false;
                }
                if (typeValue && cardType !== typeValue) {
                    matched = false;
                }

                card.style.display = matched ? "" : "none";
                if (matched) {
                    visibleCount += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visibleCount === 0);
            }
        }

        [search, year, type].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });

        apply();
    }

    window.startMoviePlayer = function (source) {
        var video = document.getElementById("movieVideo");
        var cover = document.querySelector(".player-cover");
        if (!video || !source) {
            return;
        }
        var loaded = false;

        function loadAndPlay() {
            if (!loaded) {
                loaded = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else {
                    video.src = source;
                }
            }

            if (cover) {
                cover.classList.add("is-hidden");
            }

            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener("click", loadAndPlay);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                loadAndPlay();
            }
        });
    };

    ready(function () {
        initMobileNav();
        initHeroSlider();
        initListingSearch();
    });
})();
