import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { setSeo } from '../seo'
import {
  getCalendlyUrl,
  getFormspreeEndpoint,
  identifyTikTokUser,
  trackTikTokEvent,
} from '../utils/tracking'

function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
    budget: '',
  })

  const pageRootRef = useRef(null)
  const formRef = useRef(null)
  const submitBtnRef = useRef(null)
  const calendlyUrl = getCalendlyUrl()
  const formspreeEndpoint = getFormspreeEndpoint()

  const handleCalendlyClick = (e) => {
    e.preventDefault()
    trackTikTokEvent('ClickButton', {
      content_name: 'Calendly Booking Click',
    })

    if (window.Calendly) {
      window.Calendly.initPopupWidget({ url: calendlyUrl })
    } else {
      window.open(calendlyUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const form = formRef.current
    if (!form) return

    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }

    const formDataObj = new FormData(form)

    // Honeypot check to silently drop bot spam
    if (formDataObj.get('_gotcha')) {
      setFormSubmitted(true)
      return
    }

    const email = formDataObj.get('email')

    if (submitBtnRef.current) {
      submitBtnRef.current.disabled = true
      submitBtnRef.current.textContent = 'Sending...'
    }

    try {
      if (email) {
        await identifyTikTokUser(email)
      }

      const response = await fetch(formspreeEndpoint, {
        method: 'POST',
        body: formDataObj,
        headers: {
          Accept: 'application/json',
        },
      })

      if (response.ok) {
        trackTikTokEvent('Lead', {
          content_name: 'Contact Form Submission',
          value: 0,
          currency: 'USD',
        })
        setFormSubmitted(true)
        setFormData({
          name: '',
          email: '',
          company: '',
          message: '',
          budget: '',
        })
      } else {
        let message = 'Submission failed'
        try {
          const data = await response.json()
          if (data?.error) message = data.error
        } catch {
          /* noop */
        }
        throw new Error(message)
      }
    } catch (error) {
      if (typeof console !== 'undefined') {
        console.error('Form submission error:', error)
      }
      alert(
        'Oops! There was a problem submitting your form. Please try again or email me directly at nwankwosami@gmail.com.',
      )
    } finally {
      if (submitBtnRef.current) {
        submitBtnRef.current.disabled = false
        submitBtnRef.current.textContent = "Let's Build Something Great 🚀"
      }
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  useEffect(() => {
    setSeo({
      title: 'Samuel Nwankwo · Full-Stack Developer & Software Engineer',
      description:
        'Samuel Nwankwo — Full-Stack Developer specializing in scalable web applications, APIs, business platforms, and complex systems. Book a free consultation.',
      path: '/',
      imagePath: '/familytree.png',
      type: 'website',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: 'Samuel Nwankwo',
          jobTitle: 'Full-Stack Developer',
          url: new URL('/', window.location.origin).toString(),
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Samuel Nwankwo',
          url: new URL('/', window.location.origin).toString(),
        },
      ],
    })

    trackTikTokEvent('ViewContent', {
      content_name: document.title,
      content_type: 'product',
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

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => {
      const next = !prev
      document.body.style.overflow = next ? 'hidden' : ''
      return next
    })
  }

  const closeMobileMenu = () => {
    if (mobileMenuOpen) {
      setMobileMenuOpen(false)
      document.body.style.overflow = ''
    }
  }

  return (
    <div ref={pageRootRef}>
      <header className={`nav ${mobileMenuOpen ? 'nav--mobile-open' : ''}`} id="top">
        <div className="nav__inner">
          <a href="#top" className="nav__logo" aria-label="Samuel Nwankwo home">
            <span className="nav__logo-icon">SN</span>
            <span>Samuel Nwankwo</span>
          </a>
          <button
            className={`nav__burger ${mobileMenuOpen ? 'open' : ''}`}
            aria-label="Toggle navigation"
            aria-expanded={mobileMenuOpen}
            onClick={toggleMobileMenu}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <nav
            className={`nav__menu ${mobileMenuOpen ? 'mobile-open' : ''}`}
            aria-label="Main navigation"
          >
            <a href="#hero" className="nav__link" onClick={closeMobileMenu}>
              Home
            </a>
            <a
              href="#projects"
              className="nav__link"
              onClick={closeMobileMenu}
            >
              Projects
            </a>
            <a
              href="#services"
              className="nav__link"
              onClick={closeMobileMenu}
            >
              Services
            </a>
            <a
              href="#process"
              className="nav__link"
              onClick={closeMobileMenu}
            >
              Process
            </a>
            <a href="#about" className="nav__link" onClick={closeMobileMenu}>
              About
            </a>
            <a
              href={calendlyUrl}
              className="nav__link nav__link--cta calendly-trigger"
              onClick={handleCalendlyClick}
            >
              Book a Call
            </a>
          </nav>
        </div>
      </header>

      <section id="hero" className="hero section">
        <div className="container hero__grid">
          <div className="hero__content fade-up">
            <div className="hero__badge">🚀 Available for New Projects</div>
            <h1 className="hero__title">
              Turn Your App Idea Into a
              <span className="text-gradient"> Scalable SaaS Platform</span>
            </h1>
            <p className="hero__subtitle">
              Full-Stack Engineering & Backend Architecture — Built Fast, Scaled Securely. Specializing in Web Applications, APIs, and Custom Systems.
            </p>
            <div className="hero__actions">
              <a
                href="https://wa.me/+2349020927884?text=Hi%20Samuel%20%E2%80%94%20I'm%20interested%20in%20discussing%20a%20project."
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
                style={{
                  background: 'linear-gradient(135deg, #25D366, #128C7E)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: '600',
                  boxShadow: '0 4px 20px rgba(37, 211, 102, 0.25)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--sp-2)',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.705 1.754zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                Chat on WhatsApp
              </a>
              <a
                href={calendlyUrl}
                className="btn btn--primary calendly-trigger"
                onClick={handleCalendlyClick}
              >
                📅 Book Free Call
              </a>
              <a href="#projects" className="btn btn--ghost">
                View Work →
              </a>
            </div>
            <div className="hero__guarantees" style={{ marginTop: 'var(--sp-4)', display: 'flex', gap: 'var(--sp-4)', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-200)' }}>
              <span>🔒 <strong>100% Code Ownership</strong></span>
              <span>⏱️ <strong>Milestone Payments</strong></span>
              <span>🛡️ <strong>30-Day Support Guarantee</strong></span>
            </div>
            <ul className="hero__pills" aria-label="Expertise areas" style={{ marginTop: 'var(--sp-5)' }}>
              <li className="pill">6+ Years Experience</li>
              <li className="pill">Full-Stack Development</li>
              <li className="pill">Backend Architecture</li>
              <li className="pill">API Development</li>
            </ul>
          </div>

          <div className="hero__visual fade-up fade-up--delay">
            <div className="hero__img-wrap">
              <div className="hero__img-glow"></div>
              <img
                src="/familytree.png"
                alt="Interactive Family Tree Platform — a complex multi-generational visualization system built by Samuel Nwankwo"
                className="hero__img"
                width="620"
                height="440"
                decoding="async"
                fetchPriority="high"
              />
              <div className="hero__img-badge">
                <span>🌳</span>
                <div>
                  <strong>Family Tree Platform</strong>
                  <small>Featured Project</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="stats-bar fade-up">
            <div className="stats-bar__item">
              <span className="stats-bar__num">6+</span>
              <span className="stats-bar__label">Years Experience</span>
            </div>
            <div className="stats-bar__divider"></div>
            <div className="stats-bar__item">
              <span className="stats-bar__num">30+</span>
              <span className="stats-bar__label">Projects Delivered</span>
            </div>
            <div className="stats-bar__divider"></div>
            <div className="stats-bar__item">
              <span className="stats-bar__num">100%</span>
              <span className="stats-bar__label">Client Satisfaction</span>
            </div>
            <div className="stats-bar__divider"></div>
            <div className="stats-bar__item">
              <span className="stats-bar__num">5</span>
              <span className="stats-bar__label">Tech Stacks</span>
            </div>
          </div>
        </div>
      </section>

      <section id="projects" className="section featured-project">
        <div className="container">
          <div className="section-header fade-up">
            <p className="section-eyebrow">Featured Project</p>
            <h2 className="section-title">Interactive Family Tree Platform</h2>
            <p className="section-desc">
              A complex multi-generational relationship management system built
              to handle thousands of family records.
            </p>
          </div>

          <div className="project-showcase fade-up">
            <div className="project-showcase__img-wrap">
              <video
                src="/familyTree.mp4"
                className="project-showcase__video"
                controls
                playsInline
                muted
                preload="metadata"
                poster="/familytree.png"
                aria-label="Family Tree Platform video demo"
                width="620"
                height="349"
              >
                Your browser does not support the video tag.
              </video>
              <div className="project-showcase__overlay">
                <div className="tech-stack">
                  <span className="tech-tag">Node.js</span>
                  <span className="tech-tag">PHP</span>
                  <span className="tech-tag">Laravel</span>
                  <span className="tech-tag">React</span>
                  <span className="tech-tag">MySQL</span>
                  <span className="tech-tag">REST APIs</span>
                </div>
              </div>
            </div>

            <div className="project-breakdown">
              <div className="breakdown-card fade-up">
                <div className="breakdown-card__icon">⚡</div>
                <h3>Challenge</h3>
                <p>
                  Design a platform capable of handling complex family
                  relationships across multiple generations — with real-time
                  updates, fast search, and a deeply intuitive visual
                  interface.
                </p>
              </div>
              <div className="breakdown-card fade-up">
                <div className="breakdown-card__icon">🛠</div>
                <h3>Solution</h3>
                <ul className="check-list">
                  <li>Dynamic node-based visualization</li>
                  <li>Multi-generational relationship mapping</li>
                  <li>Full-text search across records</li>
                  <li>Granular user role management</li>
                  <li>Scalable REST API backend</li>
                  <li>Optimized DB queries for large trees</li>
                </ul>
              </div>
              <div className="breakdown-card breakdown-card--outcome fade-up">
                <div className="breakdown-card__icon">🏆</div>
                <h3>Outcome</h3>
                <p>
                  A highly interactive platform capable of managing tens of
                  thousands of family records while maintaining sub-200ms
                  response times and an intuitive, accessible UX.
                </p>
              </div>
              <div className="fade-up" style={{ marginTop: 'var(--sp-4)' }}>
                <Link
                  to="/case-studies/family-tree-platform"
                  className="btn btn--ghost btn--full"
                >
                  Read Full Case Study →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="section services">
        <div className="container">
          <div className="section-header fade-up">
            <p className="section-eyebrow">What I Do</p>
            <h2 className="section-title">Services</h2>
            <p className="section-desc">
              End-to-end development services tailored to your business goals —
              not just requirements.
            </p>
          </div>

          <div className="services__grid">
            <article
              className="service-card fade-up"
              style={{ '--delay': '0s' }}
            >
              <div className="service-card__icon">🖥️</div>
              <h3 className="service-card__title">Custom Web Applications</h3>
              <p className="service-card__desc">
                Business platforms, internal tools, customer portals, and SaaS
                products — built to scale and designed to convert.
              </p>
              <ul className="service-card__list">
                <li>Business dashboards</li>
                <li>Customer portals</li>
                <li>SaaS platforms</li>
              </ul>
            </article>
            <article
              className="service-card fade-up"
              style={{ '--delay': '0.1s' }}
            >
              <div className="service-card__icon">⚙️</div>
              <h3 className="service-card__title">Backend Development</h3>
              <p className="service-card__desc">
                Scalable APIs, database design, authentication systems,
                third-party integrations, and microservices.
              </p>
              <ul className="service-card__list">
                <li>REST & GraphQL APIs</li>
                <li>Database architecture</li>
                <li>Auth & security</li>
              </ul>
            </article>
            <article
              className="service-card fade-up"
              style={{ '--delay': '0.2s' }}
            >
              <div className="service-card__icon">🚀</div>
              <h3 className="service-card__title">Full-Stack Development</h3>
              <p className="service-card__desc">
                End-to-end product development — from early concept and
                architecture through to deployment and ongoing support.
              </p>
              <ul className="service-card__list">
                <li>MVP development</li>
                <li>Product iteration</li>
                <li>DevOps & deployment</li>
              </ul>
            </article>
            <article
              className="service-card fade-up"
              style={{ '--delay': '0.3s' }}
            >
              <div className="service-card__icon">🏗️</div>
              <h3 className="service-card__title">System Architecture</h3>
              <p className="service-card__desc">
                Designing scalable, maintainable systems that grow with your
                business — built right the first time.
              </p>
              <ul className="service-card__list">
                <li>Technical planning</li>
                <li>Cloud infrastructure</li>
                <li>Performance audits</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

    

      <section className="section more-projects">
        <div className="container">
          <div className="section-header fade-up">
            <p className="section-eyebrow">Portfolio</p>
            <h2 className="section-title">More Projects</h2>
            <p className="section-desc">
              A selection of real-world systems I&apos;ve designed and shipped
              for clients across industries.
            </p>
          </div>

          <div className="proj-grid">
            <article
              className="proj-card fade-up"
              style={{ '--delay': '0s' }}
            >
              <div className="proj-card__header">
                <span className="proj-card__icon">📅</span>
                <div className="proj-card__meta">
                  <h3>Appointment Booking Platform</h3>
                </div>
              </div>
              <p className="proj-card__problem">
                <strong>Problem:</strong> Manual scheduling was causing a 30%+
                no-show rate and costing staff hours weekly.
              </p>
              <div className="proj-card__tech">
                <span className="tech-tag tech-tag--sm">Node.js</span>
                <span className="tech-tag tech-tag--sm">React</span>
                <span className="tech-tag tech-tag--sm">MongoDB</span>
              </div>
              <p className="proj-card__impact">
                🎯 <strong>Impact:</strong> 35% reduction in no-shows. Fully
                automated reminders & confirmations.
              </p>
            </article>
            <article
              className="proj-card fade-up"
              style={{ '--delay': '0.1s' }}
            >
              <div className="proj-card__header">
                <span className="proj-card__icon">💰</span>
                <div className="proj-card__meta">
                  <h3>Loan Management System</h3>
                </div>
              </div>
              <p className="proj-card__problem">
                <strong>Problem:</strong> Complex loan workflows were handled
                in spreadsheets — error-prone and unauditable.
              </p>
              <div className="proj-card__tech">
                <span className="tech-tag tech-tag--sm">Laravel</span>
                <span className="tech-tag tech-tag--sm">PHP</span>
                <span className="tech-tag tech-tag--sm">MySQL</span>
              </div>
              <p className="proj-card__impact">
                🎯 <strong>Impact:</strong> 50% faster processing. Automated
                approvals & full audit trail.
              </p>
            </article>
            <article
              className="proj-card fade-up"
              style={{ '--delay': '0.2s' }}
            >
              <div className="proj-card__header">
                <span className="proj-card__icon">🏢</span>
                <div className="proj-card__meta">
                  <h3>Multi-Tenant SaaS Platform</h3>
                </div>
              </div>
              <p className="proj-card__problem">
                <strong>Problem:</strong> Each client needed isolated
                environments — impossible to scale manually.
              </p>
              <div className="proj-card__tech">
                <span className="tech-tag tech-tag--sm">Docker</span>
                <span className="tech-tag tech-tag--sm">Node.js</span>
                <span className="tech-tag tech-tag--sm">PostgreSQL</span>
              </div>
              <p className="proj-card__impact">
                🎯 <strong>Impact:</strong> Scales to 200+ tenants. Zero
                cross-tenant data leakage.
              </p>
            </article>
            <article
              className="proj-card fade-up"
              style={{ '--delay': '0.3s' }}
            >
              <div className="proj-card__header">
                <span className="proj-card__icon">📝</span>
                <div className="proj-card__meta">
                  <h3>Blog API Platform</h3>
                </div>
              </div>
              <p className="proj-card__problem">
                <strong>Problem:</strong> Content needed to be distributed
                across multiple front-end apps without duplication.
              </p>
              <div className="proj-card__tech">
                <span className="tech-tag tech-tag--sm">Laravel</span>
                <span className="tech-tag tech-tag--sm">Redis</span>
                <span className="tech-tag tech-tag--sm">REST API</span>
              </div>
              <p className="proj-card__impact">
                🎯 <strong>Impact:</strong> Sub-50ms cached reads. Powers 5+
                consumer apps from one API.
              </p>
            </article>
            <article
              className="proj-card fade-up"
              style={{ '--delay': '0.4s' }}
            >
              <div className="proj-card__header">
                <span className="proj-card__icon">⚽</span>
                <div className="proj-card__meta">
                  <h3>Sports Prediction System</h3>
                </div>
              </div>
              <p className="proj-card__problem">
                <strong>Problem:</strong> Real-time analytics for sports betting
                were too slow and inaccurate with legacy tooling.
              </p>
              <div className="proj-card__tech">
                <span className="tech-tag tech-tag--sm">Python</span>
                <span className="tech-tag tech-tag--sm">FastAPI</span>
                <span className="tech-tag tech-tag--sm">Kafka</span>
              </div>
              <p className="proj-card__impact">
                🎯 <strong>Impact:</strong> 20% higher prediction accuracy.
                Real-time event streaming under 100ms.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section why-me">
        <div className="container">
          <div className="why-me__grid">
            <div className="why-me__left fade-up">
              <p className="section-eyebrow">Why Choose Me</p>
              <h2 className="section-title">More Than Just Code</h2>
              <p className="why-me__desc">
                Most developers ship features. I ship outcomes. Every line of
                code is written with your business goals in mind — not just the
                spec sheet.
              </p>
              <a
                href={calendlyUrl}
                className="btn btn--primary calendly-trigger"
                onClick={handleCalendlyClick}
              >
                Let&apos;s Talk →
              </a>
            </div>
            <div className="why-me__right">
              <div
                className="value-card fade-up"
                style={{ '--delay': '0s' }}
              >
                <span className="value-card__icon">🎯</span>
                <div>
                  <h4>Business-First Thinking</h4>
                  <p>
                    I understand your goals before writing a single line of
                    code. Every feature must serve a purpose.
                  </p>
                </div>
              </div>
              <div
                className="value-card fade-up"
                style={{ '--delay': '0.1s' }}
              >
                <span className="value-card__icon">📐</span>
                <div>
                  <h4>Clean, Scalable Architecture</h4>
                  <p>
                    Systems built to grow. Clean code that&apos;s maintainable
                    for years — not just for the demo.
                  </p>
                </div>
              </div>
              <div
                className="value-card fade-up"
                style={{ '--delay': '0.2s' }}
              >
                <span className="value-card__icon">💬</span>
                <div>
                  <h4>Reliable Communication</h4>
                  <p>
                    Regular updates, transparent timelines, and honest
                    conversations when things need adjusting.
                  </p>
                </div>
              </div>
              <div
                className="value-card fade-up"
                style={{ '--delay': '0.3s' }}
              >
                <span className="value-card__icon">🔒</span>
                <div>
                  <h4>Long-Term Partnership</h4>
                  <p>
                    I&apos;m invested in your success beyond launch. Support,
                    iteration, and growth — together.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section testimonials">
        <div className="container">
          <div className="section-header fade-up">
            <p className="section-eyebrow">Social Proof</p>
            <h2 className="section-title">What Clients Say</h2>
          </div>
          <div className="testimonials__grid">
            <article
              className="testimonial-card fade-up"
              style={{ '--delay': '0s' }}
            >
              <div className="testimonial-card__stars">★★★★★</div>
              <p className="testimonial-card__quote">
                &ldquo;Samuel turned our vague idea into a polished MVP in just
                6 weeks. His ability to translate business goals into clean,
                scalable code is genuinely rare. He became a core part of our
                team.&rdquo;
              </p>
              <div className="testimonial-card__author">
                <div className="testimonial-card__avatar">JA</div>
                <div>
                  <strong>James A.</strong>
                  <small>Founder, VendoHub</small>
                </div>
              </div>
            </article>
            <article
              className="testimonial-card fade-up"
              style={{ '--delay': '0.15s' }}
            >
              <div className="testimonial-card__stars">★★★★★</div>
              <p className="testimonial-card__quote">
                &ldquo;The platform Samuel built exceeded every expectation.
                Performance, reliability, and UX are all top-tier. We saw a 40%
                increase in user engagement within the first month of
                launch.&rdquo;
              </p>
              <div className="testimonial-card__author">
                <div className="testimonial-card__avatar">MO</div>
                <div>
                  <strong>Ikechukwu O.</strong>
                  <small>CEO, GodgraceLab</small>
                </div>
              </div>
            </article>
            <article
              className="testimonial-card fade-up"
              style={{ '--delay': '0.3s' }}
            >
              <div className="testimonial-card__stars">★★★★★</div>
              <p className="testimonial-card__quote">
                &ldquo;Working with Samuel was a breath of fresh air. He asked
                the right questions, pushed back when needed, and delivered a
                system that&apos;s still running flawlessly 18 months
                later.&rdquo;
              </p>
              <div className="testimonial-card__author">
                <div className="testimonial-card__avatar">TK</div>
                <div>
                  <strong>Tobi K.</strong>
                  <small>CTO, KID Platform</small>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="process" className="section process">
        <div className="container">
          <div className="section-header fade-up">
            <p className="section-eyebrow">How It Works</p>
            <h2 className="section-title">A Simple, Proven Process</h2>
            <p className="section-desc">
              From first conversation to production — a clear, collaborative
              process every step of the way.
            </p>
          </div>
          <div className="process__steps">
            <div
              className="process__step fade-up"
              style={{ '--delay': '0s' }}
            >
              <div className="process__step-num">01</div>
              <div className="process__step-body">
                <h3>Discovery Call</h3>
                <p>
                  We talk through your idea, goals, and challenges. No sales
                  pitch — just honest conversation to understand what you really
                  need.
                </p>
              </div>
            </div>
            <div className="process__connector"></div>
            <div
              className="process__step fade-up"
              style={{ '--delay': '0.1s' }}
            >
              <div className="process__step-num">02</div>
              <div className="process__step-body">
                <h3>Planning & Architecture</h3>
                <p>
                  I map out the technical architecture, define milestones, and
                  produce a clear scope — so there are no surprises.
                </p>
              </div>
            </div>
            <div className="process__connector"></div>
            <div
              className="process__step fade-up"
              style={{ '--delay': '0.2s' }}
            >
              <div className="process__step-num">03</div>
              <div className="process__step-body">
                <h3>Development</h3>
                <p>
                  Iterative, feedback-driven development with regular demos.
                  You&apos;re always in the loop — never waiting in the dark.
                </p>
              </div>
            </div>
            <div className="process__connector"></div>
            <div
              className="process__step fade-up"
              style={{ '--delay': '0.3s' }}
            >
              <div className="process__step-num">04</div>
              <div className="process__step-body">
                <h3>Launch & Support</h3>
                <p>
                  We ship together, monitor for issues, and I stay available
                  for questions, iterations, and future growth.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="section about">
        <div className="container">
          <div className="about__grid">
            <div className="about__left fade-up">
              <div className="about__avatar-wrap">
                <div className="about__avatar">SN</div>
                <div className="about__avatar-glow"></div>
              </div>
            </div>
            <div className="about__right fade-up">
              <p className="section-eyebrow">About Me</p>
              <h2 className="section-title">Samuel Nwankwo</h2>
              <p className="about__bio">
                I&apos;m a Full-Stack Developer with 6+ years of experience
                building software that drives real business results. From
                early-stage startups to established companies, I&apos;ve helped
                teams ship complex systems that actually work.
              </p>
              <p className="about__bio">
                I care deeply about clean architecture, reliable performance,
                and honest collaboration. When you work with me, you&apos;re
                not just getting code — you&apos;re getting a technical partner
                invested in your success.
              </p>
              <div className="about__skills">
                <span className="skill-tag">PHP</span>
                <span className="skill-tag">Laravel</span>
                <span className="skill-tag">Node.js</span>
                <span className="skill-tag">JavaScript</span>
                <span className="skill-tag">React</span>
                <span className="skill-tag">MySQL</span>
                <span className="skill-tag">PostgreSQL</span>
                <span className="skill-tag">Docker</span>
                <span className="skill-tag">REST APIs</span>
                <span className="skill-tag">Cloud Infrastructure</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section cta-banner">
        <div className="container">
          <div className="cta-banner__inner fade-up">
            <div className="cta-banner__glow"></div>
            <p className="section-eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Ready to build?
            </p>
            <h2 className="cta-banner__title">Have an Idea You Want to Build?</h2>
            <p className="cta-banner__subtitle">
              Let&apos;s discuss your project and see how software can help
              your business grow.
            </p>
            <a
              href={calendlyUrl}
              className="btn btn--primary btn--lg calendly-trigger"
              onClick={handleCalendlyClick}
            >
              📅 Schedule a Free Consultation
            </a>
          </div>
        </div>
      </section>

      <section className="section lead-magnet fade-up" style={{ paddingBottom: '0' }}>
        <div className="container">
          <div className="lead-magnet__card">
            <div>
              <span style={{ background: 'hsla(172, 65%, 48%, 0.15)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Free Founder Resource</span>
              <h3 style={{ fontSize: '1.6rem', marginTop: 'var(--sp-3)', marginBottom: 'var(--sp-2)' }}>10 Costly Architecture Mistakes Founders Make</h3>
              <p style={{ color: 'var(--text-200)', fontSize: '0.95rem' }}>
                Planning a web application or SaaS? Avoid the technical traps that waste budget and slow down launch timelines.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              <a
                href="https://wa.me/+2349020927884?text=Hi%20Samuel%20%E2%80%94%20Please%20send%20me%20the%20Free%20Founder%20Architecture%20Guide."
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--primary btn--lg"
                style={{ justifyContent: 'center' }}
              >
                📥 Get Free Guide via WhatsApp
              </a>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-300)', textAlign: 'center' }}>Instant PDF delivery · No spam</p>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="section contact">
        <div className="container">
          <div className="contact__grid">
            <div className="contact__left fade-up">
              <p className="section-eyebrow">Get In Touch</p>
              <h2 className="section-title">Let&apos;s Build Something Great</h2>
              <p className="contact__desc">
                Fill in the form and I&apos;ll get back to you within 24 hours.
                Or if you&apos;d prefer, book a call directly on Calendly.
              </p>
              <a
                href={calendlyUrl}
                className="btn btn--ghost calendly-trigger"
                onClick={handleCalendlyClick}
              >
                📅 Book on Calendly
              </a>
              <div className="contact__links">
                <a href="mailto:nwankwosami@gmail.com" className="contact__link">
                  ✉️ nwankwosami@gmail.com
                </a>
                <a
                  href="https://saminwankwo.dev/"
                  className="contact__link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  🌐 Website
                </a>
                <a
                  href="https://linkedin.com/in/saminwankwo"
                  className="contact__link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  💼 LinkedIn
                </a>
                <a
                  href="https://tiktok.com/@saminwankwo"
                  className="contact__link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📱 TikTok
                </a>
                <a
                  href="https://linktr.ee/saminwankwo"
                  className="contact__link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  🔗 Linktree
                </a>
              </div>
            </div>
            <div className="contact__right fade-up">
              {formSubmitted ? (
                <div className="form-success">
                  <div className="form-success__icon">✅</div>
                  <h3 className="form-success__title">
                    Message Sent Successfully!
                  </h3>
                  <p className="form-success__text">
                    Thank you for reaching out. I&apos;ve received your project
                    details and will get back to you within 24 hours.
                  </p>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => setFormSubmitted(false)}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form
                  ref={formRef}
                  action={formspreeEndpoint}
                  method="POST"
                  className="contact-form"
                  id="contactForm"
                  onSubmit={handleSubmit}
                  noValidate
                >
                  <input
                    type="text"
                    name="_gotcha"
                    tabIndex={-1}
                    autoComplete="off"
                    style={{ display: 'none' }}
                  />
                  <div className="form-group">
                    <label htmlFor="name">Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Your full name"
                      required
                      autoComplete="name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="your@email.com"
                      required
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="company">Company</label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      placeholder="Your company name"
                      autoComplete="organization"
                      value={formData.company}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="message">Project Description *</label>
                    <textarea
                      id="message"
                      name="message"
                      placeholder="Tell me about your project, goals, and timeline…"
                      rows="5"
                      required
                      value={formData.message}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                  <div className="form-group">
                    <label htmlFor="budget">Budget Range *</label>
                    <select
                      id="budget"
                      name="budget"
                      required
                      value={formData.budget}
                      onChange={handleInputChange}
                    >
                      <option value="" disabled>
                        Select your budget range
                      </option>
                      <option value="under-5k">Under $5,000</option>
                      <option value="5k-15k">$5,000 – $15,000</option>
                      <option value="15k-30k">$15,000 – $30,000</option>
                      <option value="30k-plus">$30,000+</option>
                      <option value="not-sure">Not sure yet</option>
                    </select>
                  </div>
                  <button
                    ref={submitBtnRef}
                    type="submit"
                    className="btn btn--primary btn--full"
                  >
                    Let&apos;s Build Something Great 🚀
                  </button>
                  <p className="form-note">
                    I typically respond within 24 hours.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer__inner">
          <div className="footer__left">
            <span className="nav__logo">
              <span className="nav__logo-icon">SN</span>
              Samuel Nwankwo
            </span>
            <p>Full-Stack Developer building software that drives business growth.</p>
          </div>
          <nav className="footer__nav" aria-label="Footer navigation">
            <a href="#hero">Home</a>
            <a href="#projects">Projects</a>
            <a href="#services">Services</a>
            <a href="#contact">Contact</a>
          </nav>
        </div>
        <div className="container footer__bottom">
          <p>© 2026 Samuel Nwankwo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default Home
