import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { setSeo } from '../seo'

function NotFound() {
  const pageRootRef = useRef(null)

  useEffect(() => {
    setSeo({
      title: 'Page Not Found | Samuel Nwankwo',
      description:
        'Sorry, the page you are looking for does not exist. Use the links below to get back on track.',
      noIndex: true,
    })

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          observer.unobserve(entry.target)
        }
      })
    }, observerOptions)

    const root = pageRootRef.current
    const elements = root ? root.querySelectorAll('.fade-up') : []
    elements.forEach((el) => observer.observe(el))

    return () => {
      elements.forEach((el) => observer.unobserve(el))
      observer.disconnect()
    }
  }, [])

  return (
    <div ref={pageRootRef} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="nav">
        <div className="nav__inner">
          <Link to="/" className="nav__logo" aria-label="Samuel Nwankwo home">
            <span className="nav__logo-icon">SN</span>
            <span>Samuel Nwankwo</span>
          </Link>
          <nav className="nav__menu" aria-label="404 navigation">
            <Link to="/#projects" className="nav__link">
              Projects
            </Link>
            <Link to="/#contact" className="nav__link nav__link--cta">
              Get In Touch
            </Link>
          </nav>
        </div>
      </header>

      <main className="section" style={{ flex: 1, display: 'grid', placeItems: 'center' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr)',
              gap: 'var(--sp-12)',
              maxWidth: '820px',
              marginInline: 'auto',
              textAlign: 'center',
            }}
          >
            <div
              className="fade-up"
              style={{
                position: 'relative',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'radial-gradient(ellipse at center, var(--primary-glow) 0%, transparent 65%)',
                  filter: 'blur(30px)',
                  opacity: 0.55,
                  pointerEvents: 'none',
                }}
              />
              <div
                aria-label="Error code 404"
                style={{
                  position: 'relative',
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 800,
                  fontSize: 'clamp(6rem, 20vw, 14rem)',
                  lineHeight: 1,
                  letterSpacing: '-0.04em',
                  background:
                    'linear-gradient(180deg, var(--primary) 0%, var(--primary-dark) 55%, hsl(220, 60%, 55%) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: '0 2px 80px var(--primary-glow)',
                }}
              >
                404
              </div>
            </div>

            <div>
              <p className="section-eyebrow fade-up">Lost in the code</p>
              <h1
                className="fade-up"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(2rem, 4.5vw, 3rem)',
                  fontWeight: 700,
                  lineHeight: 1.18,
                  marginBottom: 'var(--sp-5)',
                }}
              >
                This page went on a
                <span className="text-gradient"> coffee break</span>
              </h1>
              <p
                className="fade-up fade-up--delay"
                style={{
                  fontSize: 'clamp(1rem, 1.6vw, 1.12rem)',
                  color: 'var(--text-200)',
                  lineHeight: 1.75,
                  maxWidth: '560px',
                  marginInline: 'auto',
                  marginBottom: 'var(--sp-10)',
                }}
              >
                The URL you followed doesn&apos;t match any page on this site — it
                may have been moved, renamed, or mistyped. Let&apos;s get you back to
                building something great.
              </p>

              <div
                className="fade-up fade-up--delay"
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 'var(--sp-4)',
                  flexWrap: 'wrap',
                  marginBottom: 'var(--sp-12)',
                }}
              >
                <Link to="/" className="btn btn--primary btn--lg">
                  🏠 Back to Home
                </Link>
                <Link to="/#projects" className="btn btn--ghost btn--lg">
                  View My Work →
                </Link>
              </div>

              <div
                className="fade-up"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 'var(--sp-3)',
                  maxWidth: '640px',
                  marginInline: 'auto',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    padding: 'var(--sp-4) var(--sp-5)',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>
                    🚀
                  </div>
                  <strong
                    style={{
                      display: 'block',
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      marginBottom: '0.15rem',
                    }}
                  >
                    See what I build
                  </strong>
                  <Link
                    to="/#projects"
                    style={{ fontSize: '0.85rem', color: 'var(--primary)' }}
                  >
                    Browse projects →
                  </Link>
                </div>
                <div
                  style={{
                    padding: 'var(--sp-4) var(--sp-5)',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>
                    🛠
                  </div>
                  <strong
                    style={{
                      display: 'block',
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      marginBottom: '0.15rem',
                    }}
                  >
                    Services I offer
                  </strong>
                  <Link
                    to="/#services"
                    style={{ fontSize: '0.85rem', color: 'var(--primary)' }}
                  >
                    Explore services →
                  </Link>
                </div>
                <div
                  style={{
                    padding: 'var(--sp-4) var(--sp-5)',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>
                    📅
                  </div>
                  <strong
                    style={{
                      display: 'block',
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      marginBottom: '0.15rem',
                    }}
                  >
                    Book a free call
                  </strong>
                  <Link
                    to="/#contact"
                    style={{ fontSize: '0.85rem', color: 'var(--primary)' }}
                  >
                    Let&apos;s talk →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="container footer__bottom">
          <p>© {new Date().getFullYear()} Samuel Nwankwo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default NotFound
