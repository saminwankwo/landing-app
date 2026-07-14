import { useEffect, useRef, useState } from 'react'

/**
 * SHA-256 Hashing Utility
 * @param {string} string - The string to hash
 * @returns {Promise<string>} - The hashed string
 */
async function hashString(string) {
  const msgUint8 = new TextEncoder().encode(string)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

/**
 * TikTok Event Tracking Helper
 * @param {string} eventName - The TikTok event name
 * @param {Object} properties - Event properties
 */
function trackTikTokEvent(eventName, properties = {}) {
  if (window.ttq) {
    ttq.track(eventName, {
      "contents": [
        {
          "content_id": properties.content_id || 'landing_page',
          "content_type": properties.content_type || 'product',
          "content_name": properties.content_name || 'Samuel Nwankwo Portfolio'
        }
      ],
      "value": properties.value || 0,
      "currency": properties.currency || 'USD'
    })
  }
}

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
    budget: ''
  })

  const fadeElementsRef = useRef([])

  // Calendly handler
  const handleCalendlyClick = (e) => {
    e.preventDefault()
    trackTikTokEvent('ClickButton', {
      content_name: 'Calendly Booking Click'
    })

    if (window.Calendly) {
      Calendly.initPopupWidget({
        url: 'https://calendly.com/nwankwosami/30min'
      })
    } else {
      window.open('https://calendly.com/nwankwosami/30min', '_blank')
    }
  }

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    const form = e.target

    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }

    const formDataObj = new FormData(form)
    const email = formDataObj.get('email')

    try {
      if (email) {
        const hashedEmail = await hashString(email.trim().toLowerCase())
        if (window.ttq) {
          ttq.identify({
            "email": hashedEmail
          })
        }
      }

      const response = await fetch('https://formspree.io/f/mqejjvpy', {
        method: 'POST',
        body: formDataObj,
        headers: {
          'Accept': 'application/json'
        }
      })

      if (response.ok) {
        trackTikTokEvent('Lead', {
          content_name: 'Contact Form Submission',
          value: 0,
          currency: 'USD'
        })
        setFormSubmitted(true)
        setFormData({ name: '', email: '', company: '', message: '', budget: '' })
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Submission failed')
      }
    } catch (error) {
      console.error('Form submission error:', error)
      alert('Oops! There was a problem submitting your form. Please try again or email me directly.')
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Scroll animations
  useEffect(() => {
    trackTikTokEvent('ViewContent', {
      content_name: document.title,
      content_type: 'product'
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

    fadeElementsRef.current.forEach(el => {
      if (el) observer.observe(el)
    })

    return () => {
      fadeElementsRef.current.forEach(el => {
        if (el) observer.unobserve(el)
      })
    }
  }, [])

  // Handle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev)
    document.body.style.overflow = !mobileMenuOpen ? 'hidden' : ''
  }

  const closeMobileMenu = () => {
    if (mobileMenuOpen) {
      setMobileMenuOpen(false)
      document.body.style.overflow = ''
    }
  }

  return (
    <div>
      {/* Navigation */}
      <header className="nav" id="top">
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
            <span></span><span></span><span></span>
          </button>
          <nav className={`nav__menu ${mobileMenuOpen ? 'mobile-open' : ''}`} aria-label="Main navigation">
            <a href="#hero" className="nav__link" onClick={closeMobileMenu}>Home</a>
            <a href="#projects" className="nav__link" onClick={closeMobileMenu}>Projects</a>
            <a href="#services" className="nav__link" onClick={closeMobileMenu}>Services</a>
            <a href="#process" className="nav__link" onClick={closeMobileMenu}>Process</a>
            <a href="#about" className="nav__link" onClick={closeMobileMenu}>About</a>
            <a href="#" className="nav__link nav__link--cta calendly-trigger" onClick={handleCalendlyClick}>Book a Call</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="hero section">
        <div className="container hero__grid">
          <div className="hero__content fade-up" ref={el => fadeElementsRef.current.push(el)}>
            <div className="hero__badge">🚀 Available for New Projects</div>
            <h1 className="hero__title">
              I Build Custom Software That Solves
              <span className="text-gradient"> Real Business Problems</span>
            </h1>
            <p className="hero__subtitle">
              Full-Stack Developer specializing in scalable web applications, APIs,
              business platforms, and complex systems.
            </p>
            <div className="hero__actions">
              <a href="#" className="btn btn--primary calendly-trigger" onClick={handleCalendlyClick}>
                📅 Book a Free Consultation
              </a>
              <a href="#projects" className="btn btn--ghost">View My Work →</a>
            </div>
            <ul className="hero__pills" aria-label="Expertise areas">
              <li className="pill">6+ Years Experience</li>
              <li className="pill">Full-Stack Development</li>
              <li className="pill">Backend Architecture</li>
              <li className="pill">API Development</li>
            </ul>
          </div>

          <div className="hero__visual fade-up fade-up--delay" ref={el => fadeElementsRef.current.push(el)}>
            <div className="hero__img-wrap">
              <div className="hero__img-glow"></div>
              <img
                src="/assets/family_tree_mockup.png"
                alt="Interactive Family Tree Platform — a complex multi-generational visualization system built by Samuel Nwankwo"
                className="hero__img"
                width="620"
                height="440"
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

        {/* Stats bar */}
        <div className="container">
          <div className="stats-bar fade-up" ref={el => fadeElementsRef.current.push(el)}>
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

      {/* Featured Project Section */}
      <section id="projects" className="section featured-project">
        <div className="container">
          <div className="section-header fade-up" ref={el => fadeElementsRef.current.push(el)}>
            <p className="section-eyebrow">Featured Project</p>
            <h2 className="section-title">Interactive Family Tree Platform</h2>
            <p className="section-desc">A complex multi-generational relationship management system built to handle thousands of family records.</p>
          </div>

          <div className="project-showcase fade-up" ref={el => fadeElementsRef.current.push(el)}>
            <div className="project-showcase__img-wrap">
              <img
                src="/assets/family_tree_mockup.png"
                alt="Family Tree Platform screenshot showing multi-generational node visualization"
                className="project-showcase__img"
                loading="lazy"
              />
              <div className="project-showcase__play-btn">
                <span className="play-icon">▶</span>
                <span className="play-text">Watch 30s Demo</span>
              </div>
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
              <div className="breakdown-card fade-up" ref={el => fadeElementsRef.current.push(el)}>
                <div className="breakdown-card__icon">⚡</div>
                <h3>Challenge</h3>
                <p>Design a platform capable of handling complex family relationships across multiple generations — with real-time updates, fast search, and a deeply intuitive visual interface.</p>
              </div>
              <div className="breakdown-card fade-up" ref={el => fadeElementsRef.current.push(el)}>
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
              <div className="breakdown-card breakdown-card--outcome fade-up" ref={el => fadeElementsRef.current.push(el)}>
                <div className="breakdown-card__icon">🏆</div>
                <h3>Outcome</h3>
                <p>A highly interactive platform capable of managing tens of thousands of family records while maintaining sub-200ms response times and an intuitive, accessible UX.</p>
              </div>
              <div className="fade-up" style={{ marginTop: 'var(--sp-4)' }} ref={el => fadeElementsRef.current.push(el)}>
                <a href="case-studies/family-tree-platform.html" className="btn btn--ghost btn--full">Read Full Case Study →</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="section services">
        <div className="container">
          <div className="section-header fade-up" ref={el => fadeElementsRef.current.push(el)}>
            <p className="section-eyebrow">What I Do</p>
            <h2 className="section-title">Services</h2>
            <p className="section-desc">End-to-end development services tailored to your business goals — not just requirements.</p>
          </div>

          <div className="services__grid">
            <article className="service-card fade-up" style={{ '--delay': '0s' }} ref={el => fadeElementsRef.current.push(el)}>
              <div className="service-card__icon">🖥️</div>
              <h3 className="service-card__title">Custom Web Applications</h3>
              <p className="service-card__desc">Business platforms, internal tools, customer portals, and SaaS products — built to scale and designed to convert.</p>
              <ul className="service-card__list">
                <li>Business dashboards</li>
                <li>Customer portals</li>
                <li>SaaS platforms</li>
              </ul>
            </article>
            <article className="service-card fade-up" style={{ '--delay': '0.1s' }} ref={el => fadeElementsRef.current.push(el)}>
              <div className="service-card__icon">⚙️</div>
              <h3 className="service-card__title">Backend Development</h3>
              <p className="service-card__desc">Scalable APIs, database design, authentication systems, third-party integrations, and microservices.</p>
              <ul className="service-card__list">
                <li>REST & GraphQL APIs</li>
                <li>Database architecture</li>
                <li>Auth & security</li>
              </ul>
            </article>
            <article className="service-card fade-up" style={{ '--delay': '0.2s' }} ref={el => fadeElementsRef.current.push(el)}>
              <div className="service-card__icon">🚀</div>
              <h3 className="service-card__title">Full-Stack Development</h3>
              <p className="service-card__desc">End-to-end product development — from early concept and architecture through to deployment and ongoing support.</p>
              <ul className="service-card__list">
                <li>MVP development</li>
                <li>Product iteration</li>
                <li>DevOps & deployment</li>
              </ul>
            </article>
            <article className="service-card fade-up" style={{ '--delay': '0.3s' }} ref={el => fadeElementsRef.current.push(el)}>
              <div className="service-card__icon">🏗️</div>
              <h3 className="service-card__title">System Architecture</h3>
              <p className="service-card__desc">Designing scalable, maintainable systems that grow with your business — built right the first time.</p>
              <ul className="service-card__list">
                <li>Technical planning</li>
                <li>Cloud infrastructure</li>
                <li>Performance audits</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      {/* More Projects Section */}
      <section className="section more-projects">
        <div className="container">
          <div className="section-header fade-up" ref={el => fadeElementsRef.current.push(el)}>
            <p className="section-eyebrow">Portfolio</p>
            <h2 className="section-title">More Projects</h2>
            <p className="section-desc">A selection of real-world systems I've designed and shipped for clients across industries.</p>
          </div>

          <div className="proj-grid">
            <article className="proj-card fade-up" style={{ '--delay': '0s' }} ref={el => fadeElementsRef.current.push(el)}>
              <div className="proj-card__header">
                <span className="proj-card__icon">📅</span>
                <div className="proj-card__meta">
                  <h3>Appointment Booking Platform</h3>
                </div>
              </div>
              <p className="proj-card__problem"><strong>Problem:</strong> Manual scheduling was causing a 30%+ no-show rate and costing staff hours weekly.</p>
              <div className="proj-card__tech">
                <span className="tech-tag tech-tag--sm">Node.js</span>
                <span className="tech-tag tech-tag--sm">React</span>
                <span className="tech-tag tech-tag--sm">MongoDB</span>
              </div>
              <p className="proj-card__impact">🎯 <strong>Impact:</strong> 35% reduction in no-shows. Fully automated reminders & confirmations.</p>
            </article>
            <article className="proj-card fade-up" style={{ '--delay': '0.1s' }} ref={el => fadeElementsRef.current.push(el)}>
              <div className="proj-card__header">
                <span className="proj-card__icon">💰</span>
                <div className="proj-card__meta">
                  <h3>Loan Management System</h3>
                </div>
              </div>
              <p className="proj-card__problem"><strong>Problem:</strong> Complex loan workflows were handled in spreadsheets — error-prone and unauditable.</p>
              <div className="proj-card__tech">
                <span className="tech-tag tech-tag--sm">Laravel</span>
                <span className="tech-tag tech-tag--sm">PHP</span>
                <span className="tech-tag tech-tag--sm">MySQL</span>
              </div>
              <p className="proj-card__impact">🎯 <strong>Impact:</strong> 50% faster processing. Automated approvals & full audit trail.</p>
            </article>
            <article className="proj-card fade-up" style={{ '--delay': '0.2s' }} ref={el => fadeElementsRef.current.push(el)}>
              <div className="proj-card__header">
                <span className="proj-card__icon">🏢</span>
                <div className="proj-card__meta">
                  <h3>Multi-Tenant SaaS Platform</h3>
                </div>
              </div>
              <p className="proj-card__problem"><strong>Problem:</strong> Each client needed isolated environments — impossible to scale manually.</p>
              <div className="proj-card__tech">
                <span className="tech-tag tech-tag--sm">Docker</span>
                <span className="tech-tag tech-tag--sm">Node.js</span>
                <span className="tech-tag tech-tag--sm">PostgreSQL</span>
              </div>
              <p className="proj-card__impact">🎯 <strong>Impact:</strong> Scales to 200+ tenants. Zero cross-tenant data leakage.</p>
            </article>
            <article className="proj-card fade-up" style={{ '--delay': '0.3s' }} ref={el => fadeElementsRef.current.push(el)}>
              <div className="proj-card__header">
                <span className="proj-card__icon">📝</span>
                <div className="proj-card__meta">
                  <h3>Blog API Platform</h3>
                </div>
              </div>
              <p className="proj-card__problem"><strong>Problem:</strong> Content needed to be distributed across multiple front-end apps without duplication.</p>
              <div className="proj-card__tech">
                <span className="tech-tag tech-tag--sm">Laravel</span>
                <span className="tech-tag tech-tag--sm">Redis</span>
                <span className="tech-tag tech-tag--sm">REST API</span>
              </div>
              <p className="proj-card__impact">🎯 <strong>Impact:</strong> Sub-50ms cached reads. Powers 5+ consumer apps from one API.</p>
            </article>
            <article className="proj-card fade-up" style={{ '--delay': '0.4s' }} ref={el => fadeElementsRef.current.push(el)}>
              <div className="proj-card__header">
                <span className="proj-card__icon">⚽</span>
                <div className="proj-card__meta">
                  <h3>Sports Prediction System</h3>
                </div>
              </div>
              <p className="proj-card__problem"><strong>Problem:</strong> Real-time analytics for sports betting were too slow and inaccurate with legacy tooling.</p>
              <div className="proj-card__tech">
                <span className="tech-tag tech-tag--sm">Python</span>
                <span className="tech-tag tech-tag--sm">FastAPI</span>
                <span className="tech-tag tech-tag--sm">Kafka</span>
              </div>
              <p className="proj-card__impact">🎯 <strong>Impact:</strong> 20% higher prediction accuracy. Real-time event streaming under 100ms.</p>
            </article>
          </div>
        </div>
      </section>

      {/* Why Work With Me Section */}
      <section className="section why-me">
        <div className="container">
          <div className="why-me__grid">
            <div className="why-me__left fade-up" ref={el => fadeElementsRef.current.push(el)}>
              <p className="section-eyebrow">Why Choose Me</p>
              <h2 className="section-title">More Than Just Code</h2>
              <p className="why-me__desc">Most developers ship features. I ship outcomes. Every line of code is written with your business goals in mind — not just the spec sheet.</p>
              <a href="#" className="btn btn--primary calendly-trigger" onClick={handleCalendlyClick}>Let's Talk →</a>
            </div>
            <div className="why-me__right">
              <div className="value-card fade-up" style={{ '--delay': '0s' }} ref={el => fadeElementsRef.current.push(el)}>
                <span className="value-card__icon">🎯</span>
                <div>
                  <h4>Business-First Thinking</h4>
                  <p>I understand your goals before writing a single line of code. Every feature must serve a purpose.</p>
                </div>
              </div>
              <div className="value-card fade-up" style={{ '--delay': '0.1s' }} ref={el => fadeElementsRef.current.push(el)}>
                <span className="value-card__icon">📐</span>
                <div>
                  <h4>Clean, Scalable Architecture</h4>
                  <p>Systems built to grow. Clean code that's maintainable for years — not just for the demo.</p>
                </div>
              </div>
              <div className="value-card fade-up" style={{ '--delay': '0.2s' }} ref={el => fadeElementsRef.current.push(el)}>
                <span className="value-card__icon">💬</span>
                <div>
                  <h4>Reliable Communication</h4>
                  <p>Regular updates, transparent timelines, and honest conversations when things need adjusting.</p>
                </div>
              </div>
              <div className="value-card fade-up" style={{ '--delay': '0.3s' }} ref={el => fadeElementsRef.current.push(el)}>
                <span className="value-card__icon">🔒</span>
                <div>
                  <h4>Long-Term Partnership</h4>
                  <p>I'm invested in your success beyond launch. Support, iteration, and growth — together.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section testimonials">
        <div className="container">
          <div className="section-header fade-up" ref={el => fadeElementsRef.current.push(el)}>
            <p className="section-eyebrow">Social Proof</p>
            <h2 className="section-title">What Clients Say</h2>
          </div>
          <div className="testimonials__grid">
            <article className="testimonial-card fade-up" style={{ '--delay': '0s' }} ref={el => fadeElementsRef.current.push(el)}>
              <div className="testimonial-card__stars">★★★★★</div>
              <p className="testimonial-card__quote">"Samuel turned our vague idea into a polished MVP in just 6 weeks. His ability to translate business goals into clean, scalable code is genuinely rare. He became a core part of our team."</p>
              <div className="testimonial-card__author">
                <div className="testimonial-card__avatar">JA</div>
                <div>
                  <strong>James A.</strong>
                  <small>Founder, FinTech Startup</small>
                </div>
              </div>
            </article>
            <article className="testimonial-card fade-up" style={{ '--delay': '0.15s' }} ref={el => fadeElementsRef.current.push(el)}>
              <div className="testimonial-card__stars">★★★★★</div>
              <p className="testimonial-card__quote">"The platform Samuel built exceeded every expectation. Performance, reliability, and UX are all top-tier. We saw a 40% increase in user engagement within the first month of launch."</p>
              <div className="testimonial-card__author">
                <div className="testimonial-card__avatar">MO</div>
                <div>
                  <strong>Michelle O.</strong>
                  <small>CEO, HealthTech Company</small>
                </div>
              </div>
            </article>
            <article className="testimonial-card fade-up" style={{ '--delay': '0.3s' }} ref={el => fadeElementsRef.current.push(el)}>
              <div className="testimonial-card__stars">★★★★★</div>
              <p className="testimonial-card__quote">"Working with Samuel was a breath of fresh air. He asked the right questions, pushed back when needed, and delivered a system that's still running flawlessly 18 months later."</p>
              <div className="testimonial-card__author">
                <div className="testimonial-card__avatar">TK</div>
                <div>
                  <strong>Tobi K.</strong>
                  <small>CTO, Logistics Platform</small>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="section process">
        <div className="container">
          <div className="section-header fade-up" ref={el => fadeElementsRef.current.push(el)}>
            <p className="section-eyebrow">How It Works</p>
            <h2 className="section-title">A Simple, Proven Process</h2>
            <p className="section-desc">From first conversation to production — a clear, collaborative process every step of the way.</p>
          </div>
          <div className="process__steps">
            <div className="process__step fade-up" style={{ '--delay': '0s' }} ref={el => fadeElementsRef.current.push(el)}>
              <div className="process__step-num">01</div>
              <div className="process__step-body">
                <h3>Discovery Call</h3>
                <p>We talk through your idea, goals, and challenges. No sales pitch — just honest conversation to understand what you really need.</p>
              </div>
            </div>
            <div className="process__connector"></div>
            <div className="process__step fade-up" style={{ '--delay': '0.1s' }} ref={el => fadeElementsRef.current.push(el)}>
              <div className="process__step-num">02</div>
              <div className="process__step-body">
                <h3>Planning & Architecture</h3>
                <p>I map out the technical architecture, define milestones, and produce a clear scope — so there are no surprises.</p>
              </div>
            </div>
            <div className="process__connector"></div>
            <div className="process__step fade-up" style={{ '--delay': '0.2s' }} ref={el => fadeElementsRef.current.push(el)}>
              <div className="process__step-num">03</div>
              <div className="process__step-body">
                <h3>Development</h3>
                <p>Iterative, feedback-driven development with regular demos. You're always in the loop — never waiting in the dark.</p>
              </div>
            </div>
            <div className="process__connector"></div>
            <div className="process__step fade-up" style={{ '--delay': '0.3s' }} ref={el => fadeElementsRef.current.push(el)}>
              <div className="process__step-num">04</div>
              <div className="process__step-body">
                <h3>Launch & Support</h3>
                <p>We ship together, monitor for issues, and I stay available for questions, iterations, and future growth.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section about">
        <div className="container">
          <div className="about__grid">
            <div className="about__left fade-up" ref={el => fadeElementsRef.current.push(el)}>
              <div className="about__avatar-wrap">
                <div className="about__avatar">SN</div>
                <div className="about__avatar-glow"></div>
              </div>
            </div>
            <div className="about__right fade-up" ref={el => fadeElementsRef.current.push(el)}>
              <p className="section-eyebrow">About Me</p>
              <h2 className="section-title">Samuel Nwankwo</h2>
              <p className="about__bio">I'm a Full-Stack Developer with 6+ years of experience building software that drives real business results. From early-stage startups to established companies, I've helped teams ship complex systems that actually work.</p>
              <p className="about__bio">I care deeply about clean architecture, reliable performance, and honest collaboration. When you work with me, you're not just getting code — you're getting a technical partner invested in your success.</p>
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

      {/* Final CTA Section */}
      <section className="section cta-banner">
        <div className="container">
          <div className="cta-banner__inner fade-up" ref={el => fadeElementsRef.current.push(el)}>
            <div className="cta-banner__glow"></div>
            <p className="section-eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Ready to build?</p>
            <h2 className="cta-banner__title">Have an Idea You Want to Build?</h2>
            <p className="cta-banner__subtitle">Let's discuss your project and see how software can help your business grow.</p>
            <a href="#" className="btn btn--primary btn--lg calendly-trigger" onClick={handleCalendlyClick}>
              📅 Schedule a Free Consultation
            </a>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section contact">
        <div className="container">
          <div className="contact__grid">
            <div className="contact__left fade-up" ref={el => fadeElementsRef.current.push(el)}>
              <p className="section-eyebrow">Get In Touch</p>
              <h2 className="section-title">Let's Build Something Great</h2>
              <p className="contact__desc">Fill in the form and I'll get back to you within 24 hours. Or if you'd prefer, book a call directly on Calendly.</p>
              <a href="#" className="btn btn--ghost calendly-trigger" onClick={handleCalendlyClick}>📅 Book on Calendly</a>
              <div className="contact__links">
                <a href="mailto:nwankwosami@gmail.com" className="contact__link">✉️ nwankwosami@gmail.com</a>
                <a href="https://saminwankwo-github-io.vercel.app/" className="contact__link" target="_blank" rel="noopener noreferrer">🌐 Website</a>
                <a href="https://linkedin.com/in/saminwankwo" className="contact__link" target="_blank" rel="noopener noreferrer">💼 LinkedIn</a>
                <a href="https://github.com/saminwankwo" className="contact__link" target="_blank" rel="noopener noreferrer">💻 GitHub</a>
                <a href="https://tiktok.com/@saminwankwo" className="contact__link" target="_blank" rel="noopener noreferrer">📱 TikTok</a>
                <a href="https://linktr.ee/saminwankwo" className="contact__link" target="_blank" rel="noopener noreferrer">🔗 Linktree</a>
              </div>
            </div>
            <div className="contact__right fade-up" ref={el => fadeElementsRef.current.push(el)}>
              {formSubmitted ? (
                <div className="form-success">
                  <div className="form-success__icon">✅</div>
                  <h3 className="form-success__title">Message Sent Successfully!</h3>
                  <p className="form-success__text">Thank you for reaching out. I've received your project details and will get back to you within 24 hours.</p>
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
                  action="https://formspree.io/f/mqejjvpy"
                  method="POST"
                  className="contact-form"
                  id="contactForm"
                  onSubmit={handleSubmit}
                  noValidate
                >
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
                      <option value="" disabled>Select your budget range</option>
                      <option value="under-5k">Under $5,000</option>
                      <option value="5k-15k">$5,000 – $15,000</option>
                      <option value="15k-30k">$15,000 – $30,000</option>
                      <option value="30k-plus">$30,000+</option>
                      <option value="not-sure">Not sure yet</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn--primary btn--full">
                    Let's Build Something Great 🚀
                  </button>
                  <p className="form-note">I typically respond within 24 hours.</p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
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

export default App
