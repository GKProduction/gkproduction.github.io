// Fullscreen Switch

function setFullscreen(fullscreen_mode) {
    if (fullscreen_mode) {
        var el = document.documentElement,
        rfs = el.requestFullscreen
             || el.webkitRequestFullScreen
             || el.mozRequestFullScreen
             || el.msRequestFullscreen;
        rfs.call(el).catch((err) => err=null);;
    } else {
        document.exitFullscreen().catch((err) => err=null);
    }
}
