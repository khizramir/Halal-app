import {
  pgTable,
  text,
  timestamp,
  primaryKey,
  integer,
  boolean,
  uuid,
  jsonb,
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

// --- Personalisation, accounts & feedback ---

export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  dietaryRequirements: jsonb('dietary_requirements').$type<string[]>().notNull().default([]),
  city: text('city'),
  schoolOfThought: text('school_of_thought'), // hanafi | shafii | general
  usagePurposes: jsonb('usage_purposes').$type<string[]>().notNull().default([]),
  allergens: jsonb('allergens').$type<string[]>().notNull().default([]),
  budgetWeekly: integer('budget_weekly'), // AUD
  onboardingComplete: boolean('onboarding_complete').notNull().default(false),
  notificationsEnabled: boolean('notifications_enabled').notNull().default(false),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
})

export const scanHistory = pgTable('scan_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  barcode: text('barcode').notNull(),
  productName: text('product_name').notNull(),
  brand: text('brand'),
  resultStatus: text('result_status').notNull(), // halal | haram | mushbooh | unknown
  dietaryFlags: jsonb('dietary_flags').$type<string[]>().notNull().default([]),
  scannedAt: timestamp('scanned_at', { mode: 'date' }).notNull().defaultNow(),
})

export const savedItems = pgTable('saved_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  itemType: text('item_type').notNull(), // product | restaurant
  referenceId: text('reference_id').notNull(),
  itemName: text('item_name').notNull(),
  itemData: jsonb('item_data'),
  savedAt: timestamp('saved_at', { mode: 'date' }).notNull().defaultNow(),
})

export const productCache = pgTable('product_cache', {
  id: uuid('id').primaryKey().defaultRandom(),
  query: text('query').notNull().unique(),
  results: jsonb('results').notNull(),
  fetchedAt: timestamp('fetched_at', { mode: 'date' }).notNull().defaultNow(),
})

// Cache of Open Food Facts product lookups, enriched with computed dietary analysis.
export const productsMaster = pgTable('products_master', {
  id: uuid('id').primaryKey().defaultRandom(),
  barcode: text('barcode').notNull().unique(),
  name: text('name').notNull(),
  brand: text('brand'),
  imageUrl: text('image_url'),
  ingredientsText: text('ingredients_text'),
  allergens: jsonb('allergens').$type<string[]>().notNull().default([]),
  nutriments: jsonb('nutriments'),
  dietaryFlags: jsonb('dietary_flags'),
  source: text('source').notNull().default('openfoodfacts'),
  lastVerified: timestamp('last_verified', { mode: 'date' }).notNull().defaultNow(),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
})

export const groceryLists = pgTable('grocery_lists', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  originalQuery: text('original_query').notNull(),
  items: jsonb('items').notNull(),
  totalCost: integer('total_cost'), // cents
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
})

export const mealPlans = pgTable('meal_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  request: text('request').notNull(),
  meals: jsonb('meals').notNull(),
  shoppingList: jsonb('shopping_list').notNull(),
  totalCost: integer('total_cost'), // cents
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
})

export const feedback = pgTable('feedback', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  rating: integer('rating').notNull(),
  category: text('category').notNull(), // bug | missing_product | wrong_info | feature_request | general
  message: text('message'),
  appVersion: text('app_version'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
})
