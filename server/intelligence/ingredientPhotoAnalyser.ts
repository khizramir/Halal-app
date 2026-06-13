import Anthropic from '@anthropic-ai/sdk'
import { analyseProduct, type ProductAnalysis } from './productAnalyser.js'

export interface IngredientPhotoResult extends ProductAnalysis {
  extractedIngredients: string
}

export async function analyseIngredientPhoto(
  base64Image: string,
  mediaType: string,
  dietaryProfile: string[],
): Promise<IngredientPhotoResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Ingredient photo analysis is not configured on this server.')
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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
              media_type: (mediaType || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp',
              data: base64Image,
            },
          },
          {
            type: 'text',
            text:
              'This is a photo of a food product ingredient list. Transcribe the full ingredients list as plain ' +
              'text, comma-separated, exactly as printed (English only). Respond with only the ingredients text, ' +
              'nothing else. If no ingredients list is visible, respond with an empty string.',
          },
        ],
      },
    ],
  })

  const extractedIngredients = message.content.find((block) => block.type === 'text')?.text.trim() ?? ''

  const analysis = analyseProduct({ ingredientsText: extractedIngredients, allergens: [] }, dietaryProfile)

  return { ...analysis, extractedIngredients }
}
