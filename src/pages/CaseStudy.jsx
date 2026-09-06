import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { setSeo } from '../seo'
import { getCalendlyUrl } from '../utils/tracking'

const WHATSAPP_LINK = 'https://wa.me/+2349020927884'
const WHATSAPP_PREFILLED_MESSAGE =
  "Hi Samuel — I’m interested in building a [web app / internal tool / API]. Timeline: [X]. Budget range: [Y]. Can we discuss next steps?"
const WHATSAPP_PREFILLED_LINK = `${WHATSAPP_LINK}?text=${encodeURIComponent(
  WHATSAPP_PREFILLED_MESSAGE,
)}`

function handleCalendlyClick(e) {
  e.preventDefault()
  const calendlyUrl = getCalendlyUrl()
  if (window.Calendly) {
    window.Calendly.initPopupWidget({ url: calendlyUrl })
  } else {
    window.open(calendlyUrl, '_blank', 'noopener,noreferrer')
  }
}

function CaseStudy() {
  const pageRootRef = useRef(null)

  useEffect(() => {
    setSeo({
      title: 'Private Genealogy Web App Case Study | Samuel Nwankwo',
      description:
        'Case study: a secure role-based genealogy collaboration platform with tree-level sharing, admin-safe access management, and data integrity protections.',
      path: '/case-studies/family-tree-platform',
      imagePath: '/familytree.png',
      type: 'article',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Private Genealogy Web App (Role-Based Collaboration)',
        author: {
          '@type': 'Person',
          name: 'Samuel Nwankwo',
        },
        mainEntityOfPage: new URL(
          '/case-studies/family-tree-platform',
          window.location.origin,
        ).toString(),
        image: [
          new URL('/familytree.png', window.location.origin).toString(),
        ],
      },
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
    <div ref={pageRootRef}>
      <header className="nav">
        <div className="nav__inner">
          <Link to="/" className="nav__logo">
            <span className="nav__logo-icon">SN</span>
            <span>Samuel Nwankwo</span>
          </Link>
          <nav className="nav__menu">
            <Link to="/#projects" className="nav__link">
              Back to Projects
            </Link>
            <a
              href={getCalendlyUrl()}
              className="nav__link nav__link--cta calendly-trigger"
              onClick={handleCalendlyClick}
            >
              Book a Call
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section className="case-study-hero">
          <div className="container">
            <Link to="/" className="back-link">
              ← Back to Home
            </Link>
            <p className="section-eyebrow">Case Study</p>
            <h1 className="hero__title">
              Private Genealogy Web App (Role-Based Collaboration)
            </h1>
            <p>
              A secure collaboration platform for relatives to build and share
              family trees with clear role boundaries and scoped access.
            </p>

            <div className="case-study-media fade-up">
              <video
                className="case-study-video"
                controls
                playsInline
                muted
                preload="metadata"
                aria-label="Genealogy platform walkthrough video"
              >
                <source src="/familyTree.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            <div
              className="fade-up"
              style={{ marginTop: 'var(--sp-10)' }}
            >
              <div style={{ marginTop: 'var(--sp-6)' }}>
                <Link to="/#projects" className="btn btn--ghost">
                  ← Back to Projects
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="container">
          <article className="case-study-content">
            <section className="case-study-section fade-up">
              <h2>Overview</h2>
              <p>
                A private client needed a secure way for relatives to
                collaborate on a shared family tree—without giving everyone
                the same level of control. I built a private genealogy web app
                with clear role boundaries, tree-level sharing, and safe admin
                tooling so the platform could scale to many viewers while
                staying secure and maintainable.
              </p>
            </section>

            <section className="case-study-section fade-up">
              <h2>The Challenge</h2>
              <ul className="check-list">
                <li>
                  Multiple relatives needed access to the same genealogy data,
                  but not everyone should be able to edit it.
                </li>
                <li>
                  Sharing had to be scoped: some people should only view
                  specific trees/branches.
                </li>
                <li>
                  Admin workflows (grant/remove/reinstate access) needed to be
                  reliable and safe.
                </li>
                <li>
                  Data integrity had to be protected during user removal to
                  avoid orphaned records and database errors.
                </li>
              </ul>
            </section>

            <section className="case-study-section fade-up">
              <h2>The Solution</h2>
              <p>I implemented a permission model that combined:</p>
              <ul className="check-list">
                <li>
                  <strong>Roles</strong> (owner, editor, viewer) for clear
                  capability boundaries.
                </li>
                <li>
                  <strong>Tree-level sharing</strong> for scoped access where
                  a user can be a viewer on specific trees without global
                  permissions.
                </li>
              </ul>
              <p>
                This made collaboration simple: admins manage access
                confidently, editors contribute updates where allowed, and
                viewers browse safely with read-only guardrails.
              </p>
            </section>

            <section className="case-study-section fade-up">
              <h2>What I Built (Highlights)</h2>

              <h3>1) Role-based access control (RBAC)</h3>
              <ul className="check-list">
                <li>
                  Owner and editor flows for administrative and
                  content-management actions
                </li>
                <li>Viewer access enforced consistently across read-only views</li>
              </ul>

              <h3>2) Tree-level sharing</h3>
              <ul className="check-list">
                <li>Viewer access granted per tree (not “all or nothing”)</li>
                <li>
                  A user can be treated as a viewer either via their role or
                  via a viewer entry in the share table
                </li>
              </ul>

              <h3>3) Admin-safe access management</h3>
              <ul className="check-list">
                <li>
                  Reliable POST action handling for access changes
                  (grant/remove/reinstate)
                </li>
                <li>
                  Reduced “it worked locally but not for users” issues caused
                  by inconsistent form submission behavior
                </li>
              </ul>

              <h3>4) Safe hard-deletion with dependency cleanup</h3>
              <ul className="check-list">
                <li>
                  Implemented deletion behavior that avoids foreign key
                  failures by cleaning up dependent records and nulling
                  references where required
                </li>
                <li>
                  Prevented broken histories and integrity issues when
                  removing users
                </li>
              </ul>
            </section>

            <section className="case-study-section fade-up">
              <h2>Outcomes (Public-Safe)</h2>
              <ul className="check-list">
                <li>
                  <strong>Stronger security posture:</strong> read-only users
                  can’t accidentally (or intentionally) modify data.
                </li>
                <li>
                  <strong>Cleaner collaboration:</strong> families can invite
                  more participants without compromising privacy.
                </li>
                <li>
                  <strong>More maintainable backend:</strong> centralized
                  permission checks reduced logic duplication and made the
                  system easier to extend.
                </li>
                <li>
                  <strong>Operational confidence:</strong> admins can manage
                  access and remove users without database integrity errors.
                </li>
              </ul>
            </section>

            <section className="case-study-section fade-up">
              <h2>Tech Stack</h2>
              <div className="tech-grid">
                <div className="tech-item">PHP</div>
                <div className="tech-item">MySQL</div>
                <div className="tech-item">HTML/CSS + JavaScript</div>
                <div className="tech-item">Local development on XAMPP</div>
              </div>
            </section>

            <section className="case-study-section fade-up">
              <h2>Why This Matters (For Businesses Too)</h2>
              <p>
                Permission mistakes are one of the fastest ways to lose trust
                in a collaboration product. This project shows how to design
                access control that is:
              </p>
              <ul className="check-list">
                <li>clear for users,</li>
                <li>safe for admins,</li>
                <li>and maintainable for the long term.</li>
              </ul>
            </section>

            <section className="case-study-section fade-up">
              <h2>Contact (Fastest)</h2>
              <p style={{ marginBottom: 'var(--sp-4)' }}>
                Reach out directly on WhatsApp for immediate project inquiries or quick consultations.
              </p>
              <div style={{ marginBottom: 'var(--sp-6)' }}>
                <a
                  href={WHATSAPP_PREFILLED_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--lg"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'var(--sp-3)',
                    background: 'linear-gradient(135deg, #25D366, #128C7E)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: '600',
                    boxShadow: '0 4px 20px rgba(37, 211, 102, 0.25)',
                    transition: 'transform var(--duration) var(--ease), box-shadow var(--duration) var(--ease)',
                  }}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.705 1.754zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                  Chat on WhatsApp
                </a>
              </div>
              <p>
                <strong>Prefill message template (optional):</strong>
              </p>
              <pre
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--sp-6)',
                  overflow: 'auto',
                }}
              >
                <code>
                  {WHATSAPP_PREFILLED_MESSAGE}
                </code>
              </pre>
            </section>

            <section
              className="case-study-section fade-up"
              style={{ textAlign: 'center', marginTop: 'var(--sp-16)' }}
            >
              <h2>Want to build something similar?</h2>
              <p>
                Share what you’re building and I’ll respond with a clear
                next-step plan.
              </p>
              <a
                href={WHATSAPP_PREFILLED_LINK}
                className="btn btn--primary btn--lg"
                target="_blank"
                rel="noopener noreferrer"
              >
                Message on WhatsApp
              </a>
              <div style={{ marginTop: 'var(--sp-6)' }}>
                <a
                  href={getCalendlyUrl()}
                  className="btn btn--ghost btn--lg calendly-trigger"
                  onClick={handleCalendlyClick}
                >
                  Or book a call
                </a>
              </div>
            </section>
          </article>
        </div>
      </main>

      <footer className="footer">
        <div className="container footer__bottom">
          <p>© 2026 Samuel Nwankwo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default CaseStudy
