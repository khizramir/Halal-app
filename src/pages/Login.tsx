import { useState } from 'react'
import { signInWithEmail, signInWithGoogle } from '../lib/auth'

interface LoginProps {
  onContinueAsGuest: () => void
}

export default function Login({ onContinueAsGuest }: LoginProps) {
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-emerald-deep p-6 text-white">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div>
          <div className="text-5xl">🌙</div>
          <h1 className="mt-3 text-2xl font-bold">Halo</h1>
          <p className="mt-1 text-sm text-white/80">
            Prayer times, halal scanning, restaurants & more — personalised for you.
          </p>
        </div>

        <div className="space-y-3">
          {showEmailForm ? (
            sent ? (
              <p className="rounded-xl bg-white/10 p-3 text-sm">Check your email for a sign-in link.</p>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  const ok = await signInWithEmail(email)
                  if (ok) setSent(true)
                }}
                className="space-y-2"
              >
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm text-gray-800"
                />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-white py-3 text-sm font-semibold text-emerald-deep"
                >
                  Send sign-in link
                </button>
              </form>
            )
          ) : (
            <>
              <button
                onClick={signInWithGoogle}
                className="w-full rounded-xl bg-white py-3 text-sm font-semibold text-emerald-deep"
              >
                Create Account with Google
              </button>
              <button
                onClick={() => setShowEmailForm(true)}
                className="w-full rounded-xl border border-white/40 py-3 text-sm font-semibold text-white"
              >
                Create Account with Email
              </button>
            </>
          )}

          <button
            onClick={onContinueAsGuest}
            className="w-full rounded-xl py-3 text-sm font-medium text-white/80 underline"
          >
            Continue as Guest
          </button>
        </div>

        <div className="rounded-xl bg-white/10 p-3 text-left text-xs text-white/80">
          <p className="mb-1 font-semibold text-white">As a guest you won't get:</p>
          <ul className="space-y-1">
            <li>🔒 Saved products or restaurants</li>
            <li>🔒 Scan history across sessions</li>
            <li>🔒 Dietary profile synced across devices</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
