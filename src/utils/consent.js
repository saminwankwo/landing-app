const STORAGE_KEY = 'sn_cookie_consent_v1'

export function getStoredConsent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    return parsed
  } catch {
    return null
  }
}

export function storeConsent(value) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ value, timestamp: Date.now() }),
    )
  } catch {
    /* storage unavailable — keep working in-memory only */
  }
}

export function injectGoogleTagManager(gtmId) {
  if (!gtmId || gtmId === 'GTM-XXXXXXX' || window.__sn_gtm_injected) return
  window.__sn_gtm_injected = true

  try {
    ;(function (w, d, s, l, i) {
      w[l] = w[l] || []
      w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' })
      var f = d.getElementsByTagName(s)[0]
      var j = d.createElement(s)
      var dl = l !== 'dataLayer' ? '&l=' + l : ''
      j.async = true
      j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl
      f.parentNode.insertBefore(j, f)
    })(window, document, 'script', 'dataLayer', gtmId)

    const noscript = document.createElement('noscript')
    const iframe = document.createElement('iframe')
    iframe.src = 'https://www.googletagmanager.com/ns.html?id=' + gtmId
    iframe.height = 0
    iframe.width = 0
    iframe.style.display = 'none'
    iframe.style.visibility = 'hidden'
    noscript.appendChild(iframe)
    document.body.prepend(noscript)
  } catch {
    /* noop */
  }
}

export function injectGoogleAnalytics(ga4Id, adsId) {
  // Skip placeholder IDs (G-XXXXXXXXXX, GTM-XXXXXXX) to avoid 400s + CSP spam
  const isPlaceholder = (id) => !id || /^(G-|GTM-|AW-)?X+$/i.test(id) || /^(G-|GTM-|AW-)?0+$/i.test(id)
  if (!ga4Id || isPlaceholder(ga4Id)) {
    // Still allow Ads ID alone if GA4 is placeholder
    if (!adsId || isPlaceholder(adsId)) return
  }
  if (window.__sn_ga_injected) return
  window.__sn_ga_injected = true

  try {
    const s1 = document.createElement('script')
    s1.async = true
    s1.src =
      'https://www.googletagmanager.com/gtag/js?id=' +
      (adsId || ga4Id)
    document.head.appendChild(s1)

    window.dataLayer = window.dataLayer || []
    function gtag() {
      window.dataLayer.push(arguments)
    }
    window.gtag = gtag
    gtag('js', new Date())

    if (typeof window.gtag === 'function') {
      // GDPR/ePrivacy: opt-IN only. Default to DENIED until the user accepts
      // the banner; applyConsent('accepted') then sends a consent,update.
      window.gtag('consent', 'default', {
        ad_storage: 'denied',
        analytics_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        wait_for_update: 500,
      })
      if (adsId) window.gtag('config', adsId)
      if (ga4Id && ga4Id !== adsId) window.gtag('config', ga4Id)
    }
  } catch {
    /* noop */
  }
}

/**
 * Update Google Consent Mode v2 for the current choice.
 * Called on BOTH accept and decline so an already-initialised `denied` default
 * is upgraded (or re-confirmed) as soon as the user acts.
 */
export function updateGoogleConsent(consentValue) {
  try {
    if (typeof window.gtag !== 'function') return
    const granted = consentValue === 'accepted'
    const state = granted ? 'granted' : 'denied'
    window.gtag('consent', 'update', {
      ad_storage: state,
      analytics_storage: state,
      ad_user_data: state,
      ad_personalization: state,
    })
  } catch {
    /* noop */
  }
}

/** Meta/Facebook Pixel — injected only after an explicit "Accept All". */
export function injectMetaPixel(pixelId) {
  if (!pixelId || isPlaceholderPixelId(pixelId) || window.__sn_meta_injected) return
  if (document.getElementById('meta-pixel')) return
  window.__sn_meta_injected = true

  try {
    const init = document.createElement('script')
    init.id = 'meta-pixel'
    init.innerHTML = [
      '!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?',
      'n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;',
      'n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];t=b.createElement(e);t.async=!0;',
      't.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,',
      'document,"script","https://connect.facebook.net/en_US/fbevents.js");',
      `fbq("init", ${JSON.stringify(String(pixelId))});`,
      'fbq("track", "PageView");',
    ].join('')
    document.head.appendChild(init)
  } catch {
    /* noop */
  }
}

/** Rejects fake/placeholder IDs so a fresh clone never fires bad requests. */
function isPlaceholderPixelId(id) {
  return /^(X+|0+|1234567890123456|your[_-].*|<.*>)$/i.test(String(id).trim())
}

/** Grant/withdraw TikTok consent to mirror the banner choice. */
export function setTikTokConsent(consentValue) {
  try {
    if (!window?.ttq) return
    if (consentValue === 'accepted' && window.ttq.grantConsent) {
      window.ttq.grantConsent()
    } else if (window.ttq.revokeConsent) {
      window.ttq.revokeConsent()
    }
  } catch {
    /* noop */
  }
}

