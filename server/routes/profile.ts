import { Router } from 'express'
import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { userProfiles } from '../db/schema.js'
import { getSession, authConfig } from '../auth.js'

export const profileRouter = Router()

profileRouter.get('/', async (req, res) => {
  const session = await getSession(req, authConfig)
  if (!session?.user?.id) {
    res.status(401).json({ error: 'Sign in required' })
    return
  }

  const [row] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, session.user.id))

  res.json(row ?? null)
})

profileRouter.put('/', async (req, res) => {
  const session = await getSession(req, authConfig)
  if (!session?.user?.id) {
    res.status(401).json({ error: 'Sign in required' })
    return
  }

  const { dietaryRequirements, city, schoolOfThought, onboardingComplete, notificationsEnabled } = req.body as {
    dietaryRequirements?: string[]
    city?: string | null
    schoolOfThought?: string | null
    onboardingComplete?: boolean
    notificationsEnabled?: boolean
  }

  const [existing] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, session.user.id))

  const updates = {
    ...(dietaryRequirements !== undefined ? { dietaryRequirements } : {}),
    ...(city !== undefined ? { city } : {}),
    ...(schoolOfThought !== undefined ? { schoolOfThought } : {}),
    ...(onboardingComplete !== undefined ? { onboardingComplete } : {}),
    ...(notificationsEnabled !== undefined ? { notificationsEnabled } : {}),
  }

  if (existing) {
    const [updated] = await db
      .update(userProfiles)
      .set(updates)
      .where(eq(userProfiles.userId, session.user.id))
      .returning()
    res.json(updated)
    return
  }

  const [created] = await db
    .insert(userProfiles)
    .values({ userId: session.user.id, ...updates })
    .returning()
  res.status(201).json(created)
})
