import { Router } from 'express'
import { db } from '../db/index.js'
import { feedback } from '../db/schema.js'
import { getSession, authConfig } from '../auth.js'

export const feedbackRouter = Router()

feedbackRouter.post('/', async (req, res) => {
  const session = await getSession(req, authConfig)

  const { rating, category, message, appVersion } = req.body as {
    rating?: number
    category?: string
    message?: string | null
    appVersion?: string | null
  }

  const validCategories = ['bug', 'missing_product', 'wrong_info', 'feature_request', 'general']
  if (!rating || rating < 1 || rating > 5 || !category || !validCategories.includes(category)) {
    res.status(400).json({ error: 'rating (1-5) and a valid category are required' })
    return
  }

  const [created] = await db
    .insert(feedback)
    .values({
      userId: session?.user?.id ?? null,
      rating,
      category,
      message: message ?? null,
      appVersion: appVersion ?? null,
    })
    .returning()

  res.status(201).json(created)
})
