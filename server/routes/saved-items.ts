import { Router } from 'express'
import { and, desc, eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { savedItems } from '../db/schema.js'
import { getSession, authConfig } from '../auth.js'

export const savedItemsRouter = Router()

savedItemsRouter.get('/', async (req, res) => {
  const session = await getSession(req, authConfig)
  if (!session?.user?.id) {
    res.status(401).json({ error: 'Sign in required' })
    return
  }

  const rows = await db
    .select()
    .from(savedItems)
    .where(eq(savedItems.userId, session.user.id))
    .orderBy(desc(savedItems.savedAt))

  res.json(rows)
})

savedItemsRouter.post('/', async (req, res) => {
  const session = await getSession(req, authConfig)
  if (!session?.user?.id) {
    res.status(401).json({ error: 'Sign in required' })
    return
  }

  const { itemType, referenceId, itemName, itemData } = req.body as {
    itemType?: string
    referenceId?: string
    itemName?: string
    itemData?: unknown
  }

  if (!itemType || !referenceId || !itemName || !['product', 'restaurant'].includes(itemType)) {
    res.status(400).json({ error: 'itemType (product|restaurant), referenceId and itemName are required' })
    return
  }

  const [created] = await db
    .insert(savedItems)
    .values({ userId: session.user.id, itemType, referenceId, itemName, itemData })
    .returning()

  res.status(201).json(created)
})

savedItemsRouter.delete('/:id', async (req, res) => {
  const session = await getSession(req, authConfig)
  if (!session?.user?.id) {
    res.status(401).json({ error: 'Sign in required' })
    return
  }

  await db
    .delete(savedItems)
    .where(and(eq(savedItems.id, req.params.id), eq(savedItems.userId, session.user.id)))

  res.status(204).end()
})
