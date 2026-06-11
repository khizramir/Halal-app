import { useEffect, useState } from 'react'
import { fetchPrayerTimes, type TimingsResponse } from '../lib/aladhan'
import { useGeolocation } from '../lib/useGeolocation'
import { PRAYER_ORDER, cleanTime, formatCountdown, getNextPrayer } from '../lib/prayer'

export default function PrayerTimes() {
  const { latitude, longitude, error: geoError, loading: geoLoading } = useGeolocation()
  const [data, setData] = useState<TimingsResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [now, setNow] = useState(new Date())
  const [notifyEnabled, setNotifyEnabled] = useState(false)

  useEffect(() => {
    if (latitude == null || longitude == null) return
    fetchPrayerTimes(latitude, longitude)
      .then(setData)
      .catch((err) => setError(err.message))
  }, [latitude, longitude])

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const next = data ? getNextPrayer(data.timings, now) : null

  useEffect(() => {
    if (!notifyEnabled || !next || typeof Notification === 'undefined') return
    if (next.msUntil > 60000) return

    const timer = setTimeout(() => {
      new Notification(`${next.name} prayer time`, {
        body: `It's time for ${next.name}.`,
      })
    }, next.msUntil)

    return () => clearTimeout(timer)
  }, [notifyEnabled, next])

  const handleEnableNotifications = async () => {
    if (typeof Notification === 'undefined') return
    const permission = await Notification.requestPermission()
    setNotifyEnabled(permission === 'granted')
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-emerald-deep">Prayer Times</h2>

      {geoLoading && <p className="text-gray-500">Getting your location…</p>}
      {geoError && <p className="text-sm text-amber-600">{geoError}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {next && (
        <div className="rounded-xl bg-emerald-deep p-4 text-center text-white shadow">
          <p className="text-sm uppercase tracking-wide opacity-80">Next prayer</p>
          <p className="text-2xl font-bold">{next.name}</p>
          <p className="font-mono text-3xl">{formatCountdown(next.msUntil)}</p>
        </div>
      )}

      <button
        onClick={handleEnableNotifications}
        className="w-full rounded-lg border border-emerald bg-white py-2 text-emerald font-medium"
      >
        {notifyEnabled ? '🔔 Notifications enabled' : 'Enable prayer notifications'}
      </button>

      {data && (
        <div className="overflow-hidden rounded-xl bg-white shadow">
          {PRAYER_ORDER.map((name) => {
            const isNext = next?.name === name
            return (
              <div
                key={name}
                className={`flex justify-between border-b border-gray-100 px-4 py-3 last:border-0 ${
                  isNext ? 'bg-gold/10 font-semibold text-emerald-deep' : ''
                }`}
              >
                <span>{name}</span>
                <span className="font-mono">{cleanTime(data.timings[name])}</span>
              </div>
            )
          })}
        </div>
      )}

      {data && (
        <p className="text-center text-sm text-gray-500">
          {data.date.hijri.day} {data.date.hijri.month.en} {data.date.hijri.year} AH ·{' '}
          {data.date.gregorian.date}
        </p>
      )}

      <p className="text-center text-xs text-gray-400">
        Calculation method: Muslim World League. Times via Aladhan API.
      </p>
    </div>
  )
}
