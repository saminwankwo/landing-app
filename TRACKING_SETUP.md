# Ads Landing Page Tracking + Lead Tracker Integration Setup

This guide walks through setting up **end-to-end conversion tracking** for the `ads-landing-page` project so that:

1. Paid ad clicks (TikTok / Meta / Google) carry their UTM parameters and click IDs through every step.
2. Form submissions, WhatsApp chats, and Calendly bookings are **tracked as conversions** in each ad platform's pixel.
3. Every lead is **saved to the SN TECH Lead Tracker CRM** (in `campagin/lead-tracker/`) with full attribution data.

> **Reference implementation:** The `campagin/landing-page/` project already has all of this wired up. You can directly copy patterns from:
> - [campagin/landing-page/src/tracking.js](../campagin/landing-page/src/tracking.js)
> - [campagin/landing-page/src/components/EnquiryForm.jsx](../campagin/landing-page/src/components/EnquiryForm.jsx)
> - [campagin/landing-page/src/Pixels.jsx](../campagin/landing-page/src/Pixels.jsx)
> - [campagin/lead-tracker/packages/api/src/routes/webhooks.js](../campagin/lead-tracker/packages/api/src/routes/webhooks.js) — the endpoint receiving the leads.

---

## Table of Contents

1. [Data Flow Overview](#1-data-flow-overview)
2. [Prerequisites](#2-prerequisites)
3. [Step 1 — Environment Variables](#3-step-1--environment-variables)
4. [Step 2 — UTM & Click ID Capture](#4-step-2--utm--click-id-capture)
5. [Step 3 — Wire Form Submissions to Lead Tracker Webhook](#5-step-3--wire-form-submissions-to-lead-tracker-webhook)
6. [Step 4 — Append UTM to External Links (WhatsApp / Calendly)](#6-step-4--append-utm-to-external-links-whatsapp--calendly)
7. [Step 5 — Pixels & Consent Mode](#7-step-5--pixels--consent-mode)
8. [Step 6 — Testing & Verification](#8-step-6--testing--verification)
9. [Troubleshooting](#9-troubleshooting)
10. [Quick Checklist](#10-quick-checklist)

---

## 1. Data Flow Overview

```mermaid
flowchart LR
    A[Ad Platform\nTikTok / Meta / Google] -->|Click with utm_* + fbclid/gclid/ttclid| B[ads-landing-page]
    B -->|1. captureUTM() saves to localStorage| C[localStorage\nutm_source, utm_campaign, fbclid, …]
    B -->|2. Pixel fires PageView + ViewContent| D[Pixels\nTikTok ttq · Meta fbq · GA4 gtag]
    B -->|3. User submits form| E[handleSubmit in Home.jsx]
    E -->|4a. POST Formspree| F[Email notification]
    E -->|4b. POST Lead Tracker /landing-lead| G[SN TECH Lead Tracker CRM]
    E -->|4c. trackTikTokEvent('Lead') + gtag/fbq Lead| D
    B -->|5. User clicks WhatsApp/Calendly link| H[WhatsApp / Calendly\nwith utm_* in URL]
    style D fill:#bbdefb,color:#0d47a1
    style G fill:#c8e6c9,color:#1a5e20
    style C fill:#fff3e0,color:#e65100
```

Everything a user does on the landing page is attributed back to the exact ad, campaign, creative, and click that brought them — **even if they close the tab and come back later** (because UTM data persists in `localStorage`).

---

## 2. Prerequisites

1. **SN TECH Lead Tracker is running.** Follow the setup in `campagin/lead-tracker/README.md`.
   You need:
   - The API server accessible at `http://localhost:4000` (dev) or your production URL.
   - `MONGO_URI` and `JWT_SECRET` configured in `campagin/lead-tracker/packages/api/.env`.
   - `WEBHOOK_SECRET` set in the same `.env` file (create one — any random 32-char string works: `openssl rand -hex 16`).

2. **ads-landing-page dependencies installed.**
   ```bash
   cd ads-landing-page
   npm install
   ```

3. **Pixel IDs from each ad platform:**
   - TikTok Events Manager → Pixel ID (e.g. `D8F0N1RC77UFK9KDTFB0`)
   - Meta Events Manager → Pixel ID (e.g. `1234567890123456`)
   - Google Analytics 4 → Measurement ID (`G-XXXXXXXXXX`)
   - Google Ads → Customer ID (`AW-981549380`) + conversion label if using enhanced conversions

4. **Formspree form ID** (used as backup email delivery — `mqejjvpy` currently hardcoded).

---

## 3. Step 1 — Environment Variables

Copy `.env.example` to `.env` and **fill in every value**:

```bash
cd ads-landing-page
cp .env.example .env
```

```dotenv
# ===== Public site URL (used for SEO + canonical links) =====
VITE_SITE_URL=https://your-landing-domain.com

# ===== Ad Pixels =====
# Replace ALL placeholders. Empty strings = pixel not loaded.
VITE_GTM_ID=                        # Optional: Google Tag Manager container (GTM-XXXXXXX)
VITE_GA4_ID=G-XXXXXXXXXX            # Required for GA4 + Google Ads
VITE_GOOGLE_ADS_ID=AW-981549380     # Required if running Google Ads
VITE_TIKTOK_PIXEL_ID=D8F0N1RC77UFK9KDTFB0
VITE_CLARITY_PROJECT_ID=            # Optional: Microsoft Clarity session replay

# ===== Form / Bookings =====
VITE_FORMSPREE_ENDPOINT=https://formspree.io/f/mqejjvpy
VITE_CALENDLY_URL=https://calendly.com/nwankwosami/30min

# ===== Lead Tracker Webhook (NEW — required for CRM integration) =====
# Format: {LEAD_TRACKER_API_BASE_URL}/api/webhooks/landing-lead
# Example (local dev): http://localhost:4000/api/webhooks/landing-lead
VITE_LEAD_TRACKER_WEBHOOK=https://your-lead-tracker-api.example.com/api/webhooks/landing-lead
# Match this 1-to-1 with WEBHOOK_SECRET in campagin/lead-tracker/packages/api/.env
VITE_LEAD_TRACKER_SECRET=your_32char_random_webhook_secret_here

# ===== Misc =====
VITE_ADSENSE_PUB_ID=                # Optional: if monetizing with AdSense
```

> **Security note:** `VITE_LEAD_TRACKER_SECRET` is a client-side value and will be visible in the bundled JS. This is acceptable for a public capture endpoint (the endpoint is designed to be called from the browser) — it only prevents casual spam. For a stricter setup, proxy the webhook through a serverless function. The Lead Tracker also has honeypot + duplicate detection as secondary layers.

---

## 4. Step 2 — UTM & Click ID Capture

`ads-landing-page/src/utils/tracking.js` currently has no UTM logic. Add these exports **to the top of the file** (copy the working pattern from `campagin/landing-page/src/tracking.js`):

```js
// ===== ads-landing-page/src/utils/tracking.js =====

const STORAGE_KEY = 'sn_utm_params'
const CLICK_ID_KEY = 'sn_click_ids'

export function captureUTM() {
  if (typeof window === 'undefined') return {}
  const params = new URLSearchParams(window.location.search)
  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
  const fbclid = params.get('fbclid')   // Meta/Facebook click ID
  const gclid = params.get('gclid')    // Google Ads click ID
  const ttclid = params.get('ttclid')  // TikTok click ID

  const collected = {}
  utmKeys.forEach((k) => { const v = params.get(k); if (v) collected[k] = v })
  if (fbclid) collected.fbclid = fbclid
  if (gclid) collected.gclid = gclid
  if (ttclid) collected.ttclid = ttclid
  collected.landing_page = window.location.pathname + window.location.search
  collected.timestamp = new Date().toISOString()

  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    const merged = { ...existing, ...collected }  // New params override old
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
  } catch (_) {}

  return collected
}

export function getUTM() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }
  catch (_) { return {} }
}

export function storeClickId(provider, id) {
  try {
    const existing = JSON.parse(localStorage.getItem(CLICK_ID_KEY) || '{}')
    existing[provider] = { id, ts: new Date().toISOString() }
    localStorage.setItem(CLICK_ID_KEY, JSON.stringify(existing))
  } catch (_) {}
}

export function appendUTMToUrl(url) {
  try {
    const utm = getUTM()
    if (!utm || Object.keys(utm).length === 0) return url
    const separator = url.includes('?') ? '&' : '?'
    const qs = Object.entries(utm)
      .filter(([k]) => ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid', 'ttclid'].includes(k))
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&')
    return qs ? `${url}${separator}${qs}` : url
  } catch (_) { return url }
}

// … (keep existing trackTikTokEvent, identifyTikTokUser, etc. below)
```

Then **call `captureUTM()` on page load**. Add this to `Home.jsx` inside the existing `useEffect`:

```jsx
// ===== ads-landing-page/src/pages/Home.jsx — top of useEffect (line ~123) =====
import { captureUTM, getUTM, storeClickId, appendUTMToUrl /* … existing imports */ } from '../utils/tracking'

useEffect(() => {
  // NEW — capture attribution ASAP
  captureUTM()
  const params = new URLSearchParams(window.location.search)
  if (params.get('fbclid')) storeClickId('meta', params.get('fbclid'))
  if (params.get('gclid')) storeClickId('google', params.get('gclid'))
  if (params.get('ttclid')) storeClickId('tiktok', params.get('ttclid'))

  // … (existing setSeo, trackTikTokEvent('ViewContent'), IntersectionObserver code)
}, [])
```

---

## 5. Step 3 — Wire Form Submissions to Lead Tracker Webhook

Currently `handleSubmit` only calls Formspree. Add a parallel fetch so both systems receive the lead.

**Add a `postToLeadTracker` helper in `tracking.js`:**

```js
// ===== ads-landing-page/src/utils/tracking.js =====

export function getLeadTrackerWebhook() {
  return import.meta.env.VITE_LEAD_TRACKER_WEBHOOK || ''
}

export function getLeadTrackerSecret() {
  return import.meta.env.VITE_LEAD_TRACKER_SECRET || ''
}

export async function postToLeadTracker(payload) {
  const endpoint = getLeadTrackerWebhook()
  const secret = getLeadTrackerSecret()
  if (!endpoint) return { ok: false, skipped: true, reason: 'no webhook URL configured' }

  try {
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }
    // Send the secret via the HEADER (preferred). Still accept query param as fallback.
    if (secret) headers['x-webhook-secret'] = secret

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })
    let data = null
    try { data = await res.json() } catch (_) {}
    return { ok: res.ok, status: res.status, data }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}
```

**Then update `handleSubmit` in `Home.jsx`** (around line 41) to call it. Also:
- Attach captured UTM data to the payload.
- Report Lead Tracker sync status to the user alongside the success message.
- Keep Formspree as the email fallback so even if the Lead Tracker is down, you get the lead.

```jsx
// ===== ads-landing-page/src/pages/Home.jsx — handleSubmit =====
import {
  trackTikTokEvent, identifyTikTokUser, getFormspreeEndpoint, getCalendlyUrl,
  getUTM, postToLeadTracker, // NEW imports
} from '../utils/tracking'

function Home() {
  // … keep existing state, add ONE extra state for sync status:
  const [leadTrackerStatus, setLeadTrackerStatus] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const form = formRef.current
    if (!form) return
    if (!form.checkValidity()) { form.reportValidity(); return }

    const formDataObj = new FormData(form)
    if (formDataObj.get('_gotcha')) { setFormSubmitted(true); return } // honeypot

    // NEW: Attach full attribution + metadata context
    const utm = getUTM()
    const payload = {
      name:    formDataObj.get('name'),
      email:   formDataObj.get('email'),
      company: formDataObj.get('company'),
      businessName: formDataObj.get('company'),   // Lead Tracker expects businessName
      business:     formDataObj.get('company'),
      phone:   formDataObj.get('email') ? '' : '(from ads landing form)',  // required field in tracker; phone not collected yet
      message: formDataObj.get('message'),
      budget:  formDataObj.get('budget'),
      source:  buildSourceFromUTM(utm),
      medium:  utm.utm_medium  || '',
      campaign:utm.utm_campaign|| '',
      adCreative: utm.utm_content || '',
      pageUrl:  window.location.href,
      referrer: document.referrer || null,
      location: 'ads_landing_contact_form',
      submittedAt: new Date().toISOString(),
      utm,
    }

    if (submitBtnRef.current) {
      submitBtnRef.current.disabled = true
      submitBtnRef.current.textContent = 'Sending...'
    }

    try {
      if (payload.email) await identifyTikTokUser(payload.email)

      // Run Formspree + Lead Tracker in parallel.
      const formspreePromise = fetch(getFormspreeEndpoint(), {
        method: 'POST',
        body: formDataObj,
        headers: { Accept: 'application/json' },
      })
      const trackerPromise = postToLeadTracker(payload)

      const [response, trackerResult] = await Promise.all([formspreePromise, trackerPromise])
      setLeadTrackerStatus(trackerResult)

      if (response.ok) {
        trackTikTokEvent('Lead', {
          content_name: 'Contact Form Submission',
          value: 0, currency: 'USD',
          utm_source: utm.utm_source, utm_campaign: utm.utm_campaign,
          fbclid: utm.fbclid, gclid: utm.gclid, ttclid: utm.ttclid,
        })
        // Also fire GA4 / Meta Lead events here if those pixels are wired up.
        // if (typeof window.gtag === 'function') window.gtag('event', 'generate_lead', { ...utm })
        // if (typeof window.fbq  === 'function') window.fbq('track', 'Lead',            { ...utm })

        setFormSubmitted(true)
        setFormData({ name: '', email: '', company: '', message: '', budget: '' })
        formRef.current?.reset()  // Also clear DOM inputs
      } else {
        let message = 'Submission failed'
        try { const data = await response.json(); if (data?.error) message = data.error } catch {}
        throw new Error(message)
      }
    } catch (error) {
      console.error('Form submission error:', error)
      // NEW: replace alert() with inline error state instead
      setInlineError(
        `Oops! There was a problem submitting your form. Please try again or email me directly at nwankwosami@gmail.com.`
      )
    } finally {
      if (submitBtnRef.current) {
        submitBtnRef.current.disabled = false
        submitBtnRef.current.textContent = "Let's Build Something Great 🚀"
      }
    }
  }
}

// Helper to match the Lead Tracker's buildSourceFromUTM format:
function buildSourceFromUTM(utm = {}) {
  const parts = []
  if (utm.utm_source)   parts.push(`Source: ${utm.utm_source}`)
  if (utm.utm_medium)   parts.push(`Medium: ${utm.utm_medium}`)
  if (utm.utm_campaign) parts.push(`Campaign: ${utm.utm_campaign}`)
  if (utm.fbclid) parts.push('Meta/Facebook Click')
  if (utm.gclid) parts.push('Google Click')
  if (utm.ttclid) parts.push('TikTok Click')
  return parts.join(' | ') || 'Ads Landing Page Form'
}
```

Finally, **update the success state UI** in the contact form to show whether the Lead Tracker sync succeeded:

```jsx
// ===== ads-landing-page/src/pages/Home.jsx — inside formSubmitted (line ~1021) =====
{formSubmitted ? (
  <div className="form-success">
    <div className="form-success__icon">✅</div>
    <h3 className="form-success__title">Message Sent Successfully!</h3>
    <p className="form-success__text">
      Thank you for reaching out. I've received your project details and will get back to you within 24 hours.
    </p>
    <p className="form-success__text" style={{ fontSize: '0.85rem' }}>
      {leadTrackerStatus?.ok && !leadTrackerStatus?.skipped
        ? '✓ Lead saved to SN TECH CRM — expect a follow-up shortly.'
        : leadTrackerStatus?.skipped
        ? 'ℹ️ CRM integration not configured (no webhook URL set).'
        : '⚠️ CRM sync pending — your lead is backed up via email.'}
    </p>
    <button type="button" className="btn btn--ghost" onClick={() => { setFormSubmitted(false); setLeadTrackerStatus(null) }}>
      Send Another Message
    </button>
  </div>
) : (
  // … existing form
)}
```

---

## 6. Step 4 — Append UTM to External Links (WhatsApp / Calendly)

Anywhere the user leaves the site to continue the conversation (WhatsApp, Calendly, the free guide WhatsApp CTA) — **carry attribution with them**. This is done in two ways:

### Option A: Append UTM params to the destination URL

Calendly natively reads `utm_*` parameters for routing + attribution. For WhatsApp, you add UTM data **inside the prefilled message text** (since wa.me URLs only accept `text`).

**Apply `appendUTMToUrl` to every Calendly link builder call:**

```jsx
// ===== ads-landing-page/src/pages/Home.jsx — handleCalendlyClick (line ~28) =====
const handleCalendlyClick = (e) => {
  e.preventDefault()
  trackTikTokEvent('ClickButton', { content_name: 'Calendly Booking Click', ...getUTM() })

  const calendlyUrlWithUTM = appendUTMToUrl(getCalendlyUrl())
  if (window.Calendly) {
    window.Calendly.initPopupWidget({ url: calendlyUrlWithUTM })
  } else {
    window.open(calendlyUrlWithUTM, '_blank', 'noopener,noreferrer')
  }
}
```

### Option B: Embed UTM inside the WhatsApp prefilled message body

For every `wa.me` link, include attribution lines in the prefilled text so when the message lands in your WhatsApp inbox, you know which ad drove it. Currently the hero WhatsApp link and the lead-magnet link are hardcoded strings — replace each one with a `buildWhatsAppLink()` helper:

```jsx
// ===== ads-landing-page/src/pages/Home.jsx — add near top =====
function buildWhatsAppLink(baseMessage, location = 'hero') {
  const utm = getUTM()
  const attributionLines = [
    `---`,
    `Source: ${location}`,
    utm.utm_campaign ? `Campaign: ${utm.utm_campaign}` : null,
    utm.utm_source   ? `UTM Source: ${utm.utm_source}` : null,
    utm.utm_medium   ? `UTM Medium: ${utm.utm_medium}` : null,
    utm.utm_content  ? `Creative: ${utm.utm_content}` : null,
    utm.fbclid       ? `fbclid: ${utm.fbclid}` : null,
    utm.gclid        ? `gclid: ${utm.gclid}` : null,
    utm.ttclid       ? `ttclid: ${utm.ttclid}` : null,
  ].filter(Boolean).join('\n')
  const full = `${baseMessage}\n\n${attributionLines}`
  return `https://wa.me/+2349020927884?text=${encodeURIComponent(full)}`
}

// Usage in hero (line ~265):
const heroWALink = buildWhatsAppLink(
  "Hi Samuel — I'm interested in discussing a project.",
  'hero_whatsapp'
)
// <a href={heroWALink} onClick={() => trackTikTokEvent('Contact', { content_name: 'Hero WhatsApp Click', ...getUTM() })}>

// Usage in lead-magnet card (line ~951):
const guideWALink = buildWhatsAppLink(
  "Hi Samuel — Please send me the Free Founder Architecture Guide.",
  'lead_magnet_whatsapp'
)
```

Also **track the click**: call `trackTikTokEvent('ClickButton', { content_name: 'WhatsApp Click', location, ...utm })` on every WhatsApp link `onClick`.

---

## 7. Step 5 — Pixels & Consent Mode

The landing page already has TikTok + (conditional) GA4/Google Ads. Here's what to add for the full multi-pixel setup that the campaign landing page uses:

### 7.1 Meta/Facebook Pixel

`ads-landing-page` has no Meta pixel at all yet. Copy `injectMetaPixel()` and `fbTrack()` from `campagin/landing-page/src/Pixels.jsx` and `tracking.js`, respectively, and add them:

1. **Add a `injectMetaPixel` function to `consent.js`** (pattern matches existing `injectTikTokPixel`).
2. **Add a `fbTrack` wrapper to `tracking.js`** with a queue (`window._fbqQueue`) so events fire correctly even if the pixel is still loading.
3. **Call both in `applyConsent('accepted')`** so Meta respects the consent banner choice.
4. **Add `VITE_META_PIXEL_ID` to `.env.example` and your `.env`.**

### 7.2 Fire all 4 pixels on key events

Create a **unified `track()` helper** in `tracking.js` so `handleSubmit` / `handleCalendlyClick` can call one function and every pixel fires:

```js
// ===== ads-landing-page/src/utils/tracking.js =====
export function track(eventName, params = {}) {
  const withUTM = { ...getUTM(), ...params }
  trackTikTokEvent(eventName, withUTM)
  // if (typeof window.gtag === 'function') window.gtag('event', eventName, withUTM)
  // if (typeof window.fbq  === 'function') window.fbq('track',  eventName, withUTM)
}
```

Key events you should track:
| Event | Fires when | Pixels that receive it |
|---|---|---|
| `PageView` / `ViewContent` | Page loads | All 4 (automatic from their base code + existing `trackTikTokEvent`) |
| `ClickButton` / `CTAClick` | Any CTA click (Calendly, WhatsApp, Book a Call, View Work) | All 4 |
| `Lead` / `FormSubmit` | Form submission success | All 4 + enhanced conversion (email hashing for Google/TikTok) |
| `Contact` | WhatsApp or direct email link click | All 4 |
| `Scroll50` / `Scroll90` | User scrolls to 50%/90% of page (optional, from campaign tracking.js) | All 4 |

### 7.3 Fix GA4 Consent Default (Critical for GDPR)

As flagged in the Code Review (Issue 3), `injectGoogleAnalytics` currently defaults consent to `granted` **before** the user accepts the banner. Change to:

```js
// ===== ads-landing-page/src/utils/consent.js — inside injectGoogleAnalytics (replace lines 82–87) =====
if (typeof window.gtag === 'function') {
  // Default to DENIED until user explicitly accepts
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
```

Then **add the `consent,update` call in `applyConsent()` for both accept and decline**:

```js
// ===== ads-landing-page/src/utils/consent.js — at top of applyConsent function =====
export function applyConsent(consentValue) {
  // Update Google consent-mode BEFORE loading pixels, so gtag sees the updated state
  if (typeof window?.gtag === 'function') {
    const granted = consentValue === 'accepted'
    window.gtag('consent', 'update', {
      ad_storage:          granted ? 'granted' : 'denied',
      analytics_storage:   granted ? 'granted' : 'denied',
      ad_user_data:        granted ? 'granted' : 'denied',
      ad_personalization:  granted ? 'granted' : 'denied',
    })
  }

  // … existing logic for injectGoogleAnalytics / injectTikTokPixel etc.
}
```

---

## 8. Step 6 — Testing & Verification

### 8.1 Verify UTM capture

Visit:
```
http://localhost:5173/?utm_source=tiktok&utm_campaign=q3_test&utm_content=ad_variant_a&ttclid=test123
```
Open DevTools → Application → Local Storage → `http://localhost:5173` → confirm `sn_utm_params` JSON contains all four values + `landing_page` and `timestamp`.

### 8.2 Verify Lead Tracker receives the webhook

1. In one terminal, **start the Lead Tracker API**:
   ```bash
   cd campagin/lead-tracker
   npm run dev:api   # Runs on :4000
   ```
2. In another terminal, **start the landing page**:
   ```bash
   cd ads-landing-page
   npm run dev       # Runs on :5173
   ```
3. Visit the URL above (with UTM params).
4. Fill in the contact form and submit.
5. In the Lead Tracker terminal, look for:
   ```
   [INFO] New landing lead received { leadId: "…", name: "…", campaign: "q3_test", source: "Source: tiktok | Campaign: q3_test | TikTok Click" }
   ```
6. Open the Lead Tracker Web CRM (`npm run dev:web` → http://localhost:5174), log in, and confirm:
   - Lead appears with status `NEW`.
   - Activity log shows `"Lead created from landing page (…)"`.
   - UTM fields, landing page URL, and referrer are all populated under **Attribution**.

### 8.3 Verify TikTok Pixel fires (Test Events tool)

1. Go to TikTok Ads Manager → Events Manager → Select your pixel → **Test Events**.
2. Enter your landing page URL (with `ttclid=test123`) and click **Open Website**.
3. The tool should show:
   - ✅ Base Pixel Code Detected
   - ✅ Event: `PageView` (from inline HTML load)
   - ✅ Event: `ViewContent` (from useEffect in Home.jsx)
   - Submit the form → see: ✅ Event: `Lead` + `SubmitForm` + `Contact` (3 events fired for conversions — this redundancy is intentional so TikTok's deduplication picks the best one).

### 8.4 Verify duplicate protection works

Immediately re-submit the same `name` + `email` + `company` within 60 seconds.
The response should contain `success: true, message: "Duplicate detected"`, and the CRM should not have a duplicate row.

### 8.5 Verify Calendly + WhatsApp links carry UTM

Click "Book Free Call" → inspect the URL in the Calendly popup or new tab → confirm `?utm_source=tiktok&utm_campaign=q3_test&…` is appended.

Click "Chat on WhatsApp" → in the WhatsApp web window that opens, the prefilled message should end with:
```
---
Source: hero_whatsapp
Campaign: q3_test
UTM Source: tiktok
Creative: ad_variant_a
ttclid: test123
```

---

## 9. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Webhook returns **401 "Invalid webhook secret"** | `VITE_LEAD_TRACKER_SECRET` doesn't match `WEBHOOK_SECRET` in the API's `.env`, or you're sending it as query string instead of header when header is strictly required by older versions. | Copy the value exactly. Verify with `curl`: <br>`curl -X POST $ENDPOINT -H "x-webhook-secret: $SECRET" -H "Content-Type: application/json" -d '{"name":"a","businessName":"b","phone":"+2340000000000"}'` |
| Webhook returns **400 "name, businessName, phone are required"** | Ads landing form doesn't collect phone, but the tracker webhook requires it. | Either (a) add a phone field to the form, or (b) send a placeholder `"(email-only lead)"` and note in the description that follow-up is via email — the current code above uses the placeholder `'(from ads landing form)'` for phone. |
| CORS error when posting to Lead Tracker | Dev API isn't setting CORS headers for `http://localhost:5173`, or `CORS_ORIGIN` env var is wrong. | In `campagin/lead-tracker/packages/api/.env` set `CORS_ORIGIN=*` for dev; for production set `CORS_ORIGIN=https://your-landing-domain.com`. |
| TikTok "Can't detect base code" | Consent mode starts with `holdConsent` and TikTok's test-events crawler doesn't click the banner. | The current `index.html` inline code already handles this by calling `ttq.grantConsent()` unless stored preference is `declined`. If it still fails, verify the pixel ID literal is still visible in `view-source:` (TikTok's verifier is a regex-based scanner and needs the literal ID). |
| UTM data is missing on leads | User was sent a shortlink/redirect that strips query params before landing, or `captureUTM()` was never called on the page they actually landed on. | Add `captureUTM()` to `CaseStudy.jsx` and `NotFound.jsx` too (not just Home). Use UTM passthrough in any redirect rules (Vercel, etc.). |
| GA4/Ads events show in debug but not in reports | Consent Mode v2 defaults are in "limited processing" state; user never clicked "Accept All" in testing. | In DevTools → Application → Local Storage, set `sn_cookie_consent_v1` to `{"value":"accepted","timestamp":…}` and reload. Also verify GA4 request payload has `gcs=G111` (full consent) vs `gcs=G100` (denied). |
| Form success but Lead Tracker says "pending" | `Promise.all([Formspree, LeadTracker])` — if the webhook call fails (network, CORS, 5xx), Formspree still succeeds. The UI should correctly flag this per the code in Step 3. | Fix the webhook endpoint and resend from your email backup copy. Honeypot duplicates will automatically be deduplicated on resubmission. |

---

## 10. Quick Checklist

Before sending paid traffic to the new landing page — tick every box:

- [ ] `.env` has `VITE_LEAD_TRACKER_WEBHOOK` + `VITE_LEAD_TRACKER_SECRET` set (matching API-side `WEBHOOK_SECRET`).
- [ ] `captureUTM()` and `storeClickId()` run on **every route mount** (Home + CaseStudy + NotFound).
- [ ] Form submission sends payload to **both** Formspree **and** Lead Tracker in parallel.
- [ ] Success UI displays Lead Tracker sync status.
- [ ] `buildSourceFromUTM()` correctly formats the `source` field so the Lead Tracker dashboard shows ad platform + campaign.
- [ ] WhatsApp links have attribution lines inside the prefilled `text=`.
- [ ] Calendly links have UTM appended via `appendUTMToUrl()`.
- [ ] All CTA clicks fire the corresponding pixel event in TikTok + GA4 + Meta.
- [ ] `injectGoogleAnalytics` uses **`'denied'` default consent**; `applyConsent` sends a `gtag('consent','update',…)` on accept/decline.
- [ ] Manual end-to-end test:
  - [ ] Visit landing page with `?utm_source=tiktok&utm_campaign=q3_test&ttclid=123`
  - [ ] Fill & submit form → check email inbox (Formspree) ✔
  - [ ] Check Lead Tracker web dashboard → new lead shows the campaign & click data ✔
  - [ ] TikTok Test Events shows PageView + ViewContent + Lead ✔
  - [ ] Click WhatsApp → prefilled message contains attribution block ✔
  - [ ] Click Calendly → URL has UTM params ✔
