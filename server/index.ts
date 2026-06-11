import 'dotenv/config'
import express from 'express'
import { authHandler, getSession, authConfig } from './auth.js'
import { restaurantsRouter } from './routes/restaurants.js'
import { productsRouter } from './routes/products.js'
import { reportsRouter } from './routes/reports.js'

const app = express()
app.set('trust proxy', true)
app.use(express.json())

app.use('/api/auth', authHandler)

app.get('/api/session', async (req, res) => {
  const session = await getSession(req, authConfig)
  res.json(session)
})

app.use('/api/restaurants', restaurantsRouter)
app.use('/api/products', productsRouter)
app.use('/api/reports', reportsRouter)

const port = process.env.PORT ? Number(process.env.PORT) : 3001
app.listen(port, () => {
  console.log(`Halal Hub Australia API listening on http://localhost:${port}`)
})
