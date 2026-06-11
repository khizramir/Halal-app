export interface Restaurant {
  id: string
  name: string
  city: string
  suburb: string
  cuisine: string
  certifier: 'AFIC' | 'ICCA' | 'Halal Australia' | 'Self-declared'
  familyFriendly: boolean
  prayerSpace: boolean
  address: string
}

export interface Dhikr {
  id: string
  arabic: string
  transliteration: string
  translation: string
  repeat: number
}

export interface DhikrSet {
  id: string
  title: string
  items: Dhikr[]
}

export interface IslamicEvent {
  name: string
  hijriMonth: number
  hijriDay: number
  description: string
}

export interface CommunitySubmission {
  id: string
  type: 'restaurant' | 'product'
  name: string
  details: string
  city?: string
  submittedAt: string
}
