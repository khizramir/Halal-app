import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { productCache } from '../db/schema.js'

export interface WoolworthsProduct {
  sku: string
  name: string
  brand: string | null
  price: number | null
  unit: string | null
  image: string | null
  url: string
  badges: string[]
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000

// Heuristic keyword lists used to flag products for common dietary needs.
// Woolworths search results don't carry certification data, so this is a
// best-effort signal based on the product name only — always verify halal
// certification separately.
const DIETARY_EXCLUDE_KEYWORDS: Record<string, string[]> = {
  halal: ['pork', 'bacon', 'ham', 'salami', 'pepperoni', 'prosciutto', 'chorizo', 'wine', 'beer', 'alcohol', 'sherry', 'rum', 'brandy', 'gelatine', 'gelatin'],
  vegetarian: ['beef', 'chicken', 'pork', 'lamb', 'fish', 'salmon', 'tuna', 'bacon', 'ham', 'prawn', 'shrimp', 'meat'],
  gluten_free: ['wheat', 'barley', 'rye', 'bread', 'pasta', 'flour', 'noodle', 'cracker', 'biscuit'],
  dairy_free: ['milk', 'cheese', 'cream', 'butter', 'yoghurt', 'yogurt', 'custard'],
  nut_allergy: ['almond', 'cashew', 'peanut', 'walnut', 'pistachio', 'hazelnut', 'pecan', 'macadamia'],
  kosher: ['pork', 'bacon', 'ham', 'shellfish', 'prawn', 'shrimp'],
}

const HALAL_CERTIFIED_HINTS = ['halal']

function badgesForProduct(name: string): string[] {
  const lower = name.toLowerCase()
  const badges: string[] = []
  if (HALAL_CERTIFIED_HINTS.some((h) => lower.includes(h))) badges.push('halal_labelled')
  for (const [diet, keywords] of Object.entries(DIETARY_EXCLUDE_KEYWORDS)) {
    if (keywords.some((k) => lower.includes(k))) badges.push(`contains_${diet}_flag`)
  }
  return badges
}

interface WoolworthsApiProduct {
  Stockcode?: number
  Name?: string
  Brand?: string
  Price?: number
  PackageSize?: string
  SmallImageFile?: string
  Barcode?: string
}

interface WoolworthsApiResponse {
  Products?: { Products?: WoolworthsApiProduct[] }[]
}

async function fetchFromWoolworths(query: string): Promise<WoolworthsProduct[]> {
  const url = `https://www.woolworths.com.au/apis/ui/Search/products?SearchTerm=${encodeURIComponent(query)}&PageSize=24&SortType=TraderRelevance&Substring=false&FilterByCategory=&IsSpecial=false`

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0',
    },
  })

  if (!res.ok) {
    throw new Error(`Woolworths search failed (${res.status})`)
  }

  const data = (await res.json()) as WoolworthsApiResponse
  const items = (data.Products ?? []).flatMap((bucket) => bucket.Products ?? [])

  return items
    .filter((p) => p.Stockcode && p.Name)
    .map((p) => ({
      sku: String(p.Stockcode),
      name: p.Name ?? '',
      brand: p.Brand ?? null,
      price: typeof p.Price === 'number' ? p.Price : null,
      unit: p.PackageSize ?? null,
      image: p.SmallImageFile ?? null,
      url: `https://www.woolworths.com.au/shop/productdetails/${p.Stockcode}`,
      badges: badgesForProduct(p.Name ?? ''),
    }))
}

export async function searchWoolworths(query: string): Promise<WoolworthsProduct[]> {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return []

  const [cached] = await db.select().from(productCache).where(eq(productCache.query, normalized))

  if (cached && Date.now() - cached.fetchedAt.getTime() < CACHE_TTL_MS) {
    return cached.results as WoolworthsProduct[]
  }

  let results: WoolworthsProduct[]
  try {
    results = await fetchFromWoolworths(normalized)
  } catch (err) {
    if (cached) return cached.results as WoolworthsProduct[]
    throw err
  }

  if (cached) {
    await db
      .update(productCache)
      .set({ results, fetchedAt: new Date() })
      .where(eq(productCache.query, normalized))
  } else {
    await db.insert(productCache).values({ query: normalized, results })
  }

  return results
}

export function filterByDietary(products: WoolworthsProduct[], dietaryRequirements: string[]): WoolworthsProduct[] {
  if (dietaryRequirements.length === 0) return products
  return products.filter((p) => {
    return !dietaryRequirements.some((diet) => p.badges.includes(`contains_${diet}_flag`))
  })
}
