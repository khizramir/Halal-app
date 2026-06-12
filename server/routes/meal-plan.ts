import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'

export const mealPlanRouter = Router()

mealPlanRouter.post('/', async (req, res) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(503).json({ error: 'Meal planning is not configured on this server.' })
    return
  }

  const { request, dietaryRequirements } = req.body as { request?: string; dietaryRequirements?: string[] }
  if (!request?.trim()) {
    res.status(400).json({ error: 'request is required' })
    return
  }

  const dietary = dietaryRequirements ?? []
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system:
        `You are a dietary-aware meal planning assistant for Australian Muslims. The user's dietary profile is: ${dietary.length ? dietary.join(', ') : 'none specified'}. ` +
        'Suggest meals available with ingredients from Australian supermarkets (Woolworths, Coles). Always check halal status of suggested ingredients. ' +
        'Return JSON only with this shape: { "meals": [{ "name": string, "cuisine": string, "ingredients": string[], "estimated_cost_aud": number, "cook_time_minutes": number }] }. Suggest exactly 5 meals.',
      messages: [{ role: 'user', content: request }],
    })

    const text = message.content.find((block) => block.type === 'text')?.text ?? '{}'
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text) as {
      meals?: { name: string; cuisine: string; ingredients: string[]; estimated_cost_aud: number; cook_time_minutes: number }[]
    }

    const meals = parsed.meals ?? []
    const shoppingList = Array.from(new Set(meals.flatMap((m) => m.ingredients)))

    res.json({ meals, shoppingList })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Meal planning failed' })
  }
})
