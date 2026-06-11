import { Router } from 'express'
import { desc } from 'drizzle-orm'
import { db } from '../db/index.js'
import { communityReports } from '../db/schema.js'
import { getSession, authConfig } from '../auth.js'

export const reportsRouter = Router()

reportsRouter.get('/', async (_req, res) => {
  const rows = await db
    .select()
    .from(communityReports)
    .orderBy(desc(communityReports.createdAt))
  res.json(rows)
})

reportsRouter.post('/', async (req, res) => {
  const session = await getSession(req, authConfig)
  if (!session?.user?.id) {
    res.status(401).json({ error: 'Sign in required' })
    return
  }

  const { type, name, city, details } = req.body as {
    type?: string
    name?: string
    city?: string
    details?: string
  }

  if (!type || !name || !['restaurant', 'product'].includes(type)) {
    res.status(400).json({ error: 'type (restaurant|product) and name are required' })
    return
  }

  const [created] = await db
    .insert(communityReports)
    .values({ type, name, city, details, submittedBy: session.user.id })
    .returning()

  res.status(201).json(created)
})
