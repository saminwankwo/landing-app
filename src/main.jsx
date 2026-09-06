import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import App from './App.jsx'
import { ensureTikTokPixelLoaded } from './utils/consent.js'

// Load TikTok Pixel immediately on page load (before React renders)
// so TikTok's crawler / Pixel Helper can detect base code even before
// consent banner interaction. Consent is handled via holdConsent/grantConsent
// inside injectTikTokPixel — GDPR compliant but verifiable.
ensureTikTokPixelLoaded()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
