# RikshawMart Codebase Audit

Audit date: 2026-08-21

Scope: Expo configuration, local CLI state, routing, screens, components, data, Supabase clients, assets, scripts, TypeScript configuration, and repository hygiene.

This document records problems only. It intentionally does not include solutions.

## Critical / Blocking Problems

### 1. Expo CLI cannot run in the current terminal environment

- The reported command fails with `'expo' is not recognized as an internal or external command`.
- The current terminal also cannot resolve `node` or `npm` from PATH.
- `package.json` declares Expo and the `expo start` script, so the failure is not caused by a missing script declaration.
- The repository contains `node_modules`, but the installed executable cannot be verified from the current shell because Node itself is unavailable.
- Result: the development server cannot be started from this terminal.

Evidence: `package.json`, current PowerShell command output.

### 2. Real Supabase credentials are present in `.env.example`

- `.env.example` contains a real Supabase project URL and a real publishable key value rather than placeholders.
- The file is untracked in the current worktree and is easy to share or commit accidentally.
- This creates a credential exposure and project-targeting risk.

Evidence: `.env.example`.

### 3. Supabase configuration uses two incompatible clients

- `src/lib/supabase.ts` reads `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- `src/lib/supabaseClient.ts` reads `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- The README documents the `EXPO_PUBLIC_*` names and explicitly says `NEXT_PUBLIC_*` is not read by this React Native app.
- `App.js` imports `src/lib/supabaseClient.ts`, so loading that entry can fail even when the documented Expo variables are configured.
- `src/lib/supabase.ts` throws immediately when the Expo variables are absent.

Evidence: `App.js`, `src/lib/supabase.ts`, `src/lib/supabaseClient.ts`, `README.md`.

## High-Severity Functional Problems

### 4. Authentication is limited to Google OAuth

- The login screen uses Supabase Google OAuth and establishes the returned session.
- No alternate login methods are available.
- The logout action ends the Supabase session.

Evidence: `src/app/index.tsx`.

### 5. Listing publication is discarded

- The sell form creates a payload only in memory and logs it.
- No database insert, storage upload, shared state update, or local persistence occurs.
- The success screen claims the listing is live even though it is not stored.
- The My Listings screen always reports that there are no active listings.

Evidence: `src/app/(tabs)/sell.tsx`, `src/app/my-listings.tsx`, `src/app/sell-success.tsx`.

### 6. Search is nonfunctional

- Home and Search both pass an empty string to `SearchBar`.
- Both screens provide no-op `onChangeText` callbacks.
- Search results are never filtered by user input.
- The search screen always displays `42 Totos Found`, while the mock dataset contains only six listings.

Evidence: `src/app/(tabs)/home.tsx`, `src/app/(tabs)/search.tsx`, `src/components/SearchBar.tsx`, `src/data/mockListings.ts`.

### 7. Filters are static and not applied

- The filter screen only renders text values.
- There are no controls for changing price, type, or year.
- There is no apply action or connection between filter state and the listing data.
- Search starts with hard-coded filter chips unrelated to actual filtering.

Evidence: `src/app/filters.tsx`, `src/app/(tabs)/search.tsx`.

### 8. Saved listings do not work across the application

- Home and Search each maintain separate local saved state.
- Saved state is not persisted and is not shared between screens.
- The Saved screen always displays an empty state and never renders saved listings.
- A saved item cannot be recovered after navigation or app restart.

Evidence: `src/app/(tabs)/home.tsx`, `src/app/(tabs)/search.tsx`, `src/app/saved.tsx`.

### 9. Favorite button can also activate card navigation

- The favorite control is a nested `Pressable` inside the listing card's outer `Pressable`.
- The favorite handler does not stop the outer press behavior.
- Tapping the favorite can therefore also navigate to listing details.

Evidence: `src/components/ListingCard.tsx`.

### 10. Listing detail route is only a placeholder

- The detail screen displays only the selected ID.
- It does not load or render the selected listing, photos, price, location, seller, or actions.

Evidence: `src/app/listing/[id].tsx`.

### 11. My Listings, Chat, and Saved screens are empty placeholders

- My Listings always shows no listings.
- Chat always shows no conversations.
- Saved always shows no saved listings.
- None of these screens are connected to data or user actions.

Evidence: `src/app/my-listings.tsx`, `src/app/chat.tsx`, `src/app/saved.tsx`.

## Medium-Severity Runtime and Data Problems

### 12. Invalid numeric form values are accepted

- Sell validation checks only whether the price string is non-empty.
- Price, purchase year, and kilometers are converted with `Number(...)` without checking for `NaN`, valid ranges, or realistic values.
- Invalid numeric input can enter the generated payload.

Evidence: `src/app/(tabs)/sell.tsx`.

### 13. Video duration validation may reject valid videos incorrectly

- `expo-image-picker` asset duration is commonly represented in milliseconds.
- The picker option uses `videoMaxDuration: 60`, while the later comparison uses `MAX_VIDEO_DURATION_MS = 60000`.
- The code assumes one unit for the picker option and another unit for the returned asset without normalizing them.
- A missing duration is converted to `0`, so a video with unavailable metadata is accepted as valid.

Evidence: `src/app/(tabs)/sell.tsx`.

