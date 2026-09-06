import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    if (typeof console !== 'undefined' && console.error) {
      console.error('ErrorBoundary caught:', error, info)
    }
  }

  reset = () => this.setState({ hasError: false, error: null })

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'grid',
            placeItems: 'center',
            padding: '2rem',
            background: 'var(--bg-base, hsl(222, 20%, 8%))',
            color: 'var(--text-100, hsl(210, 20%, 96%))',
            fontFamily: "var(--font-sans, 'Inter', system-ui, sans-serif)",
          }}
        >
          <div style={{ maxWidth: 520, textAlign: 'center' }}>
            <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</p>
            <h1
              style={{
                fontSize: '1.75rem',
                marginBottom: '0.75rem',
                fontFamily: "var(--font-serif, 'Playfair Display', Georgia, serif)",
              }}
            >
              Something went wrong
            </h1>
            <p
              style={{
                color: 'var(--text-200, hsl(210, 15%, 75%))',
                lineHeight: 1.65,
                marginBottom: '1.5rem',
              }}
            >
              An unexpected error occurred while rendering this page. Try refreshing,
              or reach out directly if the issue persists.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </button>
              <a href="mailto:nwankwosami@gmail.com" className="btn btn--ghost">
                Email Support
              </a>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
