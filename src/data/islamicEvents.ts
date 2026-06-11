import type { IslamicEvent } from '../types'

export const ISLAMIC_EVENTS: IslamicEvent[] = [
  { name: 'Islamic New Year (1 Muharram)', hijriMonth: 1, hijriDay: 1, description: 'Start of the new Hijri year.' },
  { name: 'Day of Ashura', hijriMonth: 1, hijriDay: 10, description: 'A day of fasting and remembrance.' },
  { name: 'Mawlid al-Nabi', hijriMonth: 3, hijriDay: 12, description: "Commemoration of the Prophet Muhammad's (PBUH) birth." },
  { name: 'Start of Ramadan', hijriMonth: 9, hijriDay: 1, description: 'Beginning of the month of fasting — date pending moon sighting confirmation.' },
  { name: 'Laylat al-Qadr (estimated)', hijriMonth: 9, hijriDay: 27, description: 'The Night of Decree, commonly observed in the last ten nights of Ramadan.' },
  { name: 'Eid al-Fitr', hijriMonth: 10, hijriDay: 1, description: 'Festival marking the end of Ramadan — date pending moon sighting confirmation.' },
  { name: 'Eid al-Adha', hijriMonth: 12, hijriDay: 10, description: 'Festival of Sacrifice, during the Hajj season.' },
]
