export interface FoodProduct {
  code: string
  productName: string
  brands: string
  ingredientsText: string
  imageUrl?: string
}

export async function fetchProductByBarcode(barcode: string): Promise<FoodProduct | null> {
  const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Open Food Facts request failed (${res.status})`)
  }
  const json = await res.json()
  if (json.status !== 1 || !json.product) {
    return null
  }

  const product = json.product
  return {
    code: barcode,
    productName: product.product_name || 'Unknown product',
    brands: product.brands || '',
    ingredientsText: product.ingredients_text_en || product.ingredients_text || '',
    imageUrl: product.image_front_small_url,
  }
}
