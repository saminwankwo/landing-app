import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { setSeo } from '../seo'

const WHATSAPP_LINK = 'https://wa.me/+2348058643829'

function handleCalendlyClick(e) {
  e.preventDefault()
  if (window.Calendly) {
    window.Calendly.initPopupWidget({
      url: 'https://calendly.com/nwankwosami/30min'
    })
  } else {
    window.open('https://calendly.com/nwankwosami/30min', '_blank')
  }
}

function CaseStudy() {
  const fadeElementsRef = useRef([])

  useEffect(() => {
    setSeo({
      title: 'Private Genealogy Web App Case Study | Samuel Nwankwo',
      description: 'Case study: a secure role-based genealogy collaboration platform with tree-level sharing, admin-safe access management, and data integrity protections.',
      path: '/case-studies/family-tree-platform',
      imagePath: '/Untitled.png',
      type: 'article',
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Private Genealogy Web App (Role-Based Collaboration)",
        "author": {
          "@type": "Person",
          "name": "Samuel Nwankwo"
        },
        "mainEntityOfPage": new URL('/case-studies/family-tree-platform', window.location.origin).toString(),
        "image": [new URL('/Untitled.png', window.location.origin).toString()]
      }
    })

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          observer.unobserve(entry.target)
        }
      })
    }, observerOptions)

    const elements = fadeElementsRef.current

    elements.forEach(el => {
      if (el) observer.observe(el)
    })

    return () => {
      elements.forEach(el => {
        if (el) observer.unobserve(el)
      })
    }
  }, [])

  return (
    <div>
      <header className="nav">
        <div className="nav__inner">
          <Link to="/" className="nav__logo">
            <span className="nav__logo-icon">SN</span>
            <span>Samuel Nwankwo</span>
          </Link>
          <nav className="nav__menu">
            <Link to="/#projects" className="nav__link">Back to Projects</Link>
            <a href="#" className="nav__link nav__link--cta calendly-trigger" onClick={handleCalendlyClick}>Book a Call</a>
          </nav>
        </div>
      </header>

      <main>
        <section className="case-study-hero">
          <div className="container">
            <Link to="/" className="back-link">← Back to Home</Link>
            <p className="section-eyebrow">Case Study</p>
            <h1 className="hero__title">Private Genealogy Web App (Role-Based Collaboration)</h1>
            <p className="hero__subtitle">A secure collaboration platform for relatives to build and share family trees with clear role boundaries and scoped access.</p>

            <div className="case-study-media fade-up" ref={el => fadeElementsRef.current.push(el)}>
              <video className="case-study-video" controls playsInline muted preload="metadata">
                <source src="/familyTree.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            <div className="fade-up" ref={el => fadeElementsRef.current.push(el)} style={{ marginTop: 'var(--sp-10)' }}>
              <div style={{ marginTop: 'var(--sp-6)' }}>
                <Link to="/#projects" className="btn btn--ghost">← Back to Projects</Link>
              </div>
            </div>
          </div>
        </section>

        <div className="container">
          <article className="case-study-content">
            <section className="case-study-section fade-up" ref={el => fadeElementsRef.current.push(el)}>
              <h2>Overview</h2>
              <p>A private client needed a secure way for relatives to collaborate on a shared family tree—without giving everyone the same level of control. I built a private genealogy web app with clear role boundaries, tree-level sharing, and safe admin tooling so the platform could scale to many viewers while staying secure and maintainable.</p>
            </section>

            <section className="case-study-section fade-up" ref={el => fadeElementsRef.current.push(el)}>
              <h2>The Challenge</h2>
              <ul className="check-list">
                <li>Multiple relatives needed access to the same genealogy data, but not everyone should be able to edit it.</li>
                <li>Sharing had to be scoped: some people should only view specific trees/branches.</li>
                <li>Admin workflows (grant/remove/reinstate access) needed to be reliable and safe.</li>
                <li>Data integrity had to be protected during user removal to avoid orphaned records and database errors.</li>
              </ul>
            </section>

            <section className="case-study-section fade-up" ref={el => fadeElementsRef.current.push(el)}>
              <h2>The Solution</h2>
              <p>I implemented a permission model that combined:</p>
              <ul className="check-list">
                <li><strong>Roles</strong> (owner, editor, viewer) for clear capability boundaries.</li>
                <li><strong>Tree-level sharing</strong> for scoped access where a user can be a viewer on specific trees without global permissions.</li>
              </ul>
              <p>This made collaboration simple: admins manage access confidently, editors contribute updates where allowed, and viewers browse safely with read-only guardrails.</p>
            </section>

            <section className="case-study-section fade-up" ref={el => fadeElementsRef.current.push(el)}>
              <h2>What I Built (Highlights)</h2>

              <h3>1) Role-based access control (RBAC)</h3>
              <ul className="check-list">
                <li>Owner and editor flows for administrative and content-management actions</li>
                <li>Viewer access enforced consistently across read-only views</li>
              </ul>

              <h3>2) Tree-level sharing</h3>
              <ul className="check-list">
                <li>Viewer access granted per tree (not “all or nothing”)</li>
                <li>A user can be treated as a viewer either via their role or via a viewer entry in the share table</li>
              </ul>

              <h3>3) Admin-safe access management</h3>
              <ul className="check-list">
                <li>Reliable POST action handling for access changes (grant/remove/reinstate)</li>
                <li>Reduced “it worked locally but not for users” issues caused by inconsistent form submission behavior</li>
              </ul>

              <h3>4) Safe hard-deletion with dependency cleanup</h3>
              <ul className="check-list">
                <li>Implemented deletion behavior that avoids foreign key failures by cleaning up dependent records and nulling references where required</li>
                <li>Prevented broken histories and integrity issues when removing users</li>
              </ul>
            </section>

            <section className="case-study-section fade-up" ref={el => fadeElementsRef.current.push(el)}>
              <h2>Outcomes (Public-Safe)</h2>
              <ul className="check-list">
                <li><strong>Stronger security posture:</strong> read-only users can’t accidentally (or intentionally) modify data.</li>
                <li><strong>Cleaner collaboration:</strong> families can invite more participants without compromising privacy.</li>
                <li><strong>More maintainable backend:</strong> centralized permission checks reduced logic duplication and made the system easier to extend.</li>
                <li><strong>Operational confidence:</strong> admins can manage access and remove users without database integrity errors.</li>
              </ul>
            </section>

            <section className="case-study-section fade-up" ref={el => fadeElementsRef.current.push(el)}>
              <h2>Tech Stack</h2>
              <div className="tech-grid">
                <div className="tech-item">PHP</div>
                <div className="tech-item">MySQL</div>
                <div className="tech-item">HTML/CSS + JavaScript</div>
                <div className="tech-item">Local development on XAMPP</div>
              </div>
            </section>

            <section className="case-study-section fade-up" ref={el => fadeElementsRef.current.push(el)}>
              <h2>Why This Matters (For Businesses Too)</h2>
              <p>Permission mistakes are one of the fastest ways to lose trust in a collaboration product. This project shows how to design access control that is:</p>
              <ul className="check-list">
                <li>clear for users,</li>
                <li>safe for admins,</li>
                <li>and maintainable for the long term.</li>
              </ul>
            </section>

            <section className="case-study-section fade-up" ref={el => fadeElementsRef.current.push(el)}>
              <h2>Contact (Fastest)</h2>
              <p>
                <strong>Chat on WhatsApp:</strong>{' '}
                <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer">{WHATSAPP_LINK}</a>
              </p>
              <p><strong>Prefill message (optional):</strong></p>
              <pre style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 'var(--sp-6)', overflow: 'auto' }}>
                <code>Hi Samuel — I’m interested in building a [web app / internal tool / API]. Timeline: [X]. Budget range: [Y]. Can we discuss next steps?</code>
              </pre>
            </section>

            <section className="case-study-section fade-up" ref={el => fadeElementsRef.current.push(el)} style={{ textAlign: 'center', marginTop: 'var(--sp-16)' }}>
              <h2>Want to build something similar?</h2>
              <p>Share what you’re building and I’ll respond with a clear next-step plan.</p>
              <a href={WHATSAPP_LINK} className="btn btn--primary btn--lg" target="_blank" rel="noreferrer">Message on WhatsApp</a>
              <div style={{ marginTop: 'var(--sp-6)' }}>
                <a href="#" className="btn btn--secondary btn--lg calendly-trigger" onClick={handleCalendlyClick}>Or book a call</a>
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
