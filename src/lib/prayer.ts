import type { PrayerTimings } from './aladhan'

export const PRAYER_ORDER: (keyof PrayerTimings)[] = [
  'Fajr',
  'Sunrise',
  'Dhuhr',
  'Asr',
  'Maghrib',
  'Isha',
]

// Aladhan returns times like "05:32 (AEST)" — strip any trailing annotation.
export function cleanTime(raw: string): string {
  return raw.split(' ')[0]
}

export function timeStringToDate(time: string, reference: Date = new Date()): Date {
  const [hours, minutes] = cleanTime(time).split(':').map(Number)
  const date = new Date(reference)
  date.setHours(hours, minutes, 0, 0)
  return date
}

export interface NextPrayer {
  name: keyof PrayerTimings
  time: Date
  msUntil: number
}

export function getNextPrayer(timings: PrayerTimings, now: Date = new Date()): NextPrayer {
  const candidates = PRAYER_ORDER.filter((name) => name !== 'Sunrise').map((name) => ({
    name,
    time: timeStringToDate(timings[name], now),
  }))

  for (const candidate of candidates) {
    if (candidate.time.getTime() > now.getTime()) {
      return { ...candidate, msUntil: candidate.time.getTime() - now.getTime() }
    }
  }

  // All prayers passed — next is tomorrow's Fajr.
  const tomorrowFajr = timeStringToDate(timings.Fajr, now)
  tomorrowFajr.setDate(tomorrowFajr.getDate() + 1)
  return { name: 'Fajr', time: tomorrowFajr, msUntil: tomorrowFajr.getTime() - now.getTime() }
}

export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
