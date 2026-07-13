// Client-side error monitoring for every visitor session.
// Reports JS errors, unhandled promise rejections, and failed asset loads to
// Google Analytics (G-8281F7TG69) as "exception" events — view them in GA4 under
// Reports → Engagement → Events (and live in Realtime). GitHub Pages has no
// server logs, so this is the site's error log. Loaded by every page.
(function () {
  var MAX_PER_SESSION = 20;
  var sent = 0;
  var seen = {};

  function report(type, message) {
    try {
      if (sent >= MAX_PER_SESSION) return;
      var desc = (type + ': ' + String(message || 'unknown')).slice(0, 150);
      if (seen[desc]) return;
      seen[desc] = true;
      sent++;
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'exception', {
          description: desc,
          fatal: false,
          page_path: location.pathname,
        });
      }
    } catch (_) {
      /* never let the monitor itself break the page */
    }
  }

  // JS errors + failed resource loads (img/script/css/video) — capture phase
  window.addEventListener(
    'error',
    function (e) {
      var t = e.target;
      if (t && t !== window && (t.src || t.href)) {
        report('resource_failed', (t.tagName || '?') + ' ' + (t.src || t.href));
      } else if (e.message) {
        report('js_error', e.message + ' @ ' + (e.filename || '?') + ':' + (e.lineno || 0));
      }
    },
    true
  );

  window.addEventListener('unhandledrejection', function (e) {
    var r = e.reason;
    report('promise_rejection', r && r.message ? r.message : r);
  });
})();
