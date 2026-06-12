const SCAN_COUNT_KEY = 'halal-hub-guest-scan-count'
const ONBOARDING_KEY = 'halal-hub-onboarding'

export interface GuestOnboarding {
  dietaryRequirements: string[]
  city: string | null
  schoolOfThought: string | null
  complete: boolean
}

export function getGuestScanCount(): number {
  return Number(localStorage.getItem(SCAN_COUNT_KEY) ?? '0')
}

export function incrementGuestScanCount(): number {
  const next = getGuestScanCount() + 1
  localStorage.setItem(SCAN_COUNT_KEY, String(next))
  return next
}

export function getGuestOnboarding(): GuestOnboarding {
  try {
    const raw = localStorage.getItem(ONBOARDING_KEY)
    if (!raw) return { dietaryRequirements: [], city: null, schoolOfThought: null, complete: false }
    return JSON.parse(raw) as GuestOnboarding
  } catch {
    return { dietaryRequirements: [], city: null, schoolOfThought: null, complete: false }
  }
}

export function saveGuestOnboarding(data: GuestOnboarding) {
  localStorage.setItem(ONBOARDING_KEY, JSON.stringify(data))
}
