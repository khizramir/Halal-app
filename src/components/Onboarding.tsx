import { useState } from 'react'
import { AUSTRALIAN_CITIES, DIETARY_REQUIREMENTS, SCHOOLS_OF_THOUGHT } from '../types'

interface OnboardingProps {
  initialDietary?: string[]
  initialCity?: string | null
  initialSchool?: string | null
  onComplete: (data: { dietaryRequirements: string[]; city: string | null; schoolOfThought: string | null }) => void
}

export default function Onboarding({ initialDietary, initialCity, initialSchool, onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1)
  const [dietary, setDietary] = useState<string[]>(initialDietary ?? [])
  const [city, setCity] = useState<string | null>(initialCity ?? null)
  const [school, setSchool] = useState<string | null>(initialSchool ?? null)

  const showSchoolStep = dietary.includes('halal')
  const totalSteps = showSchoolStep ? 3 : 2

  const toggleDietary = (id: string) => {
    setDietary((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]))
  }

  const finish = () => {
    onComplete({ dietaryRequirements: dietary, city, schoolOfThought: showSchoolStep ? school : null })
  }

  const next = () => {
    if (step === 2 && !showSchoolStep) {
      finish()
      return
    }
    if (step === totalSteps) {
      finish()
      return
    }
    setStep((s) => s + 1)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-cream p-6">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <div className="mb-6 flex gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${i < step ? 'bg-emerald-deep' : 'bg-emerald-deep/15'}`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="flex-1">
            <h2 className="text-xl font-bold text-emerald-deep">What do you need to check?</h2>
            <p className="mt-1 text-sm text-gray-500">Select all that apply.</p>
            <div className="mt-4 space-y-2">
              {DIETARY_REQUIREMENTS.map((d) => (
                <label
                  key={d.id}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-sm font-medium transition ${
                    dietary.includes(d.id)
                      ? 'border-emerald-deep bg-emerald-deep/5 text-emerald-deep'
                      : 'border-gray-200 text-gray-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={dietary.includes(d.id)}
                    onChange={() => toggleDietary(d.id)}
                    className="h-4 w-4"
                  />
                  {d.label}
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex-1">
            <h2 className="text-xl font-bold text-emerald-deep">Where are you based?</h2>
            <p className="mt-1 text-sm text-gray-500">We'll show you halal options nearby.</p>
            <div className="mt-4 space-y-2">
              {AUSTRALIAN_CITIES.map((c) => (
                <label
                  key={c}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-sm font-medium transition ${
                    city === c ? 'border-emerald-deep bg-emerald-deep/5 text-emerald-deep' : 'border-gray-200 text-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="city"
                    checked={city === c}
                    onChange={() => setCity(c)}
                    className="h-4 w-4"
                  />
                  {c}
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 3 && showSchoolStep && (
          <div className="flex-1">
            <h2 className="text-xl font-bold text-emerald-deep">School of thought</h2>
            <p className="mt-1 text-sm text-gray-500">This helps tailor halal guidance to you.</p>
            <div className="mt-4 space-y-2">
              {SCHOOLS_OF_THOUGHT.map((s) => (
                <label
                  key={s.id}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-sm font-medium transition ${
                    school === s.id ? 'border-emerald-deep bg-emerald-deep/5 text-emerald-deep' : 'border-gray-200 text-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="school"
                    checked={school === s.id}
                    onChange={() => setSchool(s.id)}
                    className="h-4 w-4"
                  />
                  {s.label}
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 space-y-2">
          <button
            onClick={next}
            className="w-full rounded-xl bg-emerald-deep py-3 text-sm font-semibold text-white"
          >
            {step === totalSteps || (step === 2 && !showSchoolStep) ? "Let's go" : 'Continue'}
          </button>
          <p className="text-center text-xs text-gray-400">You can change these anytime in Profile.</p>
        </div>
      </div>
    </div>
  )
}
