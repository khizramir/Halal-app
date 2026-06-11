import { useEffect, useState } from 'react'
import { addSubmission, getSubmissions } from '../lib/submissions'
import { useSession } from '../lib/auth'
import type { CommunitySubmission } from '../types'

interface ApiReport {
  id: string
  type: 'restaurant' | 'product'
  name: string
  city: string | null
  details: string | null
  status: string
  createdAt: string
}

export default function Submit() {
  const { session } = useSession()
  const [type, setType] = useState<CommunitySubmission['type']>('restaurant')
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [details, setDetails] = useState('')
  const [localSubmissions, setLocalSubmissions] = useState<CommunitySubmission[]>(getSubmissions())
  const [apiReports, setApiReports] = useState<ApiReport[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadApiReports = () => {
    fetch('/api/reports')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setApiReports)
      .catch(() => {})
  }

  useEffect(() => {
    loadApiReports()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setError(null)

    if (session?.user) {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, name: name.trim(), city: city.trim() || undefined, details: details.trim() }),
      })
      if (!res.ok) {
        setError('Could not submit — please try again.')
        return
      }
      loadApiReports()
    } else {
      addSubmission({ type, name: name.trim(), city: city.trim() || undefined, details: details.trim() })
      setLocalSubmissions(getSubmissions())
    }

    setName('')
    setCity('')
    setDetails('')
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 2000)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-emerald-deep">Community Submissions</h2>
      <p className="text-sm text-gray-500">
        Know a halal restaurant or product that's missing? Submit it here.{' '}
        {session?.user
          ? 'Your submission will be added to the shared review queue.'
          : 'Sign in to submit to the shared database — for now this will be saved locally on your device.'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-3 rounded-xl bg-white p-4 shadow">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setType('restaurant')}
            className={`flex-1 rounded-lg py-2 text-sm ${
              type === 'restaurant' ? 'bg-emerald-deep text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Restaurant
          </button>
          <button
            type="button"
            onClick={() => setType('product')}
            className={`flex-1 rounded-lg py-2 text-sm ${
              type === 'product' ? 'bg-emerald-deep text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Product
          </button>
        </div>

        <label className="block text-sm font-medium text-gray-700">
          Name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </label>

        {type === 'restaurant' && (
          <label className="block text-sm font-medium text-gray-700">
            City
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </label>
        )}

        <label className="block text-sm font-medium text-gray-700">
          Details (address, certifier, why it should be added…)
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-lg bg-emerald-deep py-2 text-sm font-semibold text-white"
        >
          Submit
        </button>
        {submitted && <p className="text-center text-sm text-emerald">Thanks for your submission!</p>}
        {error && <p className="text-center text-sm text-red-600">{error}</p>}
      </form>

      {apiReports.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-500">Community submissions</h3>
          {apiReports.map((s) => (
            <div key={s.id} className="rounded-xl bg-white p-3 shadow">
              <div className="flex justify-between">
                <span className="font-medium text-emerald-deep">{s.name}</span>
                <span className="text-xs text-gray-400">{s.type} · {s.status}</span>
              </div>
              {s.city && <p className="text-sm text-gray-500">{s.city}</p>}
              {s.details && <p className="text-sm text-gray-600">{s.details}</p>}
            </div>
          ))}
        </div>
      )}

      {localSubmissions.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-500">Your local submissions</h3>
          {localSubmissions.map((s) => (
            <div key={s.id} className="rounded-xl bg-white p-3 shadow">
              <div className="flex justify-between">
                <span className="font-medium text-emerald-deep">{s.name}</span>
                <span className="text-xs text-gray-400">{s.type}</span>
              </div>
              {s.city && <p className="text-sm text-gray-500">{s.city}</p>}
              {s.details && <p className="text-sm text-gray-600">{s.details}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
