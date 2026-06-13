import type { BasketResult, MealPlanResult, SavedItem, ScanBarcodeResult, ScanHistoryEntry, ScanPhotoResult, ShopProduct, UserProfile } from '../types'

async function request<T>(url: string, options?: RequestInit): Promise<T | null> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) return null
  if (res.status === 204) return null
  return (await res.json()) as T
}

export function getProfile() {
  return request<UserProfile | null>('/api/profile')
}

export function saveProfile(updates: Partial<UserProfile>) {
  return request<UserProfile>('/api/profile', {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
}

export function getScanHistory() {
  return request<ScanHistoryEntry[]>('/api/scan-history')
}

export function addScanHistory(entry: {
  barcode: string
  productName: string
  brand?: string | null
  resultStatus: string
  dietaryFlags?: string[]
}) {
  return request<ScanHistoryEntry>('/api/scan-history', {
    method: 'POST',
    body: JSON.stringify(entry),
  })
}

export function getSavedItems() {
  return request<SavedItem[]>('/api/saved-items')
}

export function saveItem(item: {
  itemType: 'product' | 'restaurant'
  referenceId: string
  itemName: string
  itemData?: unknown
}) {
  return request<SavedItem>('/api/saved-items', {
    method: 'POST',
    body: JSON.stringify(item),
  })
}

export function removeSavedItem(id: string) {
  return request<null>(`/api/saved-items/${id}`, { method: 'DELETE' })
}

export interface TrendingProduct {
  productName: string
  brand: string | null
  resultStatus: string
  count: number
}

export function getTrendingProducts() {
  return request<TrendingProduct[]>('/api/scan-history/trending')
}

export function searchShop(query: string, dietaryRequirements: string[] = []) {
  const params = new URLSearchParams({ q: query })
  if (dietaryRequirements.length) params.set('dietary', dietaryRequirements.join(','))
  return request<{ products: ShopProduct[] }>(`/api/shop/search?${params.toString()}`)
}

export function buildBasket(request_: string, dietaryRequirements: string[] = []) {
  return request<BasketResult>('/api/shop/basket', {
    method: 'POST',
    body: JSON.stringify({ request: request_, dietaryRequirements }),
  })
}

export function scanBarcode(barcode: string, dietaryProfile: string[] = []) {
  return request<ScanBarcodeResult>('/api/scan/barcode', {
    method: 'POST',
    body: JSON.stringify({ barcode, dietaryProfile }),
  })
}

export function scanPhoto(image: string, mediaType: string, dietaryProfile: string[] = []) {
  return request<ScanPhotoResult>('/api/scan/photo', {
    method: 'POST',
    body: JSON.stringify({ image, mediaType, dietaryProfile }),
  })
}

export function getMealPlan(request_: string, dietaryRequirements: string[] = []) {
  return request<MealPlanResult>('/api/meal-plan', {
    method: 'POST',
    body: JSON.stringify({ request: request_, dietaryRequirements }),
  })
}

export function submitFeedback(payload: {
  rating: number
  category: string
  message?: string
  appVersion?: string
}) {
  return request('/api/feedback', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
