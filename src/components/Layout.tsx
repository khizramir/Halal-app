import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import AuthButton from './AuthButton'
import FeedbackWidget from './FeedbackWidget'

const navItems = [
  { to: '/', label: 'Home', icon: '🏠', end: true },
  { to: '/scanner', label: 'Scan', icon: '📷' },
  { to: '/shop', label: 'Shop', icon: '🛒' },
  { to: '/restaurants', label: 'Eat', icon: '🍽️' },
]

const moreItems = [
  { to: '/lifestyle', label: 'Lifestyle', icon: '✨', desc: 'Halal living categories' },
  { to: '/meals', label: 'Meal Planner', icon: '🍲', desc: 'AI weekly meal plans' },
  { to: '/prayer-times', label: 'Prayer Times', icon: '🕌', desc: 'Daily times & countdown' },
  { to: '/qibla', label: 'Qibla', icon: '🧭', desc: 'Find the direction to Makkah' },
  { to: '/calendar', label: 'Islamic Calendar', icon: '🌙', desc: 'Hijri date & events' },
  { to: '/adhkar', label: 'Adhkar', icon: '📿', desc: 'Daily remembrance' },
  { to: '/zakat', label: 'Zakat', icon: '🧮', desc: 'Zakat calculator' },
  { to: '/submit', label: 'Community', icon: '📝', desc: 'Submit a restaurant or product' },
  { to: '/profile', label: 'Profile', icon: '👤', desc: 'Your account & history' },
  { to: '/settings', label: 'Settings', icon: '⚙️', desc: 'Notifications & app info' },
]

export default function Layout() {
  const [showMore, setShowMore] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-emerald-deep px-4 py-3 text-white shadow">
        <h1 className="text-lg font-semibold">Halo</h1>
        <AuthButton />
      </header>

      <main className="flex-1 px-4 pb-24 pt-4">
        <Outlet />
      </main>

      <FeedbackWidget />

      <nav className="fixed bottom-0 left-0 right-0 z-10 flex border-t border-emerald-deep/10 bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-2 text-xs ${
                isActive ? 'text-emerald font-semibold' : 'text-gray-500'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
        <button
          onClick={() => setShowMore(true)}
          className="flex flex-1 flex-col items-center gap-0.5 py-2 text-xs text-gray-500"
        >
          <span className="text-lg">☰</span>
          More
        </button>
      </nav>

      {showMore && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40" onClick={() => setShowMore(false)}>
          <div
            className="max-h-[75vh] overflow-y-auto rounded-t-2xl bg-white p-4 pb-8 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-emerald-deep">More</h2>
              <button onClick={() => setShowMore(false)} className="text-2xl text-gray-400">
                ×
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {moreItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setShowMore(false)}
                  className="flex flex-col items-start gap-1 rounded-xl bg-cream p-3 text-sm"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-semibold text-emerald-deep">{item.label}</span>
                  <span className="text-xs text-gray-500">{item.desc}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
