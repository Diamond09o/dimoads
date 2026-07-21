# Dimoads AI - Complete System Architecture & Schema Specification

This document provides the full system architecture, Firestore database schema, modular folder structure, and MVP development roadmap for **Dimoads AI**—a global, AI-powered classifieds marketplace.

---

## 1. System Architecture

```
                                    +-----------------------------------+
                                    |         Client Browser            |
                                    |  (React SPA / Next.js Frontend)   |
                                    +-----------------+-----------------+
                                                      |
                                                      | Web Requests / API Calls
                                                      v
                                    +-----------------+-----------------+
                                    |         Express Proxy Server      |
                                    |        (Port 3000 Node.js)        |
                                    +--------+--------+--------+--------+
                                             |        |        |
                         Static Assets / HTML|        |        | Gemini API calls
                                             |        |        | (Securely authenticated)
                                             v        |        v
                                   +---------+----+   |   +----+---------------+
                                   | Client App   |   |   | Google Gemini API  |
                                   | (React Code) |   |   | (gemini-3.5-flash) |
                                   +--------------+   |   +--------------------+
                                                      |
                                                      | Firebase SDK (Client-Side Direct Connect)
                                                      v
                                   +------------------+------------------+
                                   |         Firebase Platform           |
                                   |  +-------------------------------+  |
                                   |  | Firebase Authentication (Auth)|  |
                                   |  +-------------------------------+  |
                                   |  | Cloud Firestore (NoSQL DB)    |  |
                                   |  +-------------------------------+  |
                                   |  | Firebase Storage (Images/Vid) |  |
                                   |  +-------------------------------+  |
                                   +-------------------------------------+
```

### Architectural Highlights
1. **Full-Stack Isolation & Security**: Client-side keys are kept completely secure by utilizing a backend Express proxy server. All Google Gemini API operations are executed server-side under strict environment variable injections (`GEMINI_API_KEY`).
2. **Offline-First Direct Storage Connect**: The React client directly initializes and queries Firestore databases and uploads to Firebase Storage, utilizing the custom `firestore.rules` security gates for zero-trust client writes.
3. **Double Translation Layer**: Natural language query strings or listing generation requests are channeled to the server-side Gemini service, returning structured JSON directly mapped to client states.
4. **Phone Auth Verification Workflow**: Users authenticate using Firebase Authentication's native telephone / OTP mechanisms, generating a trusted JWT token to claim their unique Firestore profile document in `/users/{userId}`.

---

## 2. Database Schema Design (Firestore)

### Collection: `users/{userId}`
Stores user profiles, trust indices, and verification statuses.

| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Unique, matches Auth UID | User identification |
| `name` | `string` | max 100 chars | Display name or business title |
| `email` | `string` | Regex match format | Primary correspondence email |
| `phone` | `string` | max 30 chars | Verified telephone number |
| `accountType` | `string` | enum: `["personal", "business"]` | Account target mode |
| `verificationStatus`| `string` | enum: `["unverified", "pending", "verified"]` | KYC verification state |
| `trustScore` | `integer`| 0 to 100 | Generated score based on ratings & age |
| `createdAt` | `timestamp`| Immutable on write | Date profile was registered |

### Collection: `listings/{listingId}`
Stores classified advertisements across the nine platform-defined global categories.

| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Auto ID | Unique listing identity |
| `title` | `string` | max 150 chars | Headline of the listing |
| `description` | `string` | max 5000 chars | Item/job/service descriptions |
| `category` | `string` | enum (9 core categories) | Broad listing category |
| `location` | `string` | max 150 chars | Physical country, state, city |
| `price` | `number` | `>= 0.0` | Selling price in USD |
| `images` | `array` | max 10 elements | Array of secure asset URLs |
| `video` | `string` | Optional URL | Demo video attachment |
| `contactOptions` | `map` | `phone`, `email`, `whatsapp` | Verified direct contacts |
| `ownerId` | `string` | Matches existing user | UID of the ad poster |
| `isPremium` | `boolean` | Default `false` | Featured listing boost |
| `status` | `string` | enum: `["pending", "active", "suspended", "sold"]` | Verification status |
| `aiTags` | `array` | max 15 elements | AI generated SEO search terms |
| `originalLanguage` | `string` | `en` or `ar` | Language of initial creation |
| `translations` | `map` | Arabic/English dictionary | Translated titles/descriptions |
| `viewsCount` | `integer`| `>= 0` | Metrics dashboard views counter |
| `createdAt` | `timestamp`| Server time | Posting timestamp |
| `updatedAt` | `timestamp`| Server time | Modified timestamp |

