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

export const DIETARY_REQUIREMENTS = [
  { id: 'halal', label: 'Halal status' },
  { id: 'vegetarian', label: 'Vegetarian / Vegan' },
  { id: 'gluten_free', label: 'Gluten free' },
  { id: 'dairy_free', label: 'Dairy free' },
  { id: 'nut_allergy', label: 'Nut allergies' },
  { id: 'kosher', label: 'Kosher' },
] as const

export const AUSTRALIAN_CITIES = [
  'Sydney',
  'Melbourne',
  'Brisbane',
  'Perth',
  'Adelaide',
  'Other Australian city',
  'Outside Australia',
] as const

export const SCHOOLS_OF_THOUGHT = [
  { id: 'hanafi', label: "Hanafi" },
  { id: 'shafii', label: "Shafi'i" },
  { id: 'general', label: 'General / Not sure' },
] as const

export const USAGE_PURPOSES = [
  { id: 'check_halal', label: 'Check if products are halal when shopping' },
  { id: 'find_restaurants', label: 'Find halal restaurants near me' },
  { id: 'meal_planning', label: 'Plan my weekly meals' },
  { id: 'prayer_times', label: 'Prayer times and Islamic calendar' },
  { id: 'all', label: 'All of the above' },
] as const

export interface UserProfile {
  id: string
  userId: string
  dietaryRequirements: string[]
  city: string | null
  schoolOfThought: string | null
  usagePurposes: string[]
  onboardingComplete: boolean
  notificationsEnabled: boolean
  createdAt: string
}

export interface ScanHistoryEntry {
  id: string
  userId: string
  barcode: string
  productName: string
  brand: string | null
  resultStatus: 'halal' | 'haram' | 'mushbooh' | 'unknown'
  dietaryFlags: string[]
  scannedAt: string
}

export interface SavedItem {
  id: string
  userId: string
  itemType: 'product' | 'restaurant'
  referenceId: string
  itemName: string
  itemData: Record<string, unknown> | null
  savedAt: string
}

export interface ShopProduct {
  sku: string
  name: string
  brand: string | null
  price: number | null
  unit: string | null
  image: string | null
  url: string
  badges: string[]
}

export interface BasketGroup {
  ingredient: string
  query: string
  products: ShopProduct[]
}

export interface BasketResult {
  groups: BasketGroup[]
  estimatedTotal: number
}

export interface MealSuggestion {
  name: string
  cuisine: string
  ingredients: string[]
  estimated_cost_aud: number
  cook_time_minutes: number
}

export interface MealPlanResult {
  meals: MealSuggestion[]
  shoppingList: string[]
}

export const FEEDBACK_CATEGORIES = [
  { id: 'bug', label: 'Bug report' },
  { id: 'missing_product', label: 'Missing product' },
  { id: 'wrong_info', label: 'Wrong info' },
  { id: 'feature_request', label: 'Feature request' },
  { id: 'general', label: 'General feedback' },
] as const
