export type EStatus = 'halal' | 'haram' | 'mushbooh'

export interface ENumberInfo {
  code: string
  name: string
  status: EStatus
  note: string
}

// A starter reference list of common food additives. Status reflects the most common
// commercial sourcing and should be verified against certifier guidance for specific products.
export const E_NUMBERS: ENumberInfo[] = [
  { code: 'E120', name: 'Cochineal / Carmine', status: 'mushbooh', note: 'Insect-derived; some scholars permit, others do not.' },
  { code: 'E422', name: 'Glycerol/Glycerine', status: 'mushbooh', note: 'Can be plant, animal or synthetic — source unclear without certification.' },
  { code: 'E441', name: 'Gelatine', status: 'haram', note: 'Usually derived from pork or non-halal-slaughtered animals unless certified halal/bovine halal.' },
  { code: 'E471', name: 'Mono- and diglycerides of fatty acids', status: 'mushbooh', note: 'May be plant or animal derived — verify source.' },
  { code: 'E472', name: 'Esters of mono- and diglycerides', status: 'mushbooh', note: 'May be plant or animal derived — verify source.' },
  { code: 'E542', name: 'Bone phosphate', status: 'mushbooh', note: 'Animal bone-derived — verify source animal and slaughter method.' },
  { code: 'E631', name: 'Disodium inosinate', status: 'mushbooh', note: 'Often derived from fish or meat, sometimes synthetic.' },
  { code: 'E635', name: 'Disodium ribonucleotides', status: 'mushbooh', note: 'May be derived from meat or fish.' },
  { code: 'E904', name: 'Shellac', status: 'mushbooh', note: 'Insect-derived resin; permissibility debated among scholars.' },
  { code: 'E920', name: 'L-Cysteine', status: 'haram', note: 'Commonly derived from human hair, feathers, or animal sources.' },
  { code: 'E160a', name: 'Beta-Carotene', status: 'halal', note: 'Typically plant-derived or synthetic.' },
  { code: 'E300', name: 'Ascorbic acid (Vitamin C)', status: 'halal', note: 'Usually synthetic or plant-derived.' },
  { code: 'E322', name: 'Lecithin', status: 'mushbooh', note: 'Usually soy-derived (halal) but can occasionally be egg or animal derived.' },
  { code: 'E330', name: 'Citric acid', status: 'halal', note: 'Typically produced via fermentation of sugars — generally considered halal.' },
]

export function lookupENumber(code: string): ENumberInfo | undefined {
  const normalized = code.trim().toUpperCase().replace(/\s+/g, '')
  return E_NUMBERS.find((e) => e.code.toUpperCase() === normalized)
}

export function extractENumbers(ingredientsText: string): ENumberInfo[] {
  const matches = ingredientsText.match(/E\s?\d{3,4}[a-zA-Z]?/gi) ?? []
  const found = new Map<string, ENumberInfo>()
  for (const match of matches) {
    const info = lookupENumber(match.replace(/\s+/g, ''))
    if (info) found.set(info.code, info)
  }
  return Array.from(found.values())
}
