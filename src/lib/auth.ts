import { useEffect, useState } from 'react'

export interface SessionUser {
  id?: string
  name?: string | null
  email?: string | null
  image?: string | null
}

export interface Session {
  user?: SessionUser
  expires: string
}

async function getCsrfToken(): Promise<string> {
  const res = await fetch('/api/auth/csrf')
  const json = await res.json()
  return json.csrfToken as string
}

export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/session')
      const json = await res.json()
      setSession(json && json.user ? json : null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  return { session, loading, refresh }
}

export async function signInWithGoogle() {
  const csrfToken = await getCsrfToken()
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = '/api/auth/signin/google'
  form.appendChild(hiddenInput('csrfToken', csrfToken))
  form.appendChild(hiddenInput('callbackUrl', window.location.href))
  document.body.appendChild(form)
  form.submit()
}

export async function signInWithEmail(email: string) {
  const csrfToken = await getCsrfToken()
  const res = await fetch('/api/auth/signin/resend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ email, csrfToken, callbackUrl: window.location.href }),
  })
  return res.ok
}

export async function signOut() {
  const csrfToken = await getCsrfToken()
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = '/api/auth/signout'
  form.appendChild(hiddenInput('csrfToken', csrfToken))
  form.appendChild(hiddenInput('callbackUrl', window.location.href))
  document.body.appendChild(form)
  form.submit()
}

function hiddenInput(name: string, value: string): HTMLInputElement {
  const input = document.createElement('input')
  input.type = 'hidden'
  input.name = name
  input.value = value
  return input
}
