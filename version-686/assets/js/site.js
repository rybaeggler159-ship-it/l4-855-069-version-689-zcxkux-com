(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupNavigation() {
        var toggle = document.querySelector('[data-nav-toggle]');
        var nav = document.querySelector('[data-site-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        if (slides.length === 0) {
            return;
        }
        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === activeIndex);
            });
            dots.forEach(function (dot) {
                var dotIndex = Number(dot.getAttribute('data-hero-dot'));
                dot.classList.toggle('is-active', dotIndex === activeIndex);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        hero.addEventListener('mouseenter', stopTimer);
        hero.addEventListener('mouseleave', startTimer);
        showSlide(0);
        startTimer();
    }

    function normalize(text) {
        return String(text || '').toLowerCase().trim();
    }

    function setupLibraryFilters() {
        var libraries = Array.prototype.slice.call(document.querySelectorAll('[data-library]'));
        libraries.forEach(function (library) {
            var input = library.querySelector('[data-search-input]');
            var regionSelect = library.querySelector('[data-filter-region]');
            var typeSelect = library.querySelector('[data-filter-type]');
            var yearSelect = library.querySelector('[data-filter-year]');
            var cards = Array.prototype.slice.call(library.querySelectorAll('[data-movie-card]'));
            var empty = library.querySelector('[data-empty-state]');
            var tagButtons = Array.prototype.slice.call(library.querySelectorAll('[data-filter-tag]'));
            var activeTag = '';

            function applyFilters() {
                var query = normalize(input ? input.value : '');
                var region = normalize(regionSelect ? regionSelect.value : '');
                var type = normalize(typeSelect ? typeSelect.value : '');
                var year = normalize(yearSelect ? yearSelect.value : '');
                var visibleCount = 0;

                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute('data-search'));
                    var cardRegion = normalize(card.getAttribute('data-region'));
                    var cardType = normalize(card.getAttribute('data-type'));
                    var cardYear = normalize(card.getAttribute('data-year'));
                    var matchesQuery = !query || haystack.indexOf(query) !== -1;
                    var matchesTag = !activeTag || haystack.indexOf(activeTag) !== -1;
                    var matchesRegion = !region || cardRegion === region;
                    var matchesType = !type || cardType === type;
                    var matchesYear = !year || cardYear === year;
                    var shouldShow = matchesQuery && matchesTag && matchesRegion && matchesType && matchesYear;
                    card.style.display = shouldShow ? '' : 'none';
                    if (shouldShow) {
                        visibleCount += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle('is-visible', visibleCount === 0);
                }
            }

            if (input) {
                input.addEventListener('input', applyFilters);
            }
            [regionSelect, typeSelect, yearSelect].forEach(function (select) {
                if (select) {
                    select.addEventListener('change', applyFilters);
                }
            });
            tagButtons.forEach(function (button) {
                button.addEventListener('click', function () {
                    activeTag = normalize(button.getAttribute('data-filter-tag'));
                    tagButtons.forEach(function (item) {
                        item.classList.toggle('is-active', item === button);
                    });
                    applyFilters();
                });
            });
        });
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function (player) {
            var video = player.querySelector('[data-video]');
            var playButton = player.querySelector('[data-play-button]');
            var message = player.querySelector('[data-player-message]');
            var hlsInstance = null;
            var hasPrepared = false;

            function showMessage(text) {
                if (!message) {
                    return;
                }
                message.textContent = text;
                message.classList.add('is-visible');
            }

            function prepareVideo() {
                if (!video || hasPrepared) {
                    return;
                }
                hasPrepared = true;
                var source = video.getAttribute('data-src');
                if (!source) {
                    showMessage('播放源暂不可用');
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (!data || !data.fatal) {
                            return;
                        }
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hlsInstance.startLoad();
                            showMessage('网络波动，正在重新连接播放源');
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hlsInstance.recoverMediaError();
                            showMessage('媒体解析异常，正在恢复播放');
                        } else {
                            showMessage('当前播放源无法继续播放');
                            hlsInstance.destroy();
                        }
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else {
                    video.src = source;
                    showMessage('当前浏览器可能需要 HLS 支持才能播放');
                }
            }

            function playVideo() {
                prepareVideo();
                if (!video) {
                    return;
                }
                var attempt = video.play();
                player.classList.add('is-playing');
                if (attempt && typeof attempt.catch === 'function') {
                    attempt.catch(function () {
                        showMessage('请再次点击播放器开始播放');
                    });
                }
            }

            if (playButton) {
                playButton.addEventListener('click', playVideo);
            }
            if (video) {
                video.addEventListener('play', function () {
                    player.classList.add('is-playing');
                });
                video.addEventListener('pause', function () {
                    if (video.currentTime === 0 || video.ended) {
                        player.classList.remove('is-playing');
                    }
                });
                video.addEventListener('click', function () {
                    if (video.paused) {
                        playVideo();
                    }
                });
            }
            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupLibraryFilters();
        setupPlayers();
    });
})();
