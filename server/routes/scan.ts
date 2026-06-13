import { Router } from 'express'
import { getProductByBarcode } from '../lib/productsMaster.js'
import { analyseProduct } from '../intelligence/productAnalyser.js'
import { analyseIngredientPhoto } from '../intelligence/ingredientPhotoAnalyser.js'

export const scanRouter = Router()

scanRouter.post('/barcode', async (req, res) => {
  const { barcode, dietaryProfile } = req.body as { barcode?: string; dietaryProfile?: string[] }
  if (!barcode) {
    res.status(400).json({ error: 'barcode is required' })
    return
  }

  try {
    const product = await getProductByBarcode(barcode)
    if (!product) {
      res.status(404).json({ error: 'Product not found' })
      return
    }

    const analysis = analyseProduct(
      { ingredientsText: product.ingredientsText, allergens: product.allergens, nutriments: product.nutriments },
      dietaryProfile ?? [],
    )

    res.json({ product, analysis })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Lookup failed' })
  }
})

scanRouter.post('/photo', async (req, res) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(503).json({ error: 'Ingredient photo analysis is not configured on this server.' })
    return
  }

  const { image, mediaType, dietaryProfile } = req.body as { image?: string; mediaType?: string; dietaryProfile?: string[] }
  if (!image) {
    res.status(400).json({ error: 'image (base64) is required' })
    return
  }

  try {
    const result = await analyseIngredientPhoto(image, mediaType ?? 'image/jpeg', dietaryProfile ?? [])
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Analysis failed' })
  }
})
