import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { productsMaster } from '../db/schema.js'
import type { NutrimentData } from '../intelligence/productAnalyser.js'

export interface MasterProduct {
  barcode: string
  name: string
  brand: string | null
  imageUrl: string | null
  ingredientsText: string | null
  allergens: string[]
  nutriments: NutrimentData | null
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000

interface OpenFoodFactsApiProduct {
  product_name?: string
  brands?: string
  image_front_small_url?: string
  ingredients_text_en?: string
  ingredients_text?: string
  allergens_tags?: string[]
  nutriments?: NutrimentData
}

async function fetchFromOpenFoodFacts(barcode: string): Promise<MasterProduct | null> {
  const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`
  const res = await fetch(url, { headers: { 'User-Agent': 'HaloApp/1.0' } })
  if (!res.ok) {
    throw new Error(`Open Food Facts request failed (${res.status})`)
  }

  const json = (await res.json()) as { status?: number; product?: OpenFoodFactsApiProduct }
  if (json.status !== 1 || !json.product) return null

  const product = json.product
  return {
    barcode,
    name: product.product_name || 'Unknown product',
    brand: product.brands || null,
    imageUrl: product.image_front_small_url || null,
    ingredientsText: product.ingredients_text_en || product.ingredients_text || null,
    allergens: product.allergens_tags ?? [],
    nutriments: product.nutriments ?? null,
  }
}

function fromRow(row: typeof productsMaster.$inferSelect): MasterProduct {
  return {
    barcode: row.barcode,
    name: row.name,
    brand: row.brand,
    imageUrl: row.imageUrl,
    ingredientsText: row.ingredientsText,
    allergens: row.allergens,
    nutriments: row.nutriments as NutrimentData | null,
  }
}

export async function getProductByBarcode(barcode: string): Promise<MasterProduct | null> {
  const [cached] = await db.select().from(productsMaster).where(eq(productsMaster.barcode, barcode))

  if (cached && Date.now() - cached.lastVerified.getTime() < CACHE_TTL_MS) {
    return fromRow(cached)
  }

  let fetched: MasterProduct | null
  try {
    fetched = await fetchFromOpenFoodFacts(barcode)
  } catch (err) {
    if (cached) return fromRow(cached)
    throw err
  }

  if (!fetched) {
    return cached ? fromRow(cached) : null
  }

  if (cached) {
    await db
      .update(productsMaster)
      .set({
        name: fetched.name,
        brand: fetched.brand,
        imageUrl: fetched.imageUrl,
        ingredientsText: fetched.ingredientsText,
        allergens: fetched.allergens,
        nutriments: fetched.nutriments,
        lastVerified: new Date(),
      })
      .where(eq(productsMaster.barcode, barcode))
  } else {
    await db.insert(productsMaster).values({
      barcode: fetched.barcode,
      name: fetched.name,
      brand: fetched.brand,
      imageUrl: fetched.imageUrl,
      ingredientsText: fetched.ingredientsText,
      allergens: fetched.allergens,
      nutriments: fetched.nutriments,
    })
  }

  return fetched
}
