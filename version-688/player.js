(function () {
  window.initVideoPlayer = function (streamUrl) {
    var shell = document.querySelector("[data-player]");
    if (!shell) {
      return;
    }
    var video = shell.querySelector("video");
    var cover = shell.querySelector(".player-cover");
    var prepared = false;
    var hlsInstance = null;

    function bindSource() {
      if (prepared || !video || !streamUrl) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
      prepared = true;
    }

    function startPlayback() {
      bindSource();
      shell.classList.add("is-playing");
      video.setAttribute("controls", "controls");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          shell.classList.remove("is-playing");
          video.setAttribute("controls", "controls");
        });
      }
    }

    if (cover) {
      cover.addEventListener("click", startPlayback);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });
    video.addEventListener("play", function () {
      shell.classList.add("is-playing");
    });
    video.addEventListener("ended", function () {
      if (hlsInstance && hlsInstance.stopLoad) {
        hlsInstance.stopLoad();
      }
    });
  };
})();
