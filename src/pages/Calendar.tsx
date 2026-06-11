import { useMemo } from 'react'
import { getHijriDate, findNextHijriOccurrence } from '../lib/hijri'
import { ISLAMIC_EVENTS } from '../data/islamicEvents'

const MOONSIGHTING_URL = 'https://moonsighting.com.au/'

export default function Calendar() {
  const today = useMemo(() => getHijriDate(), [])

  const upcoming = useMemo(() => {
    return ISLAMIC_EVENTS.map((event) => {
      const { date, daysAway } = findNextHijriOccurrence(event.hijriMonth, event.hijriDay)
      return { ...event, date, daysAway }
    }).sort((a, b) => a.daysAway - b.daysAway)
  }, [])

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-emerald-deep">Islamic Calendar</h2>

      <div className="rounded-xl bg-emerald-deep p-4 text-center text-white shadow">
        <p className="text-sm uppercase tracking-wide opacity-80">Today (Hijri)</p>
        <p className="text-2xl font-bold">
          {today.day} {today.monthName} {today.year} AH
        </p>
      </div>

      <div className="space-y-3">
        {upcoming.map((event) => (
          <div key={event.name} className="rounded-xl bg-white p-4 shadow">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-emerald-deep">{event.name}</h3>
                <p className="text-sm text-gray-500">{event.description}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {event.date.toLocaleDateString('en-AU', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-gold/15 px-3 py-1 text-sm font-semibold text-gold">
                {event.daysAway === 0 ? 'Today' : `${event.daysAway}d`}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-white p-4 text-sm text-gray-600 shadow">
        <p>
          Dates for Ramadan, Eid al-Fitr and Laylat al-Qadr are estimates based on the tabular
          Islamic calendar. For official Australian moon sighting announcements and confirmed
          Eid dates, check{' '}
          <a href={MOONSIGHTING_URL} target="_blank" rel="noreferrer" className="text-emerald underline">
            moonsighting.com.au
          </a>
          .
        </p>
      </div>
    </div>
  )
}
