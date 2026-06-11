import { Router } from 'express'
import { db } from '../db/index.js'
import { restaurants } from '../db/schema.js'

export const restaurantsRouter = Router()

restaurantsRouter.get('/', async (_req, res) => {
  const rows = await db.select().from(restaurants)
  res.json(rows)
})
