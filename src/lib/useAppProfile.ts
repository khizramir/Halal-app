import { useEffect, useState } from 'react'
import { useSession } from './auth'
import { getProfile, saveProfile } from './api'
import { getGuestOnboarding, saveGuestOnboarding } from './guest'
import type { UserProfile } from '../types'

const ENTRY_MODE_KEY = 'halal-hub-entry-mode'

export interface OnboardingData {
  dietaryRequirements: string[]
  city: string | null
  schoolOfThought: string | null
  usagePurposes: string[]
}

export interface AppProfile {
  loading: boolean
  isGuest: boolean
  entryChosen: boolean
  onboardingComplete: boolean
  dietaryRequirements: string[]
  city: string | null
  schoolOfThought: string | null
  usagePurposes: string[]
  notificationsEnabled: boolean
  chooseGuest: () => void
  completeOnboarding: (data: OnboardingData) => void
  updateProfile: (data: Partial<OnboardingData & { notificationsEnabled: boolean }>) => void
  refresh: () => void
}

export function useAppProfile(): AppProfile {
  const { session, loading: sessionLoading } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [entryChosen, setEntryChosen] = useState(() => localStorage.getItem(ENTRY_MODE_KEY) === 'guest')
  const [guest, setGuest] = useState(getGuestOnboarding())

  const isGuest = !session?.user

  const load = () => {
    if (session?.user) {
      setProfileLoading(true)
      getProfile()
        .then(setProfile)
        .finally(() => setProfileLoading(false))
    } else {
      setProfile(null)
      setProfileLoading(false)
      setGuest(getGuestOnboarding())
    }
  }

  useEffect(() => {
    if (sessionLoading) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionLoading, session?.user?.id])

  const chooseGuest = () => {
    localStorage.setItem(ENTRY_MODE_KEY, 'guest')
    setEntryChosen(true)
  }

  const completeOnboarding = (data: OnboardingData) => {
    if (session?.user) {
      saveProfile({ ...data, onboardingComplete: true }).then((updated) => setProfile(updated))
    } else {
      const next = { ...data, complete: true }
      saveGuestOnboarding(next)
      setGuest(next)
    }
  }

  const updateProfile: AppProfile['updateProfile'] = (data) => {
    if (session?.user) {
      saveProfile(data).then((updated) => updated && setProfile(updated))
    } else {
      const next = { ...guest, ...data }
      saveGuestOnboarding(next as ReturnType<typeof getGuestOnboarding>)
      setGuest(next as ReturnType<typeof getGuestOnboarding>)
    }
  }

  const loading = sessionLoading || profileLoading

  if (session?.user) {
    return {
      loading,
      isGuest,
      entryChosen: true,
      onboardingComplete: profile?.onboardingComplete ?? false,
      dietaryRequirements: profile?.dietaryRequirements ?? [],
      city: profile?.city ?? null,
      schoolOfThought: profile?.schoolOfThought ?? null,
      usagePurposes: profile?.usagePurposes ?? [],
      notificationsEnabled: profile?.notificationsEnabled ?? false,
      chooseGuest,
      completeOnboarding,
      updateProfile,
      refresh: load,
    }
  }

  return {
    loading,
    isGuest,
    entryChosen,
    onboardingComplete: guest.complete,
    dietaryRequirements: guest.dietaryRequirements,
    city: guest.city,
    schoolOfThought: guest.schoolOfThought,
    usagePurposes: guest.usagePurposes,
    notificationsEnabled: false,
    chooseGuest,
    completeOnboarding,
    updateProfile,
    refresh: load,
  }
}
