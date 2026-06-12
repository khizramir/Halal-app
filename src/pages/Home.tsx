import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchPrayerTimes, type TimingsResponse } from '../lib/aladhan'
import { useGeolocation } from '../lib/useGeolocation'
import { formatCountdown, getNextPrayer } from '../lib/prayer'
import { getHijriDate, findNextHijriOccurrence } from '../lib/hijri'
import { useSession } from '../lib/auth'
import { useAppProfile } from '../lib/useAppProfile'
import { getScanHistory, getTrendingProducts, type TrendingProduct } from '../lib/api'
import { DIETARY_REQUIREMENTS } from '../types'
import type { ScanHistoryEntry } from '../types'
import { restaurants as fallbackRestaurants } from '../data/restaurants'

const RAMADAN_HIJRI_MONTH = 9

const features = [
  { to: '/prayer-times', icon: '🕌', label: 'Prayer Times', desc: 'Daily times & countdown' },
  { to: '/qibla', icon: '🧭', label: 'Qibla Compass', desc: 'Find the direction to Makkah' },
  { to: '/scanner', icon: '📷', label: 'Halal Scanner', desc: 'Check products by barcode' },
  { to: '/restaurants', icon: '🍽️', label: 'Restaurant Finder', desc: 'Halal eats near you' },
  { to: '/shop', icon: '🛒', label: 'Shop Groceries', desc: 'Smart halal basket builder' },
  { to: '/meals', icon: '🍲', label: 'Meal Planner', desc: 'AI weekly meal plans' },
  { to: '/calendar', icon: '🌙', label: 'Islamic Calendar', desc: 'Hijri date & upcoming events' },
  { to: '/adhkar', icon: '📿', label: 'Adhkar', desc: 'Daily remembrance & counter' },
  { to: '/zakat', icon: '🧮', label: 'Zakat Calculator', desc: 'Calculate your Zakat' },
  { to: '/submit', icon: '📝', label: 'Community', desc: 'Submit a restaurant or product' },
]

