import { useEffect, useState } from 'react'
import {
  applyConsent,
  getStoredConsent,
  storeConsent,
} from '../utils/consent'

export default function PrivacyPreferences() {
  const [visible, setVisible] = useState(() => {
    const existing = getStoredConsent()
    return !(existing?.value === 'accepted' || existing?.value === 'declined')
  })

  useEffect(() => {
    const existing = getStoredConsent()
    if (existing?.value === 'accepted') {
      applyConsent('accepted')
    }
  }, [])

  if (!visible) return null

  const accept = () => {
    storeConsent('accepted')
    applyConsent('accepted')
    setVisible(false)
  }

  const decline = () => {
    storeConsent('declined')
    applyConsent('declined')
    setVisible(false)
  }

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Privacy preferences"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9998,
        padding: '0.75rem',
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        className="privacy-banner"
        style={{
          pointerEvents: 'auto',
          maxWidth: 'min(960px, calc(100vw - 1.5rem))',
          width: '100%',
          background: 'var(--bg-card, hsl(222, 16%, 14%))',
          color: 'var(--text-100, hsl(210, 20%, 96%))',
          border: '1px solid var(--border-accent, hsla(172, 60%, 50%, 0.3))',
          borderRadius: 'var(--radius-lg, 20px)',
          padding: '1rem 1.25rem',
          boxShadow: '0 24px 80px hsla(0,0%,0%,0.45)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <div aria-hidden="true" style={{ fontSize: '1.25rem', lineHeight: 1 }}>
            🔒
          </div>
          <div>
            <p
              style={{
                fontWeight: 700,
                marginBottom: '0.25rem',
                fontFamily: "var(--font-sans, 'Inter', system-ui, sans-serif)",
                fontSize: '0.92rem',
              }}
            >
              We value your privacy
            </p>
            <p
              style={{
                fontSize: '0.82rem',
                color: 'var(--text-200, hsl(210, 15%, 75%))',
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              We use analytics storage and similar technologies to measure traffic,
              understand how visitors use this site, and run our advertising campaigns.
              You can accept, decline, or change your choice at any time. Your data
              will never be sold.
            </p>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
          }}
        >
          <button
            type="button"
            onClick={decline}
            className="btn btn--ghost"
            style={{ fontSize: '0.85rem', padding: 'var(--sp-2) var(--sp-4)', flex: '1 1 auto' }}
            aria-label="Allow only necessary storage"
          >
            Only Necessary
          </button>
          <button
            type="button"
            onClick={accept}
            className="btn btn--primary"
            style={{ fontSize: '0.85rem', padding: 'var(--sp-2) var(--sp-4)', flex: '1 1 auto' }}
            autoFocus
            aria-label="Allow analytics and advertising storage"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  )
}
