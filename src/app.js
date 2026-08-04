/**
 * Samuel Nwankwo Landing Page - Main Application Logic
 * Handles scroll animations, mobile menu, and form submission.
 */

document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initMobileMenu();
  initFormHandling();
  initCalendly();
  
  // Track Page View for TikTok
  trackTikTokEvent('ViewContent', {
    content_name: document.title,
    content_type: 'product'
  });
});

/**
 * Scroll Animations using Intersection Observer
 * Adds .visible class to elements with .fade-up when they enter the viewport
 */
function initScrollAnimations() {
  const fadeElements = document.querySelectorAll('.fade-up');
  
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Once visible, we can stop observing this element
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  fadeElements.forEach(el => {
    observer.observe(el);
  });
}

/**
 * Mobile Navigation Menu
 * Handles burger menu toggle and closing on link click
 */
function initMobileMenu() {
  const burger = document.getElementById('navBurger');
  const menu = document.getElementById('navMenu');
  const links = document.querySelectorAll('.nav__link');

  if (!burger || !menu) return;

  const toggleMenu = () => {
    const isOpen = menu.classList.contains('mobile-open');
    burger.classList.toggle('open');
    menu.classList.toggle('mobile-open');
    document.body.style.overflow = isOpen ? '' : 'hidden'; // Prevent scroll when menu is open
    burger.setAttribute('aria-expanded', !isOpen);
  };

  burger.addEventListener('click', toggleMenu);

  // Close menu when a link is clicked
  links.forEach(link => {
    link.addEventListener('click', () => {
      if (menu.classList.contains('mobile-open')) {
        toggleMenu();
      }
    });
  });

  // Close menu on resize if switching to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768 && menu.classList.contains('mobile-open')) {
      toggleMenu();
    }
  });
}

/**
 * Contact Form Handling
 * Handles AJAX submission and success state toggle
 */
function initFormHandling() {
  const form = document.getElementById('contactForm');
  const successMessage = document.getElementById('formSuccess');
  const submitBtn = document.getElementById('submitBtn');
  const resetBtn = document.getElementById('resetFormBtn');

  if (!form || !successMessage) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const email = formData.get('email');
    
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
    }

    try {
      // Identify user for TikTok before tracking Lead
      if (email) {
        const hashedEmail = await hashString(email.trim().toLowerCase());
        if (window.ttq) {
          window.ttq.identify({
            "email": hashedEmail
          });
        }
      }

      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        // Track successful Lead for TikTok
        trackTikTokEvent('Lead', {
          content_name: 'Contact Form Submission',
          value: 0,
          currency: 'USD'
        });

        // Hide form and show success message
        form.style.display = 'none';
        successMessage.style.display = 'flex';
        form.reset();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Submission failed');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Oops! There was a problem submitting your form. Please try again or email me directly.');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Let's Build Something Great 🚀";
      }
    }
  });

  // Reset form to initial state
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      successMessage.style.display = 'none';
      form.style.display = 'flex';
    });
  }
}

/**
 * Calendly Popup Widget
 * Triggers the Calendly popup when elements with .calendly-trigger are clicked
 */
function initCalendly() {
  const triggers = document.querySelectorAll('.calendly-trigger');
  
  triggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Track ClickButton for TikTok
      trackTikTokEvent('ClickButton', {
        content_name: 'Calendly Booking Click'
      });

      if (window.Calendly) {
        window.Calendly.initPopupWidget({
          url: 'https://calendly.com/nwankwosami/30min'
        });
      } else {
        // Fallback if script hasn't loaded
        window.open('https://calendly.com/nwankwosami/30min', '_blank');
      }
    });
  });
}

/**
 * TikTok Event Tracking Helper
 * @param {string} eventName - The TikTok event name
 * @param {Object} properties - Event properties
 */
function trackTikTokEvent(eventName, properties = {}) {
  if (window.ttq) {
    window.ttq.track(eventName, {
      "contents": [
        {
          "content_id": properties.content_id || 'landing_page',
          "content_type": properties.content_type || 'product',
          "content_name": properties.content_name || 'Samuel Nwankwo Portfolio'
        }
      ],
      "value": properties.value || 0,
      "currency": properties.currency || 'USD'
    });
  }
}

/**
 * SHA-256 Hashing Utility
 * @param {string} string - The string to hash
 * @returns {Promise<string>} - The hashed string
 */
async function hashString(string) {
  const msgUint8 = new TextEncoder().encode(string);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
