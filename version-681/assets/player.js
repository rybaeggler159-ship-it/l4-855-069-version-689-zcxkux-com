(function () {
  const video = document.getElementById("movie-player");
  const cover = document.getElementById("player-cover");
  const config = window.playConfig || {};
  let ready = false;
  let hlsInstance = null;

  if (!video || !config.url) {
    return;
  }

  function loadLibrary(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js";
    script.onload = callback;
    script.onerror = callback;
    document.head.appendChild(script);
  }

  function startVideo() {
    if (cover) {
      cover.classList.add("is-hidden");
    }

    const promise = video.play();

    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  function bindVideo() {
    if (ready) {
      startVideo();
      return;
    }

    ready = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = config.url;
      startVideo();
      return;
    }

    loadLibrary(function () {
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });

        hlsInstance.loadSource(config.url);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, startVideo);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            hlsInstance.destroy();
            video.src = config.url;
            startVideo();
          }
        });
      } else {
        video.src = config.url;
        startVideo();
      }
    });
  }

  if (cover) {
    cover.addEventListener("click", bindVideo);
  }

  video.addEventListener("click", function () {
    if (!ready) {
      bindVideo();
    }
  });
})();
