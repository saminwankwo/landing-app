/**
 * Attribution (UTM + click ID), unified event tracking, and Lead Tracker sync.
 *
 * Storage contract (see TRACKING_SETUP.md §4 + §8.1):
 *   localStorage['sn_utm_params']  -> { utm_source, ..., fbclid, gclid, ttclid,
 *                                       landing_page, timestamp }
 *   localStorage['sn_click_ids']   -> { meta: {id,ts}, google: {...}, tiktok: {...} }
 *
 * All exports are fail-safe: tracking must never break the user flow.
 */

// ===== Storage keys & constants =====

const STORAGE_KEY = 'sn_utm_params'
const CLICK_ID_KEY = 'sn_click_ids'

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
const CLICK_ID_KEYS = ['gbraid', 'wbraid', 'gclid', 'ttclid', 'fbclid', 'msclkid']

/** Canonical WhatsApp number for wa.me links (E.164, no '+'). */
export const WHATSAPP_NUMBER = '2349020927884'

/**
 * Placeholder phone — the ads form collects no phone field but the Lead
 * Tracker webhook requires `name`, `businessName`, `phone` and validates phone
 * against /^[\d\s\-+().]{7,30}$/. A descriptive string would 400, so we send a
 * clearly-fake E.164 number and note email as the real channel.
 * See TRACKING_SETUP.md §9 Troubleshooting.
 */
const PLACEHOLDER_PHONE = '+2340000000000'

// ===== Environment accessors =====

export function getCalendlyUrl() {
  return import.meta.env.VITE_CALENDLY_URL || 'https://calendly.com/nwankwosami/30min'
}

export function getFormspreeEndpoint() {
  return import.meta.env.VITE_FORMSPREE_ENDPOINT || 'https://formspree.io/f/mqejjvpy'
}

/** Lead Tracker webhook URL — empty string means "CRM sync disabled". */
export function getLeadTrackerWebhook() {
  return import.meta.env.VITE_LEAD_TRACKER_WEBHOOK || ''
}

/** Shared secret matching WEBHOOK_SECRET in the Lead Tracker API .env. */
export function getLeadTrackerSecret() {
  return import.meta.env.VITE_LEAD_TRACKER_SECRET || ''
}

// ===== Safe primitives =====

function isBrowser() {
  return typeof window !== 'undefined'
}

function readJSON(key) {
  if (!isBrowser()) return {}
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeJSON(key, value) {
  if (!isBrowser()) return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage full/blocked — attribution is best-effort */
  }
}

// ===== UTM & click ID capture (TRACKING_SETUP §4) =====

/**
 * Capture UTM params + fbclid/gclid/ttclid from the current URL into
 * localStorage. New params override old, so a fresh ad click re-attributes.
 * Safe to call on every route mount.
 */
export function captureUTM() {
  if (!isBrowser()) return {}

  const params = new URLSearchParams(window.location.search)
  const collected = {}

  UTM_KEYS.forEach((k) => {
    const v = params.get(k)
    if (v) collected[k] = v
  })

  const fbclid = params.get('fbclid')
  const gclid = params.get('gclid')
  const ttclid = params.get('ttclid')
  const gbraid = params.get('gbraid')
  const wbraid = params.get('wbraid')
  const msclkid = params.get('msclkid')

  if (fbclid) collected.fbclid = fbclid
  if (gclid) collected.gclid = gclid
  if (ttclid) collected.ttclid = ttclid
  if (gbraid) collected.gbraid = gbraid
  if (wbraid) collected.wbraid = wbraid
  if (msclkid) collected.msclkid = msclkid

  collected.landing_page = window.location.pathname + window.location.search
  collected.timestamp = new Date().toISOString()

  const existing = getUTM()
  writeJSON(STORAGE_KEY, { ...existing, ...collected })

  return collected
}

/** Read previously captured attribution (never throws). */
export function getUTM() {
  return readJSON(STORAGE_KEY)
}

/**
 * Store a click ID under its provider name.
 * Called as storeClickId() with no args to auto-detect from the URL, or
 * storeClickId('meta', id) explicitly.
 */
export function storeClickId(provider, id) {
  if (!isBrowser()) return
  try {
    const existing = readJSON(CLICK_ID_KEY)

    if (provider && id) {
      existing[provider] = { id, ts: new Date().toISOString() }
      writeJSON(CLICK_ID_KEY, existing)
      return
    }

    const params = new URL(window.location.href).searchParams
    const map = [
      ['meta', 'fbclid'],
      ['google', 'gclid'],
      ['google', 'gbraid'],
      ['google', 'wbraid'],
      ['tiktok', 'ttclid'],
      ['microsoft', 'msclkid'],
    ]
    map.forEach(([prov, key]) => {
      const v = params.get(key)
      if (v && !existing[prov]) existing[prov] = { id: v, ts: new Date().toISOString() }
    })
    writeJSON(CLICK_ID_KEY, existing)
  } catch {
    /* noop */
  }
}

