(function () {
    var header = document.querySelector('[data-header]');
    var nav = document.querySelector('[data-main-nav]');
    var toggle = document.querySelector('[data-nav-toggle]');

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    if (header) {
        window.addEventListener('scroll', function () {
            header.classList.toggle('is-scrolled', window.scrollY > 10);
        });
    }

    var slider = document.querySelector('[data-hero-slider]');
    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function startTimer() {
            clearInterval(timer);
            timer = setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                startTimer();
            });
        }

        startTimer();
    }

    var filterList = document.querySelector('[data-filter-list]');
    if (filterList) {
        var cards = Array.prototype.slice.call(filterList.querySelectorAll('[data-movie-card]'));
        var searchInput = document.querySelector('[data-filter-search]');
        var regionSelect = document.querySelector('[data-filter-region]');
        var typeSelect = document.querySelector('[data-filter-type]');
        var yearSelect = document.querySelector('[data-filter-year]');

        function fillSelect(select, attr) {
            if (!select) {
                return;
            }
            var values = cards.map(function (card) {
                return card.getAttribute(attr) || '';
            }).filter(Boolean).filter(function (value, pos, arr) {
                return arr.indexOf(value) === pos;
            }).sort(function (a, b) {
                return String(b).localeCompare(String(a), 'zh-Hans-CN');
            });
            values.forEach(function (value) {
                var option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
        }

        fillSelect(regionSelect, 'data-region');
        fillSelect(typeSelect, 'data-type');
        fillSelect(yearSelect, 'data-year');

        function applyFilter() {
            var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
            var region = regionSelect ? regionSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var year = yearSelect ? yearSelect.value : '';

            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || '').toLowerCase();
                var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchRegion = !region || card.getAttribute('data-region') === region;
                var matchType = !type || card.getAttribute('data-type') === type;
                var matchYear = !year || card.getAttribute('data-year') === year;
                card.classList.toggle('is-hidden', !(matchKeyword && matchRegion && matchType && matchYear));
            });
        }

        [searchInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
    }

    var player = document.querySelector('[data-player]');
    if (player) {
        var video = player.querySelector('video');
        var startButton = player.querySelector('[data-player-start]');
        var hlsInstance = null;

        function prepareVideo() {
            if (!video || video.dataset.ready === 'true') {
                return;
            }
            var url = video.getAttribute('data-src');
            if (!url) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(url);
                hlsInstance.attachMedia(video);
            } else {
                video.src = url;
            }
            video.dataset.ready = 'true';
        }

        function playVideo(event) {
            if (event) {
                event.preventDefault();
            }
            prepareVideo();
            player.classList.add('playing');
            if (video) {
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {});
                }
            }
        }

        if (startButton) {
            startButton.addEventListener('click', playVideo);
        }

        player.addEventListener('click', function (event) {
            if (!player.classList.contains('playing') || event.target === startButton) {
                playVideo(event);
            }
        });

        if (video) {
            video.addEventListener('play', function () {
                player.classList.add('playing');
            });
            video.addEventListener('error', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        }
    }
}());