export default function Home() {
  const { latitude, longitude } = useGeolocation()
  const { session } = useSession()
  const profile = useAppProfile()
  const [data, setData] = useState<TimingsResponse | null>(null)
  const [now, setNow] = useState(new Date())
  const [recentScans, setRecentScans] = useState<ScanHistoryEntry[]>([])
  const [trending, setTrending] = useState<TrendingProduct[]>([])
  const hijri = getHijriDate()

  useEffect(() => {
    if (latitude == null || longitude == null) return
    fetchPrayerTimes(latitude, longitude).then(setData).catch(() => {})
  }, [latitude, longitude])

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!session?.user) return
    getScanHistory().then((rows) => setRecentScans((rows ?? []).slice(0, 5)))
  }, [session?.user])

  useEffect(() => {
    getTrendingProducts().then((rows) => setTrending(rows ?? []))
  }, [])

  const next = data ? getNextPrayer(data.timings, now) : null

  const ramadanStart = findNextHijriOccurrence(RAMADAN_HIJRI_MONTH, 1, now)
  const inRamadan = hijri.month === RAMADAN_HIJRI_MONTH
  const showRamadanMode = inRamadan || ramadanStart.daysAway <= 30

  const greetingName = session?.user?.name?.split(' ')[0]
  const halalSelected = profile.dietaryRequirements.includes('halal')
  const nearbyRestaurants = profile.city
    ? fallbackRestaurants.filter((r) => r.city === profile.city).slice(0, 3)
    : []

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-emerald-deep">
          {greetingName ? `Assalamu Alaikum, ${greetingName} 👋` : 'Welcome to MuslimDaily'}
        </h2>
        <p className="text-sm text-gray-500">
          {hijri.day} {hijri.monthName} {hijri.year} AH ·{' '}
          {now.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {profile.dietaryRequirements.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {profile.dietaryRequirements.map((id) => {
            const req = DIETARY_REQUIREMENTS.find((d) => d.id === id)
            if (!req) return null
            return (
              <span key={id} className="rounded-full bg-emerald/10 px-3 py-1 text-xs font-medium text-emerald">
                {req.label}
              </span>
            )
          })}
        </div>
      )}

      <div className="rounded-xl bg-emerald-deep p-4 text-white shadow">
        {next ? (
          <div>
            <p className="text-sm uppercase tracking-wide opacity-80">Next prayer: {next.name}</p>
            <p className="font-mono text-2xl font-bold">{formatCountdown(next.msUntil)}</p>
          </div>
        ) : (
          <p className="text-sm opacity-80">Loading prayer times…</p>
        )}
      </div>

      <Link
        to="/scanner"
        className="flex items-center justify-center gap-2 rounded-xl bg-emerald py-4 text-base font-semibold text-white shadow"
      >
        📷 Quick Scan
      </Link>

      {showRamadanMode && data && (
        <div className="rounded-xl border border-emerald-deep/20 bg-white p-4 shadow">
          <p className="font-semibold text-emerald-deep">
            🌙 {inRamadan ? 'Ramadan Mubarak!' : `Ramadan begins in ${ramadanStart.daysAway} day(s)`}
          </p>
          <div className="mt-2 flex justify-between text-sm">
            <div>
              <p className="text-gray-500">Suhoor ends</p>
              <p className="font-mono text-lg font-bold text-emerald-deep">{data.timings.Fajr}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500">Iftar</p>
              <p className="font-mono text-lg font-bold text-emerald-deep">{data.timings.Maghrib}</p>
            </div>
          </div>
        </div>
      )}

      {halalSelected && (
        <div className="rounded-xl bg-white p-4 shadow">
          <h3 className="font-semibold text-emerald-deep">Recently verified halal products</h3>
          <p className="mt-1 text-sm text-gray-500">
            Scan a product barcode to check its halal status — verified items appear here.
          </p>
          <Link to="/scanner" className="mt-2 inline-block text-sm font-medium text-emerald underline">
            Open Scanner →
          </Link>
        </div>
      )}

      {profile.city && nearbyRestaurants.length > 0 && (
        <div className="rounded-xl bg-white p-4 shadow">
          <h3 className="font-semibold text-emerald-deep">Halal restaurants near {profile.city}</h3>
          <div className="mt-2 space-y-2">
            {nearbyRestaurants.map((r) => (
              <Link key={r.id} to="/restaurants" className="block rounded-lg bg-cream p-2 text-sm">
                <span className="font-medium text-emerald-deep">{r.name}</span>
                <span className="text-gray-500"> · {r.suburb}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {recentScans.length > 0 && (
        <div className="rounded-xl bg-white p-4 shadow">
          <h3 className="font-semibold text-emerald-deep">Continue where you left off</h3>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {recentScans.map((s) => (
              <Link
                key={s.id}
                to="/scanner"
                className="flex-shrink-0 rounded-lg bg-cream p-2 text-sm min-w-[140px]"
              >
                <span className="block font-medium text-emerald-deep">{s.productName}</span>
                {s.brand && <span className="text-gray-500">{s.brand}</span>}
                <span className="block text-xs uppercase text-gray-400">{s.resultStatus}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {trending.length > 0 && (
        <div className="rounded-xl bg-white p-4 shadow">
          <h3 className="font-semibold text-emerald-deep">Trending halal products this week</h3>
          <div className="mt-2 space-y-2">
            {trending.map((t) => (
              <div key={`${t.productName}-${t.brand}`} className="flex items-center justify-between rounded-lg bg-cream p-2 text-sm">
                <div>
                  <span className="font-medium text-emerald-deep">{t.productName}</span>
                  {t.brand && <span className="text-gray-500"> · {t.brand}</span>}
                </div>
                <span className="text-xs uppercase text-gray-400">{t.resultStatus}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {features.map((f) => (
          <Link
            key={f.to}
            to={f.to}
            className="flex flex-col items-start gap-1 rounded-xl bg-white p-4 shadow transition hover:shadow-md"
          >
            <span className="text-2xl">{f.icon}</span>
            <span className="font-semibold text-emerald-deep">{f.label}</span>
            <span className="text-xs text-gray-500">{f.desc}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