/**
 * Append captured UTM + click IDs to an outbound URL (Calendly, etc.).
 * Calendly reads utm_* natively for routing/attribution.
 */
export function appendUTMToUrl(url) {
  try {
    const utm = getUTM()
    if (!utm || Object.keys(utm).length === 0) return url

    const carried = [
      ...UTM_KEYS,
      'fbclid',
      'gclid',
      'ttclid',
      'gbraid',
      'wbraid',
      'msclkid',
    ]
    const qs = Object.entries(utm)
      .filter(([k]) => carried.includes(k) && utm[k])
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&')

    if (!qs) return url
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}${qs}`
  } catch {
    return url
  }
}

/**
 * Build a wa.me link whose prefilled message ends with an attribution block,
 * so the lead arriving in your WhatsApp inbox identifies the driving ad.
 * See TRACKING_SETUP.md §6 Option B.
 */
export function buildWhatsAppLink(baseMessage, location = 'hero_whatsapp') {
  try {
    const utm = getUTM()
    const lines = [
      '---',
      `Source: ${location}`,
      utm.utm_campaign ? `Campaign: ${utm.utm_campaign}` : null,
      utm.utm_source ? `UTM Source: ${utm.utm_source}` : null,
      utm.utm_medium ? `UTM Medium: ${utm.utm_medium}` : null,
      utm.utm_content ? `Creative: ${utm.utm_content}` : null,
      utm.fbclid ? `fbclid: ${utm.fbclid}` : null,
      utm.gclid ? `gclid: ${utm.gclid}` : null,
      utm.ttclid ? `ttclid: ${utm.ttclid}` : null,
    ].filter(Boolean)

    const full = `${baseMessage}\n\n${lines.join('\n')}`
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(full)}`
  } catch {
    return `https://wa.me/${WHATSAPP_NUMBER}`
  }
}

/**
 * Human-readable source string for the Lead Tracker dashboard.
 * Mirrors buildSourceFromUTM() in campagin/lead-tracker/.../webhooks.js so the
 * CRM groups ad platform + campaign consistently.
 */
export function buildSourceFromUTM(utm = getUTM()) {
  const parts = []
  if (utm.utm_source) parts.push(`Source: ${utm.utm_source}`)
  if (utm.utm_medium) parts.push(`Medium: ${utm.utm_medium}`)
  if (utm.utm_campaign) parts.push(`Campaign: ${utm.utm_campaign}`)
  if (utm.fbclid) parts.push('Meta/Facebook Click')
  if (utm.gclid) parts.push('Google Click')
  if (utm.ttclid) parts.push('TikTok Click')
  return parts.join(' | ') || 'Ads Landing Page Form'
}

// ===== Email hashing (SHA-256, for enhanced conversions) =====

export async function hashString(string) {
  try {
    if (!string || typeof crypto === 'undefined' || !crypto?.subtle?.digest) {
      return ''
    }
    const msgUint8 = new TextEncoder().encode(String(string))
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  } catch {
    return ''
  }
}

// ===== TikTok =====

export function trackTikTokEvent(eventName, properties = {}) {
  if (!window?.ttq) {
    try {
      console.warn('[TikTok] ttq not ready for', eventName)
    } catch {
      /* noop */
    }
    return
  }
  try {
    const payload = {
      contents: [
        {
          content_id: properties.content_id || 'landing_page',
          content_type: properties.content_type || 'product',
          content_name: properties.content_name || 'Samuel Nwankwo Portfolio',
        },
      ],
      value: typeof properties.value === 'number' ? properties.value : 0,
      currency: properties.currency || 'USD',
    }
    window.ttq.track(eventName, payload)
    // Lead submissions also fire the canonical TikTok lead events so the
    // dashboard's dedupe picks the strongest signal.
    if (eventName === 'Lead') {
      try {
        window.ttq.track('SubmitForm', payload)
      } catch {
        /* noop */
      }
      try {
        window.ttq.track('Contact', payload)
      } catch {
        /* noop */
      }
    }
  } catch {
    /* tracking must never break user flow */
  }
}

