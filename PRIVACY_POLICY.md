# Privacy Policy

**Last updated:** September 3, 2026

This Privacy Policy explains how **Subodh Das** ("TotoStore", "we", "us", or "our") collects, uses, stores, and shares information when you use the TotoStore mobile application (the "App").

**Important:** This is a draft for review, not legal advice. Have a qualified lawyer review it before publication and confirm the applicable laws, retention periods, international-transfer language, and business details.

## 1. Who We Are

Data controller/operator: **Subodh Das**  
Business location: **West Bengal, India**  
Privacy contact: **support.totostore@gmail.com**  
Country/jurisdiction: **India; state: West Bengal**

## 2. Information We Collect

### Account and authentication information

When you create or use an account, we may process:

- Email address.
- Phone number, where provided or used for authentication.
- Authentication identifiers and session information managed by Supabase Auth.
- Profile information such as full name, profile photo, biography, city, state, and country.
- Account verification status and account creation/update timestamps.

### Marketplace information

If you create a listing, we may process:

- Listing title, description, category, condition, status, price, and currency.
- Vehicle information such as brand, model, year, mileage, fuel type, and transmission.
- Listing city, state, and country.
- Listing photos and other media selected for upload.
- Listing views, timestamps, seller identifier, and listing status.

### Saved listings

We store the listings you save or favorite and the time they were saved. Saved-listing records are intended to be private to the account that created them.

### Device, diagnostic, and usage information

The App uses Sentry for error monitoring and diagnostics. Depending on configuration and your interaction with the App, Sentry may receive crash reports, errors, stack traces, device and operating-system information, application version, network/request context, and related diagnostic metadata.

The current configuration also enables Sentry Session Replay at a sample rate and Sentry Feedback. Session Replay may record app interaction/session data. The exact captured fields, masking/redaction configuration, and production retention settings must be confirmed in the Sentry dashboard before publication. Do not submit passwords, authentication codes, payment details, or other sensitive information in feedback or fields that may be captured by replay.

The current codebase does not show Firebase Analytics, Mixpanel, Amplitude, another analytics SDK, or a payment gateway.

## 3. Device Permissions

The current App configuration declares or requests:

- **Photos/media:** Expo Image Picker requests access to the user's photos for vehicle listings and profile photos.
- **Microphone/audio:** Android declares `android.permission.RECORD_AUDIO`, and the image-picker configuration includes a microphone permission message for listing videos.

The current `app.json` does not declare location, camera, contacts, calendar, biometric, or notification permissions. Permission behavior can change when native dependencies or configuration change.

We use these permissions only for the related feature and do not sell permission data.

## 4. How We Use Information

We may use information to:

- Create, authenticate, secure, and maintain accounts.
- Display and manage marketplace listings.
- Let users save listings and contact sellers.
- Store and display profile and listing photos.
- Provide support and respond to requests.
- Detect, investigate, and fix crashes, abuse, fraud, and security incidents.
- Operate, maintain, and improve the App.
- Comply with legal obligations and enforce our Terms of Service.

## 5. Public and Private Information

TotoStore is a marketplace. Active listings and listing photos are designed to be publicly readable so other users can discover listings. Listing information may include the seller's listing details and location at the city/state level.

The current database configuration is intended to expose only seller name, avatar, and authenticated seller contact information through the public seller view. Email, biography, and location fields are intended to remain owner-only. Users should avoid placing sensitive information in profiles or listings.

Saved-listing records are restricted to the account owner by the current row-level security policies.

## 6. Service Providers and Sharing

We may share information with service providers that process it on our behalf:

### Supabase

Supabase provides authentication, database, API, Edge Functions, and Storage services. Account, profile, listing, saved-listing, and photo data are stored and processed through the Supabase project configured for the App. Profile photos are stored in the `profile-photos` bucket and listing photos in the `listing-photos` bucket. Both buckets are currently configured as public, so their object URLs may be accessible without an authenticated session.

Supabase project URL/region: The project host and data-center region are not specified in this policy. Confirm them in the Supabase dashboard before publication.  
Supabase privacy documentation: https://supabase.com/privacy

### Sentry

Sentry provides crash monitoring, diagnostic telemetry, feedback, and Session Replay. The configured DSN uses Sentry's US ingestion host (`ingest.us.sentry.io`), indicating that telemetry is sent to Sentry's US service endpoint. Confirm the actual Sentry organization data region, processing location, retention, and applicable data-processing terms before publication.

Sentry organization/project: `totostore` / `react-native`  
Sentry privacy/DPA documentation: https://sentry.io/legal/dpa/

### Other disclosures

We may disclose information if required by law, to protect rights and safety, to investigate misuse, or as part of a merger, acquisition, financing, or sale of assets. We do not currently identify an advertising analytics provider or payment processor in the codebase.

## 7. International Transfers

Supabase and Sentry may process information in countries outside your country of residence, including the United States. Confirm the applicable legal transfer mechanism and required notice/consent language before publication.

## 8. Retention

We retain account, profile, listing, saved-listing, and photo data until you delete your account, unless a longer period is required for legal, security, dispute-resolution, or backup purposes. After an account deletion request, we aim to permanently remove the account data within 30 days. Third-party logs, crash reports, Session Replay, and backups may follow the provider's retention schedule and applicable legal requirements.

## 9. Account Deletion and Your Rights

The App currently provides **Settings > Delete Account**. The deletion flow attempts to remove the user's listing photos, profile photo, listings, profile row, and Supabase authentication user, then signs the user out. Deletion may be subject to backups, legal retention duties, unresolved disputes, or records that must be retained by law.

Depending on applicable law, you may have rights to:

- Access or obtain a copy of your personal information.
- Correct inaccurate information.
- Delete your information.
- Restrict or object to certain processing.
- Withdraw consent where processing relies on consent.
- Receive portable data in a usable format.
- Lodge a complaint with a data-protection authority.

Data export/access request mechanism: No dedicated in-app export flow is currently available. Request access or an export by emailing **support.totostore@gmail.com**.  
To exercise rights, contact **support.totostore@gmail.com**. We may verify your identity before completing a request.

## 10. Children's Privacy

The App is not intended for children under the minimum age required by applicable Indian law. We do not knowingly collect personal information from children contrary to applicable law. Contact us if you believe a child has provided information.

## 11. Security

We use technical and organizational measures appropriate to the nature of the information. No service can guarantee absolute security. Users are responsible for protecting their credentials and should report suspected account misuse promptly.

## 12. Changes

We may update this Policy from time to time. We will post the updated version and revise the "Last updated" date. For material changes, we will provide notice in the App or by another reasonable method where required by law.

## 13. Contact

Privacy questions, requests, or complaints:  
**Subodh Das**  
**support.totostore@gmail.com**  
**West Bengal, India**
