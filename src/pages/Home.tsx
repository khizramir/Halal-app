import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchPrayerTimes, type TimingsResponse } from '../lib/aladhan'
import { useGeolocation } from '../lib/useGeolocation'
import { formatCountdown, getNextPrayer } from '../lib/prayer'
import { getHijriDate } from '../lib/hijri'

const features = [
  { to: '/prayer-times', icon: '🕌', label: 'Prayer Times', desc: 'Daily times & countdown' },
  { to: '/qibla', icon: '🧭', label: 'Qibla Compass', desc: 'Find the direction to Makkah' },
  { to: '/scanner', icon: '📷', label: 'Halal Scanner', desc: 'Check products by barcode' },
  { to: '/restaurants', icon: '🍽️', label: 'Restaurant Finder', desc: 'Halal eats near you' },
  { to: '/calendar', icon: '🌙', label: 'Islamic Calendar', desc: 'Hijri date & upcoming events' },
  { to: '/adhkar', icon: '📿', label: 'Adhkar', desc: 'Daily remembrance & counter' },
  { to: '/zakat', icon: '🧮', label: 'Zakat Calculator', desc: 'Calculate your Zakat' },
  { to: '/submit', icon: '📝', label: 'Community', desc: 'Submit a restaurant or product' },
]

export default function Home() {
  const { latitude, longitude } = useGeolocation()
  const [data, setData] = useState<TimingsResponse | null>(null)
  const [now, setNow] = useState(new Date())
  const hijri = getHijriDate()

  useEffect(() => {
    if (latitude == null || longitude == null) return
    fetchPrayerTimes(latitude, longitude).then(setData).catch(() => {})
  }, [latitude, longitude])

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const next = data ? getNextPrayer(data.timings, now) : null

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-emerald-deep p-4 text-white shadow">
        <p className="text-sm opacity-80">
          {hijri.day} {hijri.monthName} {hijri.year} AH ·{' '}
          {now.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        {next ? (
          <div className="mt-2">
            <p className="text-sm uppercase tracking-wide opacity-80">Next prayer: {next.name}</p>
            <p className="font-mono text-2xl font-bold">{formatCountdown(next.msUntil)}</p>
          </div>
        ) : (
          <p className="mt-2 text-sm opacity-80">Loading prayer times…</p>
        )}
      </div>

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
