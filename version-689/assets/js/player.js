(function () {
    function initMoviePlayer(source) {
        var shell = document.querySelector(".player-shell");
        if (!shell) {
            return;
        }

        var video = shell.querySelector("video");
        var button = shell.querySelector(".play-overlay");
        var hlsInstance = null;
        var prepared = false;

        function prepare() {
            if (prepared || !video) {
                return;
            }

            prepared = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                return;
            }

            video.src = source;
        }

        function start() {
            prepare();
            shell.classList.add("is-playing");

            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    shell.classList.remove("is-playing");
                });
            }
        }

        if (button) {
            button.addEventListener("click", start);
        }

        if (video) {
            video.addEventListener("play", function () {
                shell.classList.add("is-playing");
            });

            video.addEventListener("pause", function () {
                if (video.currentTime === 0) {
                    shell.classList.remove("is-playing");
                }
            });

            video.addEventListener("ended", function () {
                shell.classList.remove("is-playing");
            });
        }

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;
})();
