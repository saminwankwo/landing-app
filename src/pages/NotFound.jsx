import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { setSeo } from '../seo'

function NotFound() {
  useEffect(() => {
    setSeo({
      title: 'Page Not Found | Samuel Nwankwo',
      description: 'Sorry, the page you are looking for does not exist. Use the links below to get back on track.',
      noIndex: true
    })
  }, [])

  return (
    <div>
      <header className="nav">
        <div className="nav__inner">
          <Link to="/" className="nav__logo" aria-label="Samuel Nwankwo home">
            <span className="nav__logo-icon">SN</span>
            <span>Samuel Nwankwo</span>
          </Link>
        </div>
      </header>

      <main className="section">
        <div className="container" style={{ textAlign: 'center' }}>
          <p className="section-eyebrow">404</p>
          <h1 className="section-title">Page not found</h1>
          <p className="section-desc" style={{ marginInline: 'auto' }}>
            The link is broken or the page has moved.
          </p>
          <div style={{ marginTop: 'var(--sp-8)', display: 'flex', justifyContent: 'center', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
            <Link to="/" className="btn btn--primary">Go Home</Link>
            <Link to="/#projects" className="btn btn--ghost">View Projects</Link>
          </div>
        </div>
      </main>
    </div>
  )
}

export default NotFound