export async function identifyTikTokUser(email) {
  if (!email || !window?.ttq) return
  try {
    const hashed = await hashString(email.trim().toLowerCase())
    if (hashed) window.ttq.identify({ email: hashed })
  } catch {
    /* noop */
  }
}

// ===== Meta (Facebook) =====

/**
 * Fire a Meta pixel event, queueing it if the pixel has not booted yet.
 * Mirrors the _fbqQueue pattern in campagin/landing-page/src/Pixels.jsx.
 */
export function fbTrack(event, params = {}) {
  if (!isBrowser()) return
  try {
    if (typeof window.fbq === 'function') {
      window.fbq('track', event, params)
      return
    }
    window._fbqQueue = window._fbqQueue || []
    window._fbqQueue.push(['track', event, params])
  } catch {
    /* noop */
  }
}

/** Flush any events queued before the Meta pixel finished loading. */
export function flushFbQueue() {
  if (!isBrowser()) return
  try {
    if (
      Array.isArray(window._fbqQueue) &&
      window._fbqQueue.length &&
      typeof window.fbq === 'function'
    ) {
      window._fbqQueue.forEach((args) => window.fbq.apply(null, args))
      window._fbqQueue = []
    }
  } catch {
    /* noop */
  }
}

// ===== Unified track() (TRACKING_SETUP §7.2) =====

/**
 * Fire one logical event across every present pixel (TikTok + GA4 + Meta)
 * and push it to dataLayer. Callers never need to know which pixels exist.
 */
export function track(eventName, params = {}) {
  if (!isBrowser()) return
  const withUTM = { ...getUTM(), ...params }

  trackTikTokEvent(eventName, params)

  if (typeof window.gtag === 'function') {
    try {
      window.gtag('event', eventName, withUTM)
    } catch {
      /* noop */
    }
  }

  // Meta uses standard event names (Lead, ClickButton...); route those to
  // 'track' and anything custom to 'trackCustom'.
  const STANDARD_META_EVENTS = ['Lead', 'ClickButton', 'ViewContent', 'Contact', 'SubmitForm']
  try {
    if (typeof window.fbq === 'function') {
      window.fbq(STANDARD_META_EVENTS.includes(eventName) ? 'track' : 'trackCustom', eventName, withUTM)
    } else {
      window._fbqQueue = window._fbqQueue || []
      window._fbqQueue.push([STANDARD_META_EVENTS.includes(eventName) ? 'track' : 'trackCustom', eventName, withUTM])
    }
  } catch {
    /* noop */
  }

  try {
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ event: eventName, ...withUTM, ts: Date.now() })
  } catch {
    /* noop */
  }
}

// ===== Lead Tracker webhook (TRACKING_SETUP §5) =====

/**
 * POST a lead to the SN TECH Lead Tracker CRM in parallel with Formspree.
 * Never throws — Formspree remains the authoritative submission path.
 *
 * @returns {Promise<{ok:boolean, skipped?:boolean, status?:string, httpStatus?:number, data?:any}>}
 */
export async function postToLeadTracker(payload = {}) {
  const endpoint = getLeadTrackerWebhook()
  const secret = getLeadTrackerSecret()
  if (!endpoint) {
    return { ok: false, skipped: true, status: 'not-configured', reason: 'no webhook URL configured' }
  }

  try {
    const utm = getUTM()

    const body = {
      name: payload.name || '(unknown)',
      email: payload.email || '',
      businessName: payload.businessName || payload.company || '(ads landing form)',
      business: payload.company || payload.businessName || '(ads landing form)',
      phone: PLACEHOLDER_PHONE,
      message: payload.message || '',
      source: payload.source || buildSourceFromUTM(utm),
      medium: payload.medium || utm.utm_medium || '',
      campaign: payload.campaign || utm.utm_campaign || '',
      adCreative: payload.adCreative || utm.utm_content || '',
      pageUrl: payload.pageUrl || (isBrowser() ? window.location.href : ''),
      referrer: (isBrowser() && document.referrer) || '',
      location: payload.location || 'ads_landing_contact_form',
      submittedAt: payload.submittedAt || new Date().toISOString(),
      utm,
    }

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }
    // Header preferred (the API warns when sent as a query param).
    if (secret) headers['x-webhook-secret'] = secret

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    let data = null
    try {
      data = await res.json()
    } catch {
      /* non-JSON body */
    }

    if (res.status === 429) return { ok: false, status: 'rate-limited', data }
    if (!res.ok) return { ok: false, status: 'error', httpStatus: res.status, data }
    return { ok: true, status: 'ok', data }
  } catch (e) {
    return { ok: false, status: 'network-error', error: String(e) }
  }
}
