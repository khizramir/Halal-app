import { NavLink, Outlet } from 'react-router-dom'
import AuthButton from './AuthButton'
import FeedbackWidget from './FeedbackWidget'

const navItems = [
  { to: '/', label: 'Home', icon: '🏠', end: true },
  { to: '/prayer-times', label: 'Prayer', icon: '🕌' },
  { to: '/qibla', label: 'Qibla', icon: '🧭' },
  { to: '/restaurants', label: 'Eat', icon: '🍽️' },
  { to: '/scanner', label: 'Scan', icon: '📷' },
  { to: '/profile', label: 'Profile', icon: '👤' },
]

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-emerald-deep px-4 py-3 text-white shadow">
        <h1 className="text-lg font-semibold">Halal Hub Australia</h1>
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
      </nav>
    </div>
  )
}
