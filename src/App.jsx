import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import CaseStudy from './pages/CaseStudy'
import NotFound from './pages/NotFound'
import ErrorBoundary from './components/ErrorBoundary'
import PrivacyPreferences from './components/PrivacyPreferences'

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/case-studies/family-tree-platform"
            element={<CaseStudy />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <PrivacyPreferences />
      </Router>
    </ErrorBoundary>
  )
}

export default App
