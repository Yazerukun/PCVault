import { useEffect } from 'react'
import { HashRouter, Navigate, Route, Routes, useLocation, useNavigationType } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import GamePage from './pages/GamePage'

function ScrollToTop() {
  const { pathname } = useLocation()
  const navType = useNavigationType()

  useEffect(() => {
    if (navType === 'PUSH') window.scrollTo(0, 0)
  }, [pathname, navType])

  return null
}

function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game/:id" element={<GamePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}

export default App