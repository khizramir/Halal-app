import 'dotenv/config'
import express from 'express'
import { authHandler, getSession, authConfig } from './auth.js'
import { restaurantsRouter } from './routes/restaurants.js'
import { productsRouter } from './routes/products.js'
import { reportsRouter } from './routes/reports.js'
import { profileRouter } from './routes/profile.js'
import { scanHistoryRouter } from './routes/scan-history.js'
import { savedItemsRouter } from './routes/saved-items.js'
import { feedbackRouter } from './routes/feedback.js'
import { analyseIngredientsRouter } from './routes/analyse-ingredients.js'
import { shopRouter } from './routes/shop.js'
import { mealPlanRouter } from './routes/meal-plan.js'
import { scanRouter } from './routes/scan.js'

const app = express()
app.set('trust proxy', true)
app.use(express.json({ limit: '10mb' }))

app.use('/api/auth', authHandler)

app.get('/api/session', async (req, res) => {
  const session = await getSession(req, authConfig)
  res.json(session)
})

app.use('/api/restaurants', restaurantsRouter)
app.use('/api/products', productsRouter)
app.use('/api/reports', reportsRouter)
app.use('/api/profile', profileRouter)
app.use('/api/scan-history', scanHistoryRouter)
app.use('/api/saved-items', savedItemsRouter)
app.use('/api/feedback', feedbackRouter)
app.use('/api/analyse-ingredients', analyseIngredientsRouter)
app.use('/api/shop', shopRouter)
app.use('/api/meal-plan', mealPlanRouter)
app.use('/api/scan', scanRouter)

const port = process.env.PORT ? Number(process.env.PORT) : 3001
app.listen(port, () => {
  console.log(`Halo API listening on http://localhost:${port}`)
})
