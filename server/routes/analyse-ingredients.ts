import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'

export const analyseIngredientsRouter = Router()

analyseIngredientsRouter.post('/', async (req, res) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(503).json({ error: 'Ingredient analysis is not configured on this server.' })
    return
  }

  const { image, mediaType } = req.body as { image?: string; mediaType?: string }
  if (!image) {
    res.status(400).json({ error: 'image (base64) is required' })
    return
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: (mediaType ?? 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp',
                data: image,
              },
            },
            {
              type: 'text',
              text:
                'This is a photo of a food product ingredient list. Extract the ingredients as a list, ' +
                'then flag any ingredients that are commonly considered haram, mushbooh (doubtful), or that ' +
                'may concern someone with vegetarian/vegan, gluten-free, dairy-free, nut-allergy, or kosher needs. ' +
                'Respond with concise JSON: { "ingredients": string[], "flags": { "ingredient": string, "concern": string, "status": "haram"|"mushbooh"|"info" }[] }.',
            },
          ],
        },
      ],
    })

    const text = message.content.find((block) => block.type === 'text')?.text ?? '{}'
    res.json({ result: text })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Analysis failed' })
  }
})
