# Halal Hub Australia

A halal food and lifestyle companion for Australian Muslims — local-first prototype
(React + Vite + TypeScript + Tailwind CSS).

## Features (Phase 1 — local prototype)

- **Prayer Times** — live times via Aladhan API based on your location, countdown to next
  prayer, browser notifications
- **Qibla Compass** — device orientation + Aladhan qibla bearing
- **Halal Scanner** — barcode lookup via Open Food Facts, flags additives/E-numbers by
  halal/haram/mushbooh status, links to AFIC certification directory
- **Restaurant Finder** — curated Australian halal restaurants with certifier and amenity
  filters (Sydney, Melbourne, Brisbane, Perth, Adelaide)
- **Islamic Calendar** — today's Hijri date and countdowns to major Islamic events, with a
  link to moonsighting.com.au for official Australian moon sighting announcements
- **Adhkar** — morning, evening and after-prayer dhikr with Arabic, transliteration,
  translation and tap counters
- **Zakat Calculator** — based on gold/silver nisab thresholds
- **Community Submissions** — submit new restaurants/products (synced to the database when
  signed in, saved locally otherwise)

## Backend (Phase 2 & 3)

- **Database**: Neon (serverless Postgres) via Drizzle ORM
- **Auth**: Auth.js (`@auth/express`) with Google OAuth + email magic links (Resend)
- **API**: small Express server providing `/api/restaurants`, `/api/products`,
  `/api/products/:barcode`, `/api/reports`, mounted under `/api/auth` for authentication

## Getting started

1. Copy the environment template and fill in your values:

   ```bash
   cp .env.example .env
   ```

   - `DATABASE_URL`: connection string from your Neon project dashboard
   - `AUTH_SECRET`: generate with `openssl rand -hex 32`
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: from Google Cloud Console (redirect URI:
     `http://localhost:5173/api/auth/callback/google`)
   - `AUTH_RESEND_KEY`: API key from resend.com (for email sign-in links)

2. Install dependencies and push the schema to your Neon database:

   ```bash
   npm install
   npm run db:push
   npm run db:seed
   ```

3. Run the API server and the frontend (in separate terminals):

   ```bash
   npm run dev:server
   npm run dev
   ```

Open the printed local URL in your browser. For best results (geolocation, compass,
camera scanning) use a mobile browser over HTTPS or `localhost`. The frontend falls back to
bundled mock data if the API is unreachable.

> **Note on seed data**: restaurant and product details (including barcodes) are best-effort
> and should be verified against AFIC/ICCA/Halal Australia certification directories before
> relying on them.
