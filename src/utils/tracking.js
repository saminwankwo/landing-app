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
  if (!window?.ttq) return
  try {
    window.ttq.track(eventName, {
      contents: [
        {
          content_id: properties.content_id || 'landing_page',
          content_type: properties.content_type || 'product',
          content_name: properties.content_name || 'Samuel Nwankwo Portfolio',
        },
      ],
      value: typeof properties.value === 'number' ? properties.value : 0,
      currency: properties.currency || 'USD',
    })
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
