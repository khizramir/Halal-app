import { useState } from 'react'
import { signInWithEmail, signInWithGoogle, signOut, useSession } from '../lib/auth'

export default function AuthButton() {
  const { session, loading } = useSession()
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  if (loading) return null

  if (session?.user) {
    return (
      <button onClick={signOut} className="text-xs font-medium text-white/90 underline">
        Sign out{session.user.name ? ` (${session.user.name})` : ''}
      </button>
    )
  }

  if (showEmailForm) {
    return (
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          const ok = await signInWithEmail(email)
          if (ok) setSent(true)
        }}
        className="flex items-center gap-1"
      >
        {sent ? (
          <span className="text-xs text-white/90">Check your email for a sign-in link</span>
        ) : (
          <>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded px-2 py-1 text-xs text-gray-800"
            />
            <button type="submit" className="text-xs font-medium text-white underline">
              Send link
            </button>
          </>
        )}
      </form>
    )
  }

  return (
    <div className="flex items-center gap-3 text-xs">
      <button onClick={signInWithGoogle} className="font-medium text-white underline">
        Sign in with Google
      </button>
      <button onClick={() => setShowEmailForm(true)} className="font-medium text-white/90 underline">
        Sign in with email
      </button>
    </div>
  )
}
