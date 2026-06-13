import { ExpressAuth, getSession as expressGetSession } from '@auth/express'
import type { ExpressAuthConfig } from '@auth/express'
import Google from '@auth/express/providers/google'
import Resend from '@auth/express/providers/resend'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { db } from './db/index.js'
import { accounts, sessions, users, verificationTokens } from './db/schema.js'

export const authConfig: ExpressAuthConfig = {
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: process.env.AUTH_EMAIL_FROM ?? 'Halo <onboarding@resend.dev>',
    }),
  ],
  session: { strategy: 'database' },
  trustHost: true,
}

export const authHandler = ExpressAuth(authConfig)

export const getSession = expressGetSession
