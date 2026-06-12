import { useEffect, useMemo, useState } from 'react'
import { restaurants as fallbackRestaurants, cities, certifiers } from '../data/restaurants'
import type { Restaurant } from '../types'
import { useSession } from '../lib/auth'
import { getSavedItems, removeSavedItem, saveItem } from '../lib/api'
import { FeedbackModal } from '../components/FeedbackWidget'

export default function Restaurants() {
  const { session } = useSession()
  const [city, setCity] = useState<(typeof cities)[number]>('All')
  const [certifier, setCertifier] = useState<(typeof certifiers)[number]>('All')
  const [familyFriendlyOnly, setFamilyFriendlyOnly] = useState(false)
  const [prayerSpaceOnly, setPrayerSpaceOnly] = useState(false)
  const [restaurants, setRestaurants] = useState<Restaurant[]>(fallbackRestaurants)
  const [savedMap, setSavedMap] = useState<Record<string, string>>({}) // referenceId -> savedItem id
  const [reportTarget, setReportTarget] = useState<Restaurant | null>(null)

  useEffect(() => {
    fetch('/api/restaurants')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((rows: Restaurant[]) => {
        if (rows.length > 0) setRestaurants(rows)
      })
      .catch(() => {
        // Keep the bundled fallback list if the API is unavailable.
      })
  }, [])

  useEffect(() => {
    if (!session?.user) return
    getSavedItems().then((rows) => {
      const map: Record<string, string> = {}
      for (const r of rows ?? []) {
        if (r.itemType === 'restaurant') map[r.referenceId] = r.id
      }
      setSavedMap(map)
    })
  }, [session?.user])

  const toggleSave = async (r: Restaurant) => {
    if (!session?.user) return
    const existingId = savedMap[r.id]
    if (existingId) {
      await removeSavedItem(existingId)
      setSavedMap((prev) => {
        const next = { ...prev }
        delete next[r.id]
        return next
      })
    } else {
      const created = await saveItem({ itemType: 'restaurant', referenceId: r.id, itemName: r.name, itemData: r })
      if (created) setSavedMap((prev) => ({ ...prev, [r.id]: created.id }))
    }
  }

  const filtered = useMemo(() => {
    return restaurants.filter((r) => {
      if (city !== 'All' && r.city !== city) return false
      if (certifier !== 'All' && r.certifier !== certifier) return false
      if (familyFriendlyOnly && !r.familyFriendly) return false
      if (prayerSpaceOnly && !r.prayerSpace) return false
      return true
    })
  }, [restaurants, city, certifier, familyFriendlyOnly, prayerSpaceOnly])

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-emerald-deep">Halal Restaurant Finder</h2>

      <div className="space-y-2 rounded-xl bg-white p-3 shadow">
        <div className="flex gap-2">
          <select
            value={city}
            onChange={(e) => setCity(e.target.value as (typeof cities)[number])}
            className="flex-1 rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
          >
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={certifier}
            onChange={(e) => setCertifier(e.target.value as (typeof certifiers)[number])}
            className="flex-1 rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
          >
            {certifiers.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={familyFriendlyOnly}
              onChange={(e) => setFamilyFriendlyOnly(e.target.checked)}
            />
            Family-friendly
          </label>
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={prayerSpaceOnly}
              onChange={(e) => setPrayerSpaceOnly(e.target.checked)}
            />
            Prayer space
          </label>
        </div>
      </div>

      <p className="text-sm text-gray-500">{filtered.length} result(s)</p>

      <div className="space-y-3">
        {filtered.map((r) => (
          <div key={r.id} className="rounded-xl bg-white p-4 shadow">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-emerald-deep">{r.name}</h3>
                <p className="text-sm text-gray-500">{r.cuisine}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald/10 px-2 py-0.5 text-xs font-medium text-emerald">
                  {r.certifier}
                </span>
                {session?.user && (
                  <button onClick={() => toggleSave(r)} className="text-xl" aria-label="Save restaurant">
                    {savedMap[r.id] ? '🔖' : '📑'}
                  </button>
                )}
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-600">{r.address}</p>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <div className="flex gap-2">
                {r.familyFriendly && <span>👨‍👩‍👧 Family-friendly</span>}
                {r.prayerSpace && <span>🕌 Prayer space</span>}
              </div>
              <button onClick={() => setReportTarget(r)} className="text-gray-400 underline">
                Report an issue
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-gray-400">No restaurants match these filters.</p>
        )}
      </div>

      {reportTarget && (
        <FeedbackModal
          initialCategory="wrong_info"
          prefillMessage={`Issue with ${reportTarget.name} (${reportTarget.suburb}, ${reportTarget.city}): `}
          onClose={() => setReportTarget(null)}
        />
      )}
    </div>
  )
}
