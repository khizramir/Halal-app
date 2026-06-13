export type Verdict = 'ok' | 'not_ok' | 'uncertain'

export interface RequirementVerdict {
  requirement: string
  verdict: Verdict
  reason: string
}

export interface ProductAnalysis {
  requirements: RequirementVerdict[]
  overallVerdict: 'suitable' | 'not_suitable' | 'check_label'
  flaggedIngredients: string[]
  confidence: number
}

export interface NutrimentData {
  carbohydrates_100g?: number
  fiber_100g?: number
  sugars_100g?: number
  proteins_100g?: number
  [key: string]: number | undefined
}

export interface AnalysableProduct {
  ingredientsText: string | null
  allergens: string[] // e.g. ['en:gluten', 'en:milk']
  nutriments?: NutrimentData | null
}

const HARAM_KEYWORDS = [
  'pork', 'pig', 'swine', 'lard', 'bacon', 'ham', 'pepperoni', 'salami', 'chorizo', 'prosciutto',
  'alcohol', 'wine', 'beer', 'spirits', 'rum', 'sherry', 'brandy', 'ethanol',
  'carmine', 'cochineal', 'e120', 'e441', 'e542',
]
const HARAM_GELATIN_RE = /gelatin(e)?(?!\s*\(?(beef|bovine|fish|halal|vegetable|vegetarian|plant))/i

const MUSHBOOH_KEYWORDS = [
  'e471', 'e472', 'e473', 'e474', 'e475', 'e476', 'e481', 'e482', 'e483',
  'vanilla extract', 'natural flavour', 'natural flavor', 'mono- and diglyceride', 'monoglyceride', 'diglyceride',
  'e904', 'shellac', 'e631', 'e635',
]

const VEGETARIAN_EXCLUDE = [
  'beef', 'chicken', 'pork', 'lamb', 'fish', 'seafood', 'anchovy', 'anchovies', 'shrimp', 'prawn',
  'gelatin', 'gelatine', 'rennet', 'e120', 'e441', 'e542', 'cochineal', 'carmine', 'shellac', 'e904', 'meat',
]
const VEGETARIAN_UNCERTAIN = ['natural flavour', 'natural flavor', 'may contain meat']

const VEGAN_EXTRA_EXCLUDE = [
  'milk', 'dairy', 'lactose', 'whey', 'casein', 'butter', 'cream', 'cheese', 'yoghurt', 'yogurt',
  'egg', 'honey', 'beeswax', 'e901', 'lanolin', 'e913', 'albumin', 'isinglass',
]

const GLUTEN_KEYWORDS = ['wheat', 'barley', 'rye', 'oats', 'oat', 'spelt', 'kamut', 'triticale', 'malt']
const DAIRY_KEYWORDS = ['milk', 'dairy', 'lactose', 'whey', 'casein', 'butter', 'cream', 'cheese', 'yoghurt', 'yogurt', 'ghee']
const NUT_KEYWORDS = ['peanut', 'almond', 'cashew', 'walnut', 'pecan', 'pistachio', 'hazelnut', 'macadamia', 'brazil nut', 'pine nut']
const KOSHER_EXCLUDE = ['pork', 'bacon', 'ham', 'shellfish', 'shrimp', 'prawn']

function includesAny(text: string, keywords: string[]): string[] {
  const lower = text.toLowerCase()
  return keywords.filter((k) => lower.includes(k))
}

function hasAllergenTag(allergens: string[], tag: string): boolean {
  return allergens.some((a) => a.toLowerCase().includes(tag))
}

function analyseHalal(product: AnalysableProduct): RequirementVerdict {
  const text = product.ingredientsText ?? ''
  const haram = includesAny(text, HARAM_KEYWORDS)
  if (haram.length > 0 || HARAM_GELATIN_RE.test(text)) {
    const flagged = HARAM_GELATIN_RE.test(text) ? [...haram, 'gelatin'] : haram
    return { requirement: 'halal', verdict: 'not_ok', reason: `Contains: ${flagged.join(', ')}` }
  }
  const mushbooh = includesAny(text, MUSHBOOH_KEYWORDS)
  if (mushbooh.length > 0) {
    return { requirement: 'halal', verdict: 'uncertain', reason: `Doubtful (mushbooh) additives: ${mushbooh.join(', ')} — source unclear` }
  }
  if (!text) {
    return { requirement: 'halal', verdict: 'uncertain', reason: 'No ingredients data available — check the label or AFIC directory' }
  }
  return { requirement: 'halal', verdict: 'ok', reason: 'No haram or mushbooh ingredients detected' }
}

function analyseVegetarian(product: AnalysableProduct): RequirementVerdict {
  const text = product.ingredientsText ?? ''
  const excluded = includesAny(text, VEGETARIAN_EXCLUDE)
  if (excluded.length > 0) {
    return { requirement: 'vegetarian', verdict: 'not_ok', reason: `Contains: ${excluded.join(', ')}` }
  }
  const uncertain = includesAny(text, VEGETARIAN_UNCERTAIN)
  if (uncertain.length > 0) {
    return { requirement: 'vegetarian', verdict: 'uncertain', reason: `Contains: ${uncertain.join(', ')} — animal origin unclear` }
  }
  if (!text) return { requirement: 'vegetarian', verdict: 'uncertain', reason: 'No ingredients data available' }
  return { requirement: 'vegetarian', verdict: 'ok', reason: 'No animal-derived ingredients detected' }
}

function analyseVegan(product: AnalysableProduct): RequirementVerdict {
  const text = product.ingredientsText ?? ''
  const excluded = [...includesAny(text, VEGETARIAN_EXCLUDE), ...includesAny(text, VEGAN_EXTRA_EXCLUDE)]
  if (excluded.length > 0) {
    return { requirement: 'vegan', verdict: 'not_ok', reason: `Contains: ${excluded.join(', ')}` }
  }
  const uncertain = includesAny(text, VEGETARIAN_UNCERTAIN)
  if (uncertain.length > 0) {
    return { requirement: 'vegan', verdict: 'uncertain', reason: `Contains: ${uncertain.join(', ')} — animal origin unclear` }
  }
  if (!text) return { requirement: 'vegan', verdict: 'uncertain', reason: 'No ingredients data available' }
  return { requirement: 'vegan', verdict: 'ok', reason: 'No animal-derived ingredients detected' }
}

function analyseGlutenFree(product: AnalysableProduct): RequirementVerdict {
  if (hasAllergenTag(product.allergens, 'gluten')) {
    return { requirement: 'gluten_free', verdict: 'not_ok', reason: 'Labelled as containing gluten' }
  }
  const text = product.ingredientsText ?? ''
  const found = includesAny(text, GLUTEN_KEYWORDS)
  if (found.length > 0) {
    return { requirement: 'gluten_free', verdict: 'not_ok', reason: `Contains: ${found.join(', ')}` }
  }
  if (!text) return { requirement: 'gluten_free', verdict: 'uncertain', reason: 'No ingredients data available' }
  return { requirement: 'gluten_free', verdict: 'ok', reason: 'No gluten-containing ingredients detected' }
}

function analyseDairyFree(product: AnalysableProduct): RequirementVerdict {
  if (hasAllergenTag(product.allergens, 'milk')) {
    return { requirement: 'dairy_free', verdict: 'not_ok', reason: 'Labelled as containing milk' }
  }
  const text = product.ingredientsText ?? ''
  const found = includesAny(text, DAIRY_KEYWORDS)
  if (found.length > 0) {
    return { requirement: 'dairy_free', verdict: 'not_ok', reason: `Contains: ${found.join(', ')}` }
  }
  if (!text) return { requirement: 'dairy_free', verdict: 'uncertain', reason: 'No ingredients data available' }
  return { requirement: 'dairy_free', verdict: 'ok', reason: 'No dairy ingredients detected' }
}

function analyseNutFree(product: AnalysableProduct): RequirementVerdict {
  if (product.allergens.some((a) => a.toLowerCase().includes('nut'))) {
    return { requirement: 'nut_allergy', verdict: 'not_ok', reason: 'Labelled as containing nuts' }
  }
  const text = product.ingredientsText ?? ''
  const found = includesAny(text, NUT_KEYWORDS)
  if (found.length > 0) {
    return { requirement: 'nut_allergy', verdict: 'not_ok', reason: `Contains: ${found.join(', ')}` }
  }
  if (!text) return { requirement: 'nut_allergy', verdict: 'uncertain', reason: 'No ingredients data available' }
  return { requirement: 'nut_allergy', verdict: 'ok', reason: 'No nut ingredients detected' }
}

function analyseKosher(product: AnalysableProduct): RequirementVerdict {
  const text = product.ingredientsText ?? ''
  const found = includesAny(text, KOSHER_EXCLUDE)
  if (found.length > 0) {
    return { requirement: 'kosher', verdict: 'not_ok', reason: `Contains: ${found.join(', ')}` }
  }
  if (!text) return { requirement: 'kosher', verdict: 'uncertain', reason: 'No ingredients data available' }
  return { requirement: 'kosher', verdict: 'uncertain', reason: 'No obvious non-kosher ingredients, but kosher certification could not be verified' }
}

const ANALYSERS: Record<string, (product: AnalysableProduct) => RequirementVerdict> = {
  halal: analyseHalal,
  vegetarian: analyseVegetarian,
  vegan: analyseVegan,
  gluten_free: analyseGlutenFree,
  dairy_free: analyseDairyFree,
  nut_allergy: analyseNutFree,
  kosher: analyseKosher,
}

export function analyseProduct(product: AnalysableProduct, dietaryProfile: string[]): ProductAnalysis {
  const requested = dietaryProfile.length > 0 ? dietaryProfile : ['halal']

  const requirements = requested
    .map((req) => {
      if (req === 'vegetarian' && dietaryProfile.includes('vegan')) return null // vegan implies vegetarian; avoid duplicate
      const analyser = ANALYSERS[req]
      return analyser ? analyser(product) : null
    })
    .filter((r): r is RequirementVerdict => r !== null)

  const flaggedIngredients = Array.from(
    new Set(
      requirements
        .filter((r) => r.verdict !== 'ok')
        .flatMap((r) => r.reason.replace(/^Contains: /, '').split(', '))
        .filter((f) => !f.toLowerCase().startsWith('no ') && !f.toLowerCase().startsWith('labelled')),
    ),
  )

  let overallVerdict: ProductAnalysis['overallVerdict'] = 'suitable'
  if (requirements.some((r) => r.verdict === 'not_ok')) {
    overallVerdict = 'not_suitable'
  } else if (requirements.some((r) => r.verdict === 'uncertain')) {
    overallVerdict = 'check_label'
  }

  const hasIngredients = Boolean(product.ingredientsText)
  const confidence = hasIngredients ? (overallVerdict === 'check_label' ? 0.6 : 0.85) : 0.3

  return { requirements, overallVerdict, flaggedIngredients, confidence }
}
