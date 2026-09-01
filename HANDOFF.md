# TotoStore Project Handoff

**Snapshot date:** 2026-08-24  
**Repository:** TotoStore  
**Supabase project ref:** `nrulrpssxafijvhokajw`  
**Confidence note:** Local code and the linked Supabase migration state were verified on 2026-08-24. Provider dashboard configuration was not independently verified.

## 1. Project Overview

TotoStore is a marketplace app for buying and selling auto-rickshaws. The current app includes authentication screens, marketplace browsing screens, listing creation UI, profile/navigation screens, and a Supabase data model.

### Technology stack

- React Native 0.86.2
- Expo SDK 57.0.x
- Expo Router 57.0.x with file-based routing
- TypeScript 6.0.3, with some legacy JavaScript entry code still present
- Supabase JS 2.x for Auth, database, and Storage access
- ~~MSG91 React Native SDK~~ — removed (phone OTP auth disabled as of 2026-08-24)
- Expo image picker + Expo file system for local photo selection and upload preparation
- EAS configuration is present for development, preview, and production builds

### Image upload implementation note

- This repo is using Expo's `expo-image-picker` and `expo-file-system`, not `react-native-image-picker`.
- The storage helper must therefore use Expo APIs and the `expo-file-system` base64 read pattern.
- Bucket naming in the migrations is `profile-photos` and `listing-photos`; the app uses those actual bucket names rather than the generic `listing-images` name from the sample helper.

## 2. Authentication Setup

### Google Login: only active method

**Current status: UI and client flow implemented; external configuration and complete end-to-end testing are pending.**

Implemented locally:

- `supabase.auth.signInWithOAuth({ provider: 'google' })` is called from `src/app/index.tsx`.
- Expo Auth Session creates the redirect URI using the `totostore` scheme and `auth/callback` path.
- The browser OAuth result is parsed for access and refresh tokens.
- Supabase session is set with those tokens, then the app navigates to `/home`.

Still to verify:

- Google provider is enabled in the Supabase dashboard.
- Google Cloud OAuth client IDs, secrets, redirect URIs, and Supabase callback URLs are correctly configured.
- Google login works on a real Android/iOS development build.

### MSG91 Phone OTP: removed

**Removed on 2026-08-24.** The phone-number OTP authentication flow (MSG91 SDK, `sendPhoneOtp`, `verifyPhoneOtp`, phone/OTP UI, and the `verify-otp` Supabase Edge Function) has been fully stripped from the codebase. The `@msg91comm/sendotp-react-native` dependency and `EXPO_PUBLIC_MSG91_TOKEN_AUTH` environment variable have also been removed. Database migrations `003` and `004` (which added `phone`/`phone_verified` columns and constraints) remain applied but are no longer exercised by the app.

## 3. Environment Variables

Variable names found in the local environment files. Values are intentionally omitted:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

`.env` is ignored by Git. Do not commit its values. The local `.env.example` also exists; review it before sharing because the audit recorded that it may contain real project values rather than placeholders.

## 4. Supabase Setup

### Local project identity

- Project name in local Supabase metadata: TotoStore
- Project ref: `nrulrpssxafijvhokajw`
- The repository contains `supabase/.temp` linked-project metadata, and the CLI is linked to this project.
- Remote migration history was verified: versions `001` through `006` are applied.
- The remote database already contained the baseline schema before migration history was repaired for versions `001` through `004`.

### Tables defined by migrations

- `users`: profile data connected to `auth.users`
- `listings`: auto-rickshaw marketplace listings
- `photos`: listing photo URLs and ordering
- `saved_listings`: per-user favorites with a unique user/listing pair

The schema also defines enums for listing condition, listing status, fuel type, and transmission type; timestamps, indexes, user creation triggers, and Row Level Security policies.

### Migrations present in the repository

1. `001_create_marketplace_schema.sql` creates the core schema, triggers, indexes, and enums.
2. `002_rls_policies.sql` enables RLS and adds policies for users, listings, photos, and saved listings.
3. `003_support_phone_auth.sql` makes `users.email` nullable and adds `phone` plus `phone_verified`.
4. `004_phone_unique_constraint.sql` adds a unique constraint on `users.phone` for the Edge Function upsert.
5. `005_profile_photo_storage.sql` creates the public `profile-photos` bucket and restricts each user to `{auth.uid()}.jpg` for upload, update, and delete.
6. `006_listing_photo_storage.sql` creates the public `listing-photos` bucket and restricts objects to `{seller_id}/{listing_id}/{filename}`, with the listing owner checked through `public.listings`.

`phone_verified` is already present in the migration files. No additional required phone-auth column is known from the current code. Both photo Storage buckets and their owner-only policies were verified remotely.

## 5. Edge Functions

No Edge Functions are currently in use. The `verify-otp` function was removed on 2026-08-24 along with the phone OTP authentication flow. If a previously deployed version exists on the Supabase project, it can be safely deleted from the dashboard.

## 6. Pending / Incomplete Tasks

- Configure and test Google OAuth in Supabase and Google Cloud.
- Test the Google authentication flow with real devices and a real development build.
- Install/run the Expo development build; the audit recorded that Node/npm/Expo were unavailable from the checked terminal PATH.
- Verify listing creation and photo persistence end to end on a real authenticated device.
- Load real listings from Supabase instead of relying on mock data.
- Implement search, filters, sorting, saved listings, My Listings, chat, and listing detail data flows.
- Persist/share saved-listing state across screens and app restarts.
- Replace remaining hard-coded profile name, phone, rating, and listing count with authenticated profile/data.
- Resolve the two application-entry concepts: Expo Router entry versus the legacy `App.js` Supabase test screen.
- Remove or fix the legacy `App.js` query against the non-schema `todos` table.
- Add automated tests; no test script or test files currently exist.
- Decide whether to implement a replacement authentication method (e.g. email/password, magic link) for users without Google accounts.

## 7. Known Issues / Blockers

- The audit reported that `node`, `npm`, and `expo` were not available on the current terminal PATH, preventing local start/build verification there.
- The current login screen imports `src/lib/supabaseClient.ts`; README text refers to `src/lib/supabase.ts`, which does not exist in the current workspace. The existing client uses the `EXPO_PUBLIC_*` variable names.
- Remote migrations `001` through `006` are applied. Migrations `003` and `004` added phone-auth columns/constraints that are no longer exercised by the app but remain in the database.
- `.env.example` was reported by the audit as containing real Supabase values. Treat it as sensitive until replaced with placeholders.
- Listing creation now persists listings and listing photo records through Supabase; real-device and failure-recovery testing remain.
- Search, filters, saved listings, My Listings, Chat, and listing detail are incomplete or placeholder implementations.
- No automated regression coverage exists.
- The worktree contains many modified and untracked files, so the intended committed baseline is not fully clear.
- Google OAuth is the only sign-in method; users without Google accounts cannot log in.

## 8. Next Immediate Steps

1. Install/use a working Node.js/npm environment and run `npm install`, then start the Expo app with `npx expo start`.
2. Configure Google OAuth in the Supabase dashboard and Google Cloud, then test the flow on a development build.
3. Verify real listing insertion, owner-scoped retrieval, and photo persistence on a real authenticated device.
4. Replace remaining hard-coded profile fields and connect marketplace screens to live data.
5. Add focused tests for auth, listing creation, RLS-sensitive data access, and the main marketplace actions.
6. Optionally implement an alternative sign-in method (email/password, magic link) for users without Google accounts.
