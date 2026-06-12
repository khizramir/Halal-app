import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { filterByDietary, searchWoolworths } from '../lib/woolworths.js'

export const shopRouter = Router()

shopRouter.get('/search', async (req, res) => {
  const query = typeof req.query.q === 'string' ? req.query.q : ''
  if (!query.trim()) {
    res.status(400).json({ error: 'q query parameter is required' })
    return
  }

  const dietary = typeof req.query.dietary === 'string' && req.query.dietary
    ? req.query.dietary.split(',').filter(Boolean)
    : []

  try {
    const products = await searchWoolworths(query)
    res.json({ products: filterByDietary(products, dietary) })
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : 'Search failed' })
  }
})

shopRouter.post('/basket', async (req, res) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(503).json({ error: 'Smart basket builder is not configured on this server.' })
    return
  }

  const { request, dietaryRequirements } = req.body as { request?: string; dietaryRequirements?: string[] }
  if (!request?.trim()) {
    res.status(400).json({ error: 'request is required' })
    return
  }

  const dietary = dietaryRequirements ?? []
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  let ingredients: string[]
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content:
            `A user in Australia wants to: "${request}". Their dietary profile is: ${dietary.length ? dietary.join(', ') : 'none specified'}. ` +
            'List the grocery items/ingredients they need to buy to fulfil this request, considering their dietary profile. ' +
            'Respond with JSON only: { "items": string[] }. Each item should be a short, simple supermarket search term (e.g. "chicken thigh", "basmati rice").',
        },
      ],
    })

    const text = message.content.find((block) => block.type === 'text')?.text ?? '{}'
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text) as { items?: string[] }
    ingredients = (parsed.items ?? []).slice(0, 15)
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Could not interpret request' })
    return
  }

  if (ingredients.length === 0) {
    res.json({ groups: [], estimatedTotal: 0 })
    return
  }

  const groups = await Promise.all(
    ingredients.map(async (ingredient) => {
      try {
        const products = await searchWoolworths(ingredient)
        return { ingredient, query: ingredient, products: filterByDietary(products, dietary).slice(0, 6) }
      } catch {
        return { ingredient, query: ingredient, products: [] }
      }
    }),
  )

  const estimatedTotal = groups.reduce((sum, g) => {
    const cheapest = g.products.reduce<number | null>((min, p) => {
      if (p.price == null) return min
      return min == null ? p.price : Math.min(min, p.price)
    }, null)
    return sum + (cheapest ?? 0)
  }, 0)

  res.json({ groups, estimatedTotal })
})
