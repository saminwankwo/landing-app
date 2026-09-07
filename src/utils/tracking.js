export async function hashString(string) {
  try {
    if (!string || typeof crypto === 'undefined' || !crypto?.subtle?.digest) {
      return ''
    }
    const msgUint8 = new TextEncoder().encode(String(string))
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    return hashHex
  } catch {
    return ''
  }
}

export function trackTikTokEvent(eventName, properties = {}) {
  if (!window?.ttq) {
    try { console.warn('[TikTok] ttq not ready for', eventName) } catch {}
    return
  }
  try {
    // Fire as standard + custom to ensure TikTok captures it even if one name is filtered
    // TikTok standard lead events: Contact, SubmitForm, Lead — we fire all that apply
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
    // For form submissions, also fire canonical TikTok lead events so dashboard shows them
    if (eventName === 'Lead') {
      try { window.ttq.track('SubmitForm', payload) } catch {}
      try { window.ttq.track('Contact', payload) } catch {}
    }
    if (eventName === 'ViewContent') {
      // ViewContent is standard — also log for debug
      try { if (window.ttq.debug) window.ttq.debug(true) } catch {}
    }
  } catch {
    /* tracking must never break user flow */
  }
}

export async function identifyTikTokUser(email) {
  if (!email || !window?.ttq) return
  try {
    const hashed = await hashString(email.trim().toLowerCase())
    if (hashed) {
      window.ttq.identify({ email: hashed })
    }
  } catch {
    /* tracking must never break user flow */
  }
}

export function getCalendlyUrl() {
  return import.meta.env.VITE_CALENDLY_URL || 'https://calendly.com/nwankwosami/30min'
}

export function getFormspreeEndpoint() {
  return import.meta.env.VITE_FORMSPREE_ENDPOINT || 'https://formspree.io/f/mqejjvpy'
}
