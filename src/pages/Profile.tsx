import { useEffect, useState } from 'react'
import { useSession, signOut } from '../lib/auth'
import { useAppProfile } from '../lib/useAppProfile'
import { getSavedItems, getScanHistory, removeSavedItem } from '../lib/api'
import { AUSTRALIAN_CITIES, DIETARY_REQUIREMENTS, SCHOOLS_OF_THOUGHT } from '../types'
import type { SavedItem, ScanHistoryEntry } from '../types'

const APP_VERSION = '1.0.0'

interface ApiReport {
  id: string
  type: 'restaurant' | 'product'
  name: string
  city: string | null
  details: string | null
  status: string
  submittedBy: string | null
  createdAt: string
}

export default function Profile() {
  const { session } = useSession()
  const profile = useAppProfile()
  const [savedItems, setSavedItems] = useState<SavedItem[]>([])
  const [scanHistory, setScanHistory] = useState<ScanHistoryEntry[]>([])
  const [contributions, setContributions] = useState<ApiReport[]>([])
  const [scanSearch, setScanSearch] = useState('')

  useEffect(() => {
    if (!session?.user) return
    getSavedItems().then((rows) => setSavedItems(rows ?? []))
    getScanHistory().then((rows) => setScanHistory(rows ?? []))
    fetch('/api/reports')
      .then((res) => (res.ok ? res.json() : []))
      .then((rows: ApiReport[]) => setContributions(rows.filter((r) => r.submittedBy === session.user?.id)))
      .catch(() => {})
  }, [session?.user])

  const handleRemoveSaved = async (id: string) => {
    await removeSavedItem(id)
    setSavedItems((prev) => prev.filter((item) => item.id !== id))
  }

  const filteredScans = scanHistory.filter((s) =>
    s.productName.toLowerCase().includes(scanSearch.toLowerCase()),
  )

  const initials = session?.user?.name
    ? session.user.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'G'

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-white p-4 shadow flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-deep/10 text-xl font-bold text-emerald-deep">
          {initials}
        </div>
        <h2 className="mt-2 text-lg font-bold text-gray-800">{session?.user?.name ?? 'Guest User'}</h2>
        <p className="text-sm text-gray-500">{session?.user?.email ?? 'Not signed in'}</p>
        {!session?.user && (
          <p className="mt-2 text-xs text-gray-400">
            Sign up to save your history and preferences across devices.
          </p>
        )}
      </div>

      <section className="rounded-xl bg-white p-4 shadow">
        <h3 className="font-semibold text-emerald-deep">Dietary Requirements</h3>
        <div className="mt-2 space-y-1">
          {DIETARY_REQUIREMENTS.map((d) => (
            <label key={d.id} className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={profile.dietaryRequirements.includes(d.id)}
                onChange={(e) => {
                  const next = e.target.checked
                    ? [...profile.dietaryRequirements, d.id]
                    : profile.dietaryRequirements.filter((id) => id !== d.id)
                  profile.updateProfile({ dietaryRequirements: next })
                }}
              />
              {d.label}
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-xl bg-white p-4 shadow">
        <h3 className="font-semibold text-emerald-deep">My City</h3>
        <select
          value={profile.city ?? ''}
          onChange={(e) => profile.updateProfile({ city: e.target.value || null })}
          className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        >
          <option value="">Not set</option>
          {AUSTRALIAN_CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </section>

      {profile.dietaryRequirements.includes('halal') && (
        <section className="rounded-xl bg-white p-4 shadow">
          <h3 className="font-semibold text-emerald-deep">School of Thought</h3>
          <select
            value={profile.schoolOfThought ?? ''}
            onChange={(e) => profile.updateProfile({ schoolOfThought: e.target.value || null })}
            className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          >
            <option value="">Not set</option>
            {SCHOOLS_OF_THOUGHT.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </section>
      )}

      {session?.user ? (
        <>
          <section className="rounded-xl bg-white p-4 shadow">
            <h3 className="font-semibold text-emerald-deep">My Saved</h3>
            {savedItems.length === 0 ? (
              <p className="mt-1 text-sm text-gray-400">Nothing saved yet — tap the bookmark icon on products or restaurants.</p>
            ) : (
              <div className="mt-2 space-y-2">
                {savedItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg bg-cream p-2 text-sm">
                    <div>
                      <span className="font-medium text-emerald-deep">{item.itemName}</span>
                      <span className="ml-2 text-xs uppercase text-gray-400">{item.itemType}</span>
                    </div>
                    <button onClick={() => handleRemoveSaved(item.id)} className="text-xs text-red-600">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-xl bg-white p-4 shadow">
            <h3 className="font-semibold text-emerald-deep">Scan History</h3>
            <input
              type="text"
              placeholder="Search scans…"
              value={scanSearch}
              onChange={(e) => setScanSearch(e.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
            {filteredScans.length === 0 ? (
              <p className="mt-2 text-sm text-gray-400">No scans yet.</p>
            ) : (
              <div className="mt-2 space-y-2">
                {filteredScans.map((s) => (
                  <div key={s.id} className="rounded-lg bg-cream p-2 text-sm">
                    <span className="font-medium text-emerald-deep">{s.productName}</span>
                    {s.brand && <span className="text-gray-500"> · {s.brand}</span>}
                    <span className="ml-2 text-xs uppercase text-gray-400">{s.resultStatus}</span>
                    <p className="text-xs text-gray-400">{new Date(s.scannedAt).toLocaleString('en-AU')}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-xl bg-white p-4 shadow">
            <h3 className="font-semibold text-emerald-deep">My Contributions</h3>
            {contributions.length === 0 ? (
              <p className="mt-1 text-sm text-gray-400">No submissions yet.</p>
            ) : (
              <div className="mt-2 space-y-2">
                {contributions.map((c) => (
                  <div key={c.id} className="rounded-lg bg-cream p-2 text-sm">
                    <span className="font-medium text-emerald-deep">{c.name}</span>
                    <span className="ml-2 text-xs uppercase text-gray-400">{c.type} · {c.status}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-xl bg-white p-4 shadow">
            <h3 className="font-semibold text-emerald-deep">Notifications</h3>
            <label className="mt-2 flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={profile.notificationsEnabled}
                onChange={async (e) => {
                  const enabled = e.target.checked
                  if (enabled && 'Notification' in window) {
                    await Notification.requestPermission()
                  }
                  profile.updateProfile({ notificationsEnabled: enabled })
                }}
              />
              Prayer time & activity reminders
            </label>
          </section>
        </>
      ) : (
        <section className="rounded-xl bg-white p-4 shadow text-sm text-gray-500">
          <p>Sign in to unlock saved products/restaurants, scan history, and contributions.</p>
        </section>
      )}

      <section className="rounded-xl bg-white p-4 shadow text-sm text-gray-500">
        <p>MuslimDaily v{APP_VERSION}</p>
        <p className="mt-1 text-xs">
          Prayer times: AlAdhan API · Halal certification: AFIC, ICCA, Halal Australia · Product data: Open Food Facts
        </p>
      </section>

      {session?.user && (
        <button onClick={signOut} className="w-full rounded-xl border border-red-200 py-2 text-sm font-medium text-red-600">
          Sign out
        </button>
      )}
    </div>
  )
}
