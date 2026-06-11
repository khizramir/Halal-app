import type { CommunitySubmission } from '../types'

const STORAGE_KEY = 'halal-hub-submissions'

export function getSubmissions(): CommunitySubmission[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CommunitySubmission[]) : []
  } catch {
    return []
  }
}

export function addSubmission(submission: Omit<CommunitySubmission, 'id' | 'submittedAt'>): CommunitySubmission {
  const newSubmission: CommunitySubmission = {
    ...submission,
    id: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
  }
  const all = [newSubmission, ...getSubmissions()]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  return newSubmission
}