### Sub-Collection: `chats/{chatId}/messages/{messageId}`
Instant messaging records between buyers and sellers. `chatId` is compiled of two UIDs alphabetically (`UID1_UID2`).

| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Auto ID | Message document ID |
| `chatId` | `string` | Matches parent ID | Conversation room thread key |
| `senderId` | `string` | Matches active user | Dispatcher UID |
| `receiverId` | `string` | Matches active user | Recipient UID |
| `text` | `string` | max 2000 chars | Body content |
| `createdAt` | `timestamp`| Server time | Dispatch timestamp |

### Collection: `reports/{reportId}`
User-reported fraud flags reviewed in the Admin Panel.

| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Auto ID | Moderation ticket identifier |
| `listingId` | `string` | Matches listing | Flagged listing identifier |
| `reporterId` | `string` | Matches active user | Submitting user UID |
| `reason` | `string` | max 500 chars | Description of terms violation |
| `status` | `string` | enum: `["pending", "resolved", "dismissed"]` | Moderation ticket workflow state |
| `createdAt` | `timestamp`| Server time | Date of filing |

---

## 3. Folder Structure (Vite/TypeScript Full-Stack Layout)

```
/
├── .env.example                       # Environment variables manifest
├── ARCHITECTURE.md                    # System architecture design & maps (This file)
├── security_spec.md                   # Security validation specifications & thread matrix
├── firestore.rules                    # Hardened Firebase security ruleset
├── firebase-blueprint.json            # Database structure intermediate representation
├── package.json                       # Scripts and node dependencies
├── tsconfig.json                      # Type definitions and typescript options
├── vite.config.ts                     # Bundling & Vite configurations
├── server.ts                          # Express server-side controller & Gemini proxy API
├── src/                               # Frontend single-page application core
│   ├── main.tsx                       # Client application mount entrypoint
│   ├── index.css                      # Tailwind v4 import definitions
│   ├── App.tsx                        # Root layout & view controller
│   ├── types.ts                       # Shared TypeScript interfaces & enums
│   ├── data.ts                        # Preseeded listings for demo content
│   ├── components/                    # Modular reusable UI components
│   │   ├── AddListingModal.tsx        # AI-driven listing creation form
│   │   ├── AdminDashboard.tsx         # Analytical admin console & reporting
│   │   ├── ListingCard.tsx            # Bento-grid styled listing layout
│   │   ├── MessagingDrawer.tsx        # Direct messaging buyer-seller engine
│   │   ├── ProfileModal.tsx           # Trust score & Verification status panel
│   │   └── SearchBar.tsx              # Natural Language + standard filter bar
│   └── lib/
│       └── firebase.ts                # Client-side Firebase connector SDK and hooks
```

---

## 4. Development Roadmap (MVP Version 1.0)

### Phase 1: Core Base Setup (Week 1)
- [x] Create core repo structure, package scripts, and full-stack Express routing
- [x] Define entity models in `firebase-blueprint.json` and generate `firestore.rules`
- [x] Configure Tailwind v4 with RTL-compatible utility variables

### Phase 2: User Trust & Classified Ad Systems (Week 2)
- [x] Design user profile models featuring the business verification panel and active **Trust Score** calculators (derived from profile completeness, verified phone, and age of account)
- [x] Formulate the primary dashboard with bento grid layouts matching nine diverse classified categories
- [x] Add filtering, search bounds, messaging structures, and a mock payment trigger for paid **Premium Listings**

### Phase 3: Server-Side Gemini AI Features (Week 3)
- [x] Implement `/api/gemini/listing-assistant` to expand 2-word blurbs into rich search-engine optimized (SEO) details, suggest matching categories, and generate hashtags
- [x] Create `/api/gemini/search` to support natural language queries (e.g. *"Looking for a reliable compact car for around $5k in Munich"*) returning matched listings based on semantic intent
- [x] Program `/api/gemini/translate` offering real-time English to Arabic / Arabic to English translations with a corresponding RTL UI direction toggle
- [x] Build `/api/gemini/fraud-detection` analyzing post titles and prices to flag unrealistic bargains or duplicate spans

### Phase 4: Administrative Security & Deployment (Week 4)
- [x] Construct the Admin Console allowing administrators to manage listings, view platform logs, dismiss reports, and observe simulated commission revenue tracking
- [x] Run full-scale bundlers and deploy code seamlessly onto secure Cloud Run containers, hiding the Gemini API keys from any external inspection
