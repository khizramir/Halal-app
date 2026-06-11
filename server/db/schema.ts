import {
  pgTable,
  text,
  timestamp,
  primaryKey,
  integer,
  boolean,
  uuid,
} from 'drizzle-orm/pg-core'
import type { AdapterAccountType } from '@auth/core/adapters'

// --- Auth.js tables (required by @auth/drizzle-adapter) ---

export const users = pgTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
})

export const accounts = pgTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ],
)

export const sessions = pgTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
})

export const verificationTokens = pgTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })],
)

// --- Application tables ---

export const restaurants = pgTable('restaurants', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  city: text('city').notNull(),
  suburb: text('suburb').notNull(),
  cuisine: text('cuisine').notNull(),
  certifier: text('certifier').notNull(), // AFIC | ICCA | Halal Australia | Self-declared
  familyFriendly: boolean('family_friendly').notNull().default(false),
  prayerSpace: boolean('prayer_space').notNull().default(false),
  address: text('address').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
})

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  barcode: text('barcode').notNull().unique(),
  name: text('name').notNull(),
  brand: text('brand'),
  certifier: text('certifier'), // AFIC | ICCA | Halal Australia | Self-declared | null
  status: text('status').notNull().default('halal'), // halal | haram | mushbooh
  notes: text('notes'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
})

export const communityReports = pgTable('community_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: text('type').notNull(), // restaurant | product
  name: text('name').notNull(),
  city: text('city'),
  details: text('details'),
  status: text('status').notNull().default('pending'), // pending | approved | rejected
  submittedBy: text('submitted_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
})