### 14. Listing photos are never displayed in listing cards

- Listing data includes a `photos` array.
- `ListingCard` ignores that array and always renders an icon placeholder.
- User-selected photos are shown only temporarily inside the sell form and are not visible in listing results.

Evidence: `src/components/ListingCard.tsx`, `src/data/mockListings.ts`, `src/app/(tabs)/sell.tsx`.

### 15. Mock image URL is invalid

Status: Resolved. The mock listing and sell-form fallback now use a concrete image URL.

- Historical issue: mock listings used `https://images.unsplash.com/...` with an ellipsis rather than a concrete image path.
- Historical issue: the fallback listing image in the sell payload did not include a concrete image URL format.

Evidence: `src/data/mockListings.ts`, `src/app/(tabs)/sell.tsx`.

### 16. External link component does nothing

- The external link component accepts an `href` but ignores it.
- Its press handler is a no-op, so rendered external links cannot open their destination.

Evidence: `src/components/external-link.tsx`.

### 17. Several visible actions are silent no-ops

- Notification buttons on Home and Sell do nothing.
- Profile menu and notification buttons do nothing.
- Edit Profile, Settings, and Help & Support do nothing.
- Search sorting has no handler.

Evidence: `src/app/(tabs)/home.tsx`, `src/app/(tabs)/sell.tsx`, `src/app/(tabs)/profile.tsx`, `src/app/(tabs)/search.tsx`.

### 18. Profile information is hard-coded

- User name, phone number, rating, and active listing count are fixed display values.
- The active listing count does not reflect the listing screen, because published listings are not stored.

Evidence: `src/app/(tabs)/profile.tsx`.

### 19. The `explore` route is unused and disconnected

- `src/app/explore.tsx` is present but is not registered in the root stack or tab layout.
- It renders a standalone placeholder screen and is not reachable through the visible navigation.

Evidence: `src/app/explore.tsx`, `src/app/_layout.tsx`, `src/app/(tabs)/_layout.tsx`.

## Module and Maintainability Problems

### 20. Legacy JavaScript files are misnamed, misplaced, or export the wrong component

Status: Resolved. Confirmed-unused legacy JavaScript modules and `src/VehicleThumbnail.js` were removed. The TypeScript hook files remain active.

- Historical issue: multiple files under `src/hooks` contained UI component implementations rather than hooks.
- Historical issue: `src/hooks/SectionHeader.js` imported a missing `./VehicleThumbnail` module.
- Historical issue: `src/VehicleThumbnail.js` exported `EmptyState` instead of `VehicleThumbnail`.
- Historical issue: legacy files contained duplicate component names and conflicting implementations with the TypeScript components.

Evidence: `src/hooks/*.js`, `src/VehicleThumbnail.js`, `tsconfig.json`.

### 21. JavaScript entry and legacy files are excluded from TypeScript checking

Status: Partially resolved. The removed legacy JavaScript modules no longer create hidden broken imports. `App.js` remains JavaScript and is still outside the TypeScript include patterns.

- `tsconfig.json` includes only TypeScript files and does not enable JavaScript checking.
- `App.js`, `src/VehicleThumbnail.js`, and the legacy `src/hooks/*.js` files are therefore not checked for imports, types, or dead/broken exports.

Evidence: `tsconfig.json`.

### 22. Two application entry concepts coexist

- `package.json` uses `expo-router/entry` as the application entry.
- `App.js` separately defines a Supabase test screen and imports the conflicting Supabase client.
- This creates ambiguity about which application surface is intended to run and leaves test-entry behavior alongside the router application.

Evidence: `package.json`, `App.js`, `src/app/_layout.tsx`.

### 23. Reset script is destructive for this customized project

Status: Resolved. The script now requires the exact confirmation `RESET` and defaults the move/delete choice to non-destructive cancellation behavior.

- Historical issue: running the reset script could delete or move both `src` and `scripts`.
- The current application, components, data, services, and types are all inside those directories.
- The script can therefore remove or relocate the active product code and the reset script itself.

Evidence: `scripts/reset-project.js`.

## Configuration and Repository Problems

### 24. README setup instructions do not match the repository's environment-file state

- The README instructs users to copy `.env.example`.
- The file is currently untracked rather than part of the tracked repository state shown by `git ls-files`.
- A fresh checkout may therefore not contain the documented setup file.

Evidence: `README.md`, `.env.example`, repository status.

### 25. Environment and generated files have inconsistent repository state

- The worktree contains many modified, deleted, and untracked project files across the active app surface.
- This makes it difficult to determine which implementation is the intended baseline and whether all required files are included in version control.
- The audit cannot establish from the current status alone whether these changes are intentional or incomplete.

Evidence: repository status output.

### 26. No automated tests are present

- `package.json` has no test script and no test dependency.
- There are no test files in the listed project structure.
- Authentication, search, filtering, saving, listing creation, routing, and configuration behavior therefore have no automated regression coverage.

Evidence: `package.json`, project file inventory.

## Validation Limitations

- TypeScript/editor diagnostics reported no errors, but JavaScript files are excluded from TypeScript checking.
- Runtime validation could not be completed because the current terminal cannot resolve `node`, `npm`, or the Expo CLI.
- No files were changed other than this audit document.
