export interface HijriDate {
  year: number
  month: number
  day: number
  monthName: string
}

const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
})

const monthNameFormatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
  month: 'long',
})

export function getHijriDate(date: Date = new Date()): HijriDate {
  const parts = formatter.formatToParts(date)
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    monthName: monthNameFormatter.format(date),
  }
}

/**
 * Finds the next Gregorian date (today or later) on which the Hijri calendar
 * shows the given month/day, by scanning forward day by day.
 */
export function findNextHijriOccurrence(
  targetMonth: number,
  targetDay: number,
  from: Date = new Date(),
): { date: Date; daysAway: number } {
  const cursor = new Date(from)
  cursor.setHours(0, 0, 0, 0)

  for (let i = 0; i < 400; i++) {
    const hijri = getHijriDate(cursor)
    if (hijri.month === targetMonth && hijri.day === targetDay) {
      return { date: new Date(cursor), daysAway: i }
    }
    cursor.setDate(cursor.getDate() + 1)
  }

  // Fallback — shouldn't happen within 400 days.
  return { date: from, daysAway: 0 }
}
