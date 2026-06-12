import { Router } from 'express'
import { desc, eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { scanHistory } from '../db/schema.js'
import { getSession, authConfig } from '../auth.js'

export const scanHistoryRouter = Router()

scanHistoryRouter.get('/', async (req, res) => {
  const session = await getSession(req, authConfig)
  if (!session?.user?.id) {
    res.status(401).json({ error: 'Sign in required' })
    return
  }

  const rows = await db
    .select()
    .from(scanHistory)
    .where(eq(scanHistory.userId, session.user.id))
    .orderBy(desc(scanHistory.scannedAt))
    .limit(100)

  res.json(rows)
})

scanHistoryRouter.post('/', async (req, res) => {
  const session = await getSession(req, authConfig)
  if (!session?.user?.id) {
    res.status(401).json({ error: 'Sign in required' })
    return
  }

  const { barcode, productName, brand, resultStatus, dietaryFlags } = req.body as {
    barcode?: string
    productName?: string
    brand?: string | null
    resultStatus?: string
    dietaryFlags?: string[]
  }

  if (!barcode || !productName || !resultStatus) {
    res.status(400).json({ error: 'barcode, productName and resultStatus are required' })
    return
  }

  const [created] = await db
    .insert(scanHistory)
    .values({
      userId: session.user.id,
      barcode,
      productName,
      brand: brand ?? null,
      resultStatus,
      dietaryFlags: dietaryFlags ?? [],
    })
    .returning()

  res.status(201).json(created)
})
