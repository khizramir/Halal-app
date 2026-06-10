import { BrowserRouter, Routes, Route } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import ErrorBoundary from './components/ErrorBoundary'
import Home from './pages/Home'
import Scanner from './pages/Scanner'
import Restaurants from './pages/Restaurants'
import Lifestyle from './pages/Lifestyle'
import Zakat from './pages/Zakat'
import Profile from './pages/Profile'

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <div className="min-h-screen bg-background pb-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/scan" element={<Scanner />} />
            <Route path="/restaurants" element={<Restaurants />} />
            <Route path="/lifestyle" element={<Lifestyle />} />
            <Route path="/zakat" element={<Zakat />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
          <BottomNav />
        </div>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
