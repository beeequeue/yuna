window.fathom = (function () {
  var fathomScript =
      document.currentScript ||
      document.querySelector('script[src*="script.js"][site]') ||
      document.querySelector("script[data-site]") ||
      document.querySelector("script[site]"),
    siteId = fathomScript.getAttribute("data-site") || fathomScript.getAttribute("site"),
    honorDNT = !1,
    auto = !0,
    canonical = !0,
    excludedDomains = [],
    allowedDomains = []
  "true" ==
    (fathomScript.getAttribute("data-honor-dnt") ||
      fathomScript.getAttribute("honor-dnt")) &&
    (honorDNT = "doNotTrack" in navigator && "1" === navigator.doNotTrack),
    "false" ==
      (fathomScript.getAttribute("data-auto") || fathomScript.getAttribute("auto")) &&
      (auto = !1),
    "false" ==
      (fathomScript.getAttribute("data-canonical") ||
        fathomScript.getAttribute("canonical")) && (canonical = !1),
    (fathomScript.getAttribute("data-excluded-domains") ||
      fathomScript.getAttribute("excluded-domains")) &&
      (excludedDomains = (
        fathomScript.getAttribute("data-excluded-domains") ||
        fathomScript.getAttribute("excluded-domains")
      ).split(",")),
    fathomScript.getAttribute("data-included-domains") ||
    fathomScript.getAttribute("included-domains")
      ? (allowedDomains = (
          fathomScript.getAttribute("data-included-domains") ||
          fathomScript.getAttribute("included-domains")
        ).split(","))
      : (fathomScript.getAttribute("data-allowed-domains") ||
          fathomScript.getAttribute("allowed-domains")) &&
        (allowedDomains = (
          fathomScript.getAttribute("data-allowed-domains") ||
          fathomScript.getAttribute("allowed-domains")
        ).split(","))

  function trackPageview() {
    window.fathom.trackPageview()
  }

  function spaHash() {
    window.addEventListener("hashchange", trackPageview)
  }

  spaHash()
  var scriptUrl,
    trackerUrl = "https://img3.usefathom.com/"

  function encodeParameters(params) {
    return (
      "?" +
      Object.keys(params)
        .map(function (k) {
          return encodeURIComponent(k) + "=" + encodeURIComponent(params[k])
        })
        .join("&")
    )
  }

  function trackingEnabled() {
    var fathomIsBlocked = !1
    try {
      fathomIsBlocked =
        window.localStorage && window.localStorage.getItem("blockFathomTracking")
    } catch (err) {}
    var prerender =
        "visibilityState" in document && "prerender" === document.visibilityState,
      clientSideBot = /bot|google|baidu|bing|msn|duckduckbot|teoma|slurp|yandex/i.test(
        navigator.userAgent,
      ),
      isExcludedDomain = -1 < excludedDomains.indexOf(window.location.hostname),
      isAllowedDomain =
        !(0 < allowedDomains.length) ||
        -1 < allowedDomains.indexOf(window.location.hostname)
    return (
      !(fathomIsBlocked || prerender || clientSideBot || honorDNT || isExcludedDomain) &&
      isAllowedDomain
    )
  }

  return (
    ((scriptUrl = new URL("https://mammal.haglund.dev/tracker.js")),
    (trackerUrl = "https://" + scriptUrl.hostname + "/")),
    auto &&
      setTimeout(function () {
        window.fathom.trackPageview()
      }),
    {
      send: function (params) {
        var img
        trackingEnabled() &&
          ((img = document.createElement("img")).setAttribute("alt", ""),
          img.setAttribute("aria-hidden", "true"),
          (img.style.position = "absolute"),
          (img.src = trackerUrl + encodeParameters(params)),
          img.addEventListener("load", function () {
            img.parentNode.removeChild(img)
          }),
          document.body.appendChild(img))
      },
      beacon: function (params) {
        trackingEnabled() && navigator.sendBeacon(trackerUrl + encodeParameters(params))
      },
      trackPageview: function (params = {}) {
        this.send({
          p: window.location.hash.slice(1),
          h: "https://yuna.app",
          r: document.referrer,
          sid: siteId,
        })
      },
      trackGoal: function (code, cents) {
        this.beacon({ gcode: code, gval: cents })
      },
      blockTrackingForMe: function () {
        window.localStorage
          ? (window.localStorage.setItem("blockFathomTracking", !0),
            alert("You have blocked Fathom for yourself on this website"))
          : alert("Your browser doesn't support localStorage.")
      },
      enableTrackingForMe: function () {
        window.localStorage &&
          (window.localStorage.removeItem("blockFathomTracking"),
          alert("Fathom has been enabled for your device"))
      },
    }
  )
})()