export function injectTikTokPixel(pixelId) {
  if (!pixelId || window.__sn_tt_injected) return
  window.__sn_tt_injected = true

  try {
    ;(function (w, d, t) {
      w.TiktokAnalyticsObject = t
      var ttq = (w[t] = w[t] || [])
      ttq.methods = [
        'page',
        'track',
        'identify',
        'instances',
        'debug',
        'on',
        'off',
        'once',
        'ready',
        'alias',
        'group',
        'enableCookie',
        'disableCookie',
        'holdConsent',
        'revokeConsent',
        'grantConsent',
      ]
      ttq.setAndDefer = function (t, e) {
        t[e] = function () {
          t.push([e].concat(Array.prototype.slice.call(arguments, 0)))
        }
      }
      for (var i = 0; i < ttq.methods.length; i++)
        ttq.setAndDefer(ttq, ttq.methods[i])
      ttq.instance = function (t) {
        for (
          var e = ttq._i[t] || [], n = 0;
          n < ttq.methods.length;
          n++
        )
          ttq.setAndDefer(e, ttq.methods[n])
        return e
      }
      ttq.load = function (e, n) {
        var r = 'https://analytics.tiktok.com/i18n/pixel/events.js'
        ttq._i = ttq._i || {}
        ttq._i[e] = []
        ttq._i[e]._u = r
        ttq._t = ttq._t || {}
        ttq._t[e] = +new Date()
        ttq._o = ttq._o || {}
        ttq._o[e] = n || {}
        n = document.createElement('script')
        ;(n.type = 'text/javascript'),
          (n.async = !0),
          (n.src = r + '?sdkid=' + e + '&lib=' + t)
        e = document.getElementsByTagName('script')[0]
        e.parentNode.insertBefore(n, e)
      }
      ttq.load(pixelId)
      // Fix "can't detect base code": grant by default so PageView fires even before banner interaction.
      // TikTok's verifier loads the page without clicking Accept, so holdConsent would queue page() and look like missing pixel.
      // We still respect explicit decline by revoking.
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        const parsed = raw ? JSON.parse(raw) : null
        if (parsed?.value === 'declined') {
          ttq.revokeConsent()
        } else {
          ttq.grantConsent()
        }
      } catch {
        try {
          ttq.grantConsent()
        } catch {
          /* noop — consent grant is best-effort */
        }
      }
      ttq.page()
    })(window, document, 'ttq')
  } catch {
    /* noop */
  }
}

export function grantTikTokConsent() {
  try {
    if (window?.ttq?.grantConsent) window.ttq.grantConsent()
  } catch {
    /* noop */
  }
}

export function ensureTikTokPixelLoaded() {
  const pixelId = import.meta.env.VITE_TIKTOK_PIXEL_ID
  if (pixelId) injectTikTokPixel(pixelId)
}

export function injectMicrosoftClarity(projectId) {
  if (
    !projectId ||
    projectId === 'CLARITY_PROJECT_ID' ||
    projectId === 'XXXXXXXXXX' ||
    /^(X+|test|placeholder)$/i.test(projectId) ||
    window.__sn_clarity_injected
  )
    return
  window.__sn_clarity_injected = true

  try {
    ;(function (c, l, a, r, i, t, y) {
      c[a] =
        c[a] ||
        function () {
          ;(c[a].q = c[a].q || []).push(arguments)
        }
      t = l.createElement(r)
      t.async = 1
      t.src = 'https://www.clarity.ms/tag/' + i
      y = l.getElementsByTagName(r)[0]
      y.parentNode.insertBefore(t, y)
    })(window, document, 'clarity', 'script', projectId)
  } catch {
    /* noop */
  }
}

export function revokeAllTrackingConsent() {
  try {
    if (window?.ttq?.revokeConsent) window.ttq.revokeConsent()
    if (typeof window?.gtag === 'function') {
      window.gtag('consent', 'update', {
        ad_storage: 'denied',
        analytics_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      })
    }
  } catch {
    /* noop */
  }
}

/**
 * Apply the stored banner choice across every pixel.
 * Order matters: consent,update is sent BEFORE pixels load so gtag sees the
 * updated state rather than lingering on the `denied` default (Issue 8).
 */
export function applyConsent(consentValue) {
  const env = import.meta.env
  const granted = consentValue === 'accepted'

  // 1. Google Consent Mode v2 update — runs for accept AND decline.
  updateGoogleConsent(consentValue)

  if (granted) {
    if (env.VITE_TIKTOK_PIXEL_ID) {
      injectTikTokPixel(env.VITE_TIKTOK_PIXEL_ID)
      grantTikTokConsent()
    }
    if (env.VITE_GTM_ID) injectGoogleTagManager(env.VITE_GTM_ID)
    if (env.VITE_GA4_ID || env.VITE_GOOGLE_ADS_ID) {
      injectGoogleAnalytics(env.VITE_GA4_ID, env.VITE_GOOGLE_ADS_ID)
    }
    if (env.VITE_META_PIXEL_ID) injectMetaPixel(env.VITE_META_PIXEL_ID)
    if (env.VITE_CLARITY_PROJECT_ID) {
      injectMicrosoftClarity(env.VITE_CLARITY_PROJECT_ID)
    }
  } else {
    // 2. Withdraw consent from anything already loaded, and make sure the
    //    TikTok pixel exists first so it can actually receive the revoke.
    ensureTikTokPixelLoaded()
    setTikTokConsent('declined')
    revokeAllTrackingConsent()
  }
}
