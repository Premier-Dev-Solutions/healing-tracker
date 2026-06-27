# CODEBASE OVERVIEW

**Generated:** 2026-06-27
**Project:** Heal From It - Healing Journey Tracker
**Version:** 0.1.0
**Current Branch:** dev
**Cloud Sync:** Optional - Supabase configured (local-first architecture)

---

## Project Snapshot

### Technology Stack
- **Frontend Framework:** React 18.3.1 + TypeScript
- **Build Tool:** Vite 6.3.5 with PWA plugin
- **Styling:** Tailwind CSS v4 + shadcn/ui components
- **Data Storage:** IndexedDB (local-first, with migration from localStorage)
- **Cloud Sync:** Supabase (PostgreSQL + Auth) - optional, configured with @supabase/supabase-js
- **State Management:** React Context (AuthProvider) + hooks + local state
- **Authentication:** Supabase Auth with email/password
- **Data Fetching:** Direct async/await (no React Query in use)
- **Icons:** Lucide React
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod validation (installed but not used yet)
- **Date Handling:** date-fns
- **File Handling:** xlsx (for CSV/XLSX import)

### Current Phase
**Phase:** Post-MVP Enhancement (Phase 2) + Cloud Sync Integration
**Status:** Feature-rich, functional application with comprehensive tracking capabilities and optional cloud sync

The application has evolved significantly beyond the original MVP scope described in src/README.md. Several advanced features have been implemented including:
- **Separate Herbs and Foods tabs** with comprehensive management
- **Outbreak tracking** with food correlation
- **Supplier management** system
- **Daily routine tracking** (pills, herbs/teas, foods)
- **Branding** (logo and favicon added)
- **Authentication layer** (Supabase Auth with email/password)
- **Cloud sync infrastructure** (optional, local-first architecture preserved)
- **PWA support** (offline-capable with service worker)

---

## Directory Tree with Annotations

```
healing-tracker/
├── .claude/                           # Claude Code configuration
│   └── settings.local.json           # Local settings
├── .env.local                        # ✅ Environment variables (Supabase keys) - NOT in git
├── .git/                             # Git repository
├── node_modules/                     # Dependencies (ignored)
├── public/                           # Static assets
│   ├── favicon.ico                   # ✅ Branding asset
│   ├── logo.png                      # ✅ Branding asset
│   ├── Original Logo.svg             # ✅ Branding asset
│   └── Transparent Logo.svg          # ✅ Used in App header
├── src/
│   ├── components/
│   │   ├── figma/                    # Figma-related utilities
│   │   │   └── ImageWithFallback.tsx # ✅ Utility component
│   │   ├── ui/                       # shadcn/ui components (67 files)
│   │   │   ├── accordion.tsx         # ✅ Radix UI wrapper
│   │   │   ├── alert.tsx             # ✅ Alert component
│   │   │   ├── button.tsx            # ✅ Button component
│   │   │   ├── card.tsx              # ✅ Most-used layout component
│   │   │   ├── dialog.tsx            # ✅ Modal wrapper
│   │   │   ├── [... 62 more]        # ✅ Full shadcn/ui suite
│   │   │   └── utils.ts              # ✅ cn() utility for classnames
│   │   ├── Auth.tsx                  # ✅ NEW - Sign in/up UI with email/password
│   │   ├── ConsistencyTracker.tsx    # ✅ IMPLEMENTED - Streak tracking with calendar
│   │   ├── DailyJournal.tsx          # ✅ IMPLEMENTED - Wellness reflection (sleep, workout, stress)
│   │   ├── DailyRoutine.tsx          # ✅ IMPLEMENTED - Protocol tracker (pills, herbs/teas, foods)
│   │   ├── Dashboard.tsx             # ✅ UPDATED - Uses separate herbs/foods stores
│   │   ├── Foods.tsx                 # ✅ IMPLEMENTED (1094 lines) - Full CRUD with lysine/arginine
│   │   ├── Herbs.tsx                 # ✅ IMPLEMENTED (1486 lines) - Full CRUD with inventory
│   │   ├── OutbreakTracker.tsx       # ✅ IMPLEMENTED - Outbreak tracking with food correlation
│   │   ├── Settings.tsx              # ✅ UPDATED - Export/import/clear + CSV template download
│   │   ├── Suppliers.tsx             # ✅ IMPLEMENTED (522 lines) - Full supplier management
│   │   ├── SyncStatus.tsx            # ✅ NEW - Header status indicator (local/synced)
│   │   ├── TestingTracker.tsx        # ✅ IMPLEMENTED - Health test reminders
│   │   └── _HerbsAndFoods.legacy.tsx # 🗄️  ARCHIVED - Old combined view (renamed, not in use)
│   ├── lib/
│   │   ├── auth.ts                   # ✅ NEW - Auth helpers wrapping Supabase
│   │   ├── csvParser.ts              # ✅ UPDATED - Uses Herb type, enhanced template
│   │   ├── indexedDB.ts              # ✅ UPDATED - DB v5, removed herbsFoods store
│   │   ├── migration.ts              # ✅ CLEANED - Removed split migration logic
│   │   ├── storage.ts                # ✅ CLEANED - Removed HerbFood type and functions
│   │   ├── supabase.ts               # ✅ NEW - Supabase client configuration
│   │   └── usdaApi.ts                # ⚠️  SCAFFOLDED - USDA API integration (DEMO_KEY)
│   ├── stores/
│   │   ├── authStore.ts              # ✅ NEW - React Context for auth state
│   │   └── AuthProvider.tsx          # ✅ NEW - Auth state provider component
│   ├── styles/
│   │   └── globals.css               # ✅ Tailwind CSS v4 config
│   ├── types/
│   │   └── supabase.ts               # ✅ NEW - TypeScript types for database schema
│   ├── guidelines/
│   │   └── Guidelines.md             # 📝 Empty template for AI guidelines
│   ├── Attributions.md               # 📝 Attribution file
│   ├── README.md                     # 📝 Comprehensive setup and usage guide
│   ├── App.tsx                       # ✅ UPDATED - Wrapped in AuthProvider, SyncStatus in header
│   ├── index.css                     # ✅ Base CSS imports
│   └── main.tsx                      # ✅ React entry point
├── .gitignore                        # ✅ Includes .env.local
├── CODEBASE_OVERVIEW.md              # 📝 This file - comprehensive project documentation
├── index.html                        # ✅ HTML entry point (title: "Heal From It")
├── package.json                      # ✅ Dependencies and scripts
├── package-lock.json                 # Lockfile
├── README.md                         # 📝 User-facing documentation
├── tsconfig.json                     # ✅ NEW - TypeScript configuration
├── tsconfig.node.json                # ✅ NEW - TypeScript config for Vite tooling
└── vite.config.ts                    # ✅ FOUND - Includes PWA plugin configuration
```

---

## File Catalog

### Entry Points
- **[index.html](index.html)** - HTML entry, includes favicon and Transparent Logo.svg reference
- **[src/main.tsx](src/main.tsx:1)** - React bootstrap, renders `<App />` to root
- **[src/App.tsx](src/App.tsx:1)** - Main component wrapped in AuthProvider, tab navigation (10 tabs), SyncStatus in header, auth dialog, runs autoMigrate() on mount

### Core Library Files
- **[src/lib/indexedDB.ts](src/lib/indexedDB.ts:1)** - IndexedDB wrapper (DB_VERSION: 5, 8 object stores, removed herbsFoods)
- **[src/lib/storage.ts](src/lib/storage.ts:1)** - All CRUD operations for data entities, uses separate herbs/foods stores
- **[src/lib/migration.ts](src/lib/migration.ts:1)** - One-time localStorage to IndexedDB migration utility (cleaned, no split migration)
- **[src/lib/csvParser.ts](src/lib/csvParser.ts:1)** - CSV/XLSX import for herbs catalog, enhanced template with guidance
- **[src/lib/usdaApi.ts](src/lib/usdaApi.ts:1)** - USDA FoodData Central API integration (uses DEMO_KEY, not production-ready)
- **[src/lib/supabase.ts](src/lib/supabase.ts:1)** - Supabase client initialization with isSupabaseConfigured() helper
- **[src/lib/auth.ts](src/lib/auth.ts:1)** - Authentication helpers (signUp, signIn, signOut, getCurrentUser, onAuthStateChange, resetPassword)

### Authentication & State Management
- **[src/stores/authStore.ts](src/stores/authStore.ts:1)** - React Context for auth state (user, session, isLoading, isAuthenticated)
- **[src/stores/AuthProvider.tsx](src/stores/AuthProvider.tsx:1)** - AuthProvider component, subscribes to Supabase auth changes
- **[src/types/supabase.ts](src/types/supabase.ts:1)** - TypeScript types for database schema (8 tables: herbs, foods, suppliers, daily_routines, journal_entries, outbreaks, testing_reminders, purchase_history)

### Page Components (10 Tabs)
1. **[src/components/Dashboard.tsx](src/components/Dashboard.tsx:1)** - Redesigned: date greeting, daily routine banner (links to routine tab), 2-column stat grid with 6 clickable cards (herbs, foods, avg sleep, avg stress, consistency, workout streak), clickable journal section header. Accepts `onNavigate: (tab: string) => void` prop wired from App.tsx.
2. **[src/components/Herbs.tsx](src/components/Herbs.tsx:1)** - Comprehensive herb catalog with search, filter, stock tracking, bulk edit, CSV template
3. **[src/components/Foods.tsx](src/components/Foods.tsx:1)** - Food catalog with lysine/arginine tracking, USDA API search
4. **[src/components/Suppliers.tsx](src/components/Suppliers.tsx:1)** - Supplier management (name, contact, email, phone, website, address)
5. **[src/components/DailyRoutine.tsx](src/components/DailyRoutine.tsx:1)** - Protocol tracker: pills, herbs/teas, foods by time (uses Herb type)
6. **[src/components/DailyJournal.tsx](src/components/DailyJournal.tsx:1)** - Wellness reflection: sleep, workout, stress, notes (no badge selection, pulls from DailyRoutine)
7. **[src/components/OutbreakTracker.tsx](src/components/OutbreakTracker.tsx:1)** - Outbreak tracking with food correlation analysis
8. **[src/components/ConsistencyTracker.tsx](src/components/ConsistencyTracker.tsx:1)** - Calendar view with streaks
9. **[src/components/TestingTracker.tsx](src/components/TestingTracker.tsx:1)** - Recurring health test reminders
10. **[src/components/Settings.tsx](src/components/Settings.tsx:1)** - Export/import/clear data, storage stats, CSV template download

### Authentication Components
- **[src/components/Auth.tsx](src/components/Auth.tsx:1)** - Sign in/up UI with email/password, forgot password, error handling
- **[src/components/SyncStatus.tsx](src/components/SyncStatus.tsx:1)** - Header status indicator showing local/synced state, sign in prompt

### Legacy Component (Archived)
- **[src/components/_HerbsAndFoods.legacy.tsx](src/components/_HerbsAndFoods.legacy.tsx:1)** - Old combined view (renamed, not in use)

### UI Components (67 files in src/components/ui/)
All shadcn/ui components are present and functional. Most commonly used:
- **card.tsx** - Used in every page component
- **button.tsx** - Primary interaction component
- **dialog.tsx** - Used for all modals/forms
- **select.tsx** - Dropdowns for suppliers, categories
- **badge.tsx** - Status indicators, tags
- **table.tsx** - Data display in Herbs/Foods
- **alert.tsx** - Warnings, notifications

### Configuration & Documentation
- **[.env.local](.env.local)** - Environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) - **NOT in git**
- **[package.json](package.json:1)** - Dependencies complete, includes @supabase/supabase-js and vite-plugin-pwa
- **[vite.config.ts](vite.config.ts:1)** - Vite configuration with PWA plugin (offline support, service worker)
- **[tsconfig.json](tsconfig.json:1)** - TypeScript configuration (strict mode, path aliases)
- **[tsconfig.node.json](tsconfig.node.json:1)** - TypeScript config for Vite tooling
- **[src/index.css](src/index.css:1)** - Tailwind CSS v4 imports
- **[src/styles/globals.css](src/styles/globals.css)** - Additional global styles
- **[README.md](README.md:1)** - User documentation with feature list
- **[src/README.md](src/README.md:1)** - Developer guide (more detailed than root README)
- **[CODEBASE_OVERVIEW.md](CODEBASE_OVERVIEW.md)** - This file - comprehensive project documentation
- **[src/guidelines/Guidelines.md](src/guidelines/Guidelines.md:1)** - Empty template
- **[src/Attributions.md](src/Attributions.md)** - Attribution file

---

## Architecture Summary

### Application Flow

```
User Browser
    │
    ├─→ index.html (root div + script)
    │       │
    │       └─→ main.tsx
    │               │
    │               └─→ App.tsx
    │                       │
    │                       ├─→ AuthProvider (wraps entire app)
    │                       │       │
    │                       │       ├─→ Subscribes to Supabase auth changes
    │                       │       └─→ Provides auth state to all children
    │                       │
    │                       └─→ AppContent (runs autoMigrate on mount)
    │                               │
    │                               ├─→ Header
    │                               │   ├─ Logo
    │                               │   └─ SyncStatus (shows local/synced state)
    │                               │
    │                               ├─→ Auth Dialog (sign in/up modal)
    │                               │
    │                               ├─→ Tabs Navigation (10 tabs)
    │                               │   ├─ Dashboard
    │                               │   ├─ Herbs
    │                               │   ├─ Foods
    │                               │   ├─ Suppliers
    │                               │   ├─ Daily Routine
    │                               │   ├─ Daily Journal
    │                               │   ├─ Outbreaks
    │                               │   ├─ Consistency
    │                               │   ├─ Testing
    │                               │   └─ Settings
    │                               │
    │                               └─→ Component (per tab)
    │                                       │
    │                                       ├─→ useEffect() → loadData()
    │                                       │       │
    │                                       │       └─→ lib/storage.ts
    │                                       │               │
    │                                       │               └─→ lib/indexedDB.ts
    │                                       │                       │
    │                                       │                       └─→ IndexedDB (Browser API)
    │                                       │
    │                                       └─→ User Interaction
    │                                               │
    │                                               └─→ saveData() → storage.ts → indexedDB.ts
    │
    ├─→ IndexedDB (HealingTrackerDB v5) [LOCAL STORAGE]
    │       ├─ herbs
    │       ├─ foods
    │       ├─ suppliers
    │       ├─ journalEntries
    │       ├─ dailyRoutines
    │       ├─ outbreaks
    │       ├─ testingReminders
    │       └─ herbInventory
    │
    └─→ Supabase (OPTIONAL - if user signs in) [CLOUD SYNC]
            ├─ Auth (user sessions)
            └─ PostgreSQL Database
                ├─ herbs
                ├─ foods
                ├─ suppliers
                ├─ daily_routines
                ├─ journal_entries
                ├─ outbreaks
                ├─ testing_reminders
                └─ purchase_history
```

### Data Flow Pattern

**Standard CRUD Pattern Used Throughout:**

```
Component Mount
    │
    ├─→ useState() hooks for local state
    │
    ├─→ useEffect([]) → loadData()
    │       │
    │       └─→ getXXX() from storage.ts
    │               │
    │               └─→ idb.getAll(STORE_NAME)
    │                       │
    │                       └─→ setState(data)
    │
    └─→ User Action (button click)
            │
            ├─→ handleSave() / handleDelete() / handleUpdate()
            │       │
            │       └─→ saveXXX() / deleteXXX() from storage.ts
            │               │
            │               └─→ idb.put() / idb.deleteByKey()
            │                       │
            │                       └─→ loadData() to refresh UI
            │
            └─→ UI updates with new state
```

**State Management:** Uses React Context for authentication state (AuthProvider). Component state via useState/useEffect. Zustand in package.json not used.

**No Data Fetching Library:** Despite package.json listing @tanstack/react-query, it's not used. All data operations are direct async/await calls.

### Key Design Patterns

1. **Local-First Architecture with Optional Cloud Sync**
   - All data stored in IndexedDB (primary storage)
   - Works fully offline without authentication
   - Optional cloud sync via Supabase when user signs in
   - No network calls except optional USDA API and Supabase sync

2. **Authentication Layer**
   - Optional authentication via Supabase Auth (email/password)
   - AuthProvider wraps entire app, provides auth state to all components
   - useAuth() hook for accessing user, session, isAuthenticated
   - SyncStatus component shows local/synced state in header
   - Auth dialog with sign in/up/forgot password modes

3. **Migration Strategy**
   - [src/lib/migration.ts](src/lib/migration.ts:1) handles one-time localStorage → IndexedDB migration
   - Runs automatically on first app load via [App.tsx](src/App.tsx)
   - Marks completion with localStorage flag
   - DB version 5 removed legacy herbsFoods store

4. **Form Pattern**
   - Dialog-based forms for add/edit operations
   - Controlled inputs with useState
   - Inline validation (simple checks, no Zod/React Hook Form usage despite packages)

5. **Data Normalization**
   - Separate stores for Herbs, Foods, Suppliers
   - Legacy `herbsFoods` store removed in DB v5
   - References by ID (string timestamps)
   - Supabase schema mirrors IndexedDB structure for sync compatibility

---

## Implementation Status

### ✅ Fully Implemented Features

#### 1. Dashboard (Redesigned 2026-06-27)
- **File:** [src/components/Dashboard.tsx](src/components/Dashboard.tsx:1)
- **Status:** COMPLETE
- **Features:**
  - Date greeting with time-of-day message (morning/afternoon/evening) using date-fns
  - Daily routine banner showing today's herb count, taps to routine tab
  - 2-column stat grid: separate herbs count, foods count, avg sleep, avg stress, consistency (with progress bar), workout streak
  - All stat cards are clickable and navigate to the relevant tab via `onNavigate` prop
  - Recent journal entries section with clickable header
  - All date comparisons use local-time parsing (timezone bug fixed)
- **Props:** `onNavigate: (tab: string) => void` — wired in App.tsx
- **Data Sources:** getHerbs(), getFoods(), getJournalEntries(), getDailyRoutineLogNew()

#### 2. Herbs Catalog (Phase 2 Enhancement)
- **File:** [src/components/Herbs.tsx](src/components/Herbs.tsx:1) (1486 lines)
- **Status:** COMPLETE with advanced features
- **Features:**
  - Full CRUD operations
  - Search by name
  - Filter by supplement type (herb, tonic, pills, tea bag, gel, topical, herb bundle, herb blend)
  - Filter by category
  - Stock level tracking (high/medium/low/out)
  - Purchase history per item
  - Bulk edit mode (select multiple, edit all at once)
  - Supplier assignment
  - CSV/XLSX import
  - Export to CSV/XLSX
  - Preparation instructions
  - Daily serving requirements tracking
- **Data Sources:** getHerbs(), saveHerb(), deleteHerb()

#### 3. Foods Catalog (Phase 2 Enhancement)
- **File:** [src/components/Foods.tsx](src/components/Foods.tsx:1) (1094 lines)
- **Status:** COMPLETE with USDA integration
- **Features:**
  - Full CRUD operations
  - Search by name
  - Filter by category (Protein, Vegetables, Fruits, Dairy, Grains, etc.)
  - Lysine/Arginine tracking (mg per serving)
  - Lysine ratio calculation and color-coding
  - Stock level tracking
  - Purchase history
  - Bulk edit mode
  - Supplier assignment
  - **USDA API integration** (search foods, auto-fill nutrition data)
  - CSV/XLSX import/export
- **Data Sources:** getFoods(), saveFood(), deleteFood(), searchUSDAFoods()

#### 4. Suppliers Management (Phase 2 Enhancement)
- **File:** [src/components/Suppliers.tsx](src/components/Suppliers.tsx:1) (522 lines)
- **Status:** COMPLETE
- **Features:**
  - Full CRUD operations
  - Contact information (name, person, email, phone, website, address)
  - Active/inactive status toggle
  - Search by name
  - Filter by status
  - Bulk delete
  - Shows herb/food count per supplier
  - Rename supplier globally (updates all references)
  - Merge suppliers
- **Data Sources:** getSuppliers(), saveSupplier(), deleteSupplier(), renameSupplierGlobally()

#### 5. Daily Routine Tracker (Phase 2 Enhancement)
- **File:** [src/components/DailyRoutine.tsx](src/components/DailyRoutine.tsx:1) (747 lines)
- **Status:** COMPLETE
- **Features:**
  - Date navigation (previous/next/today)
  - Step 1: Fasting status (yes/no + hours)
  - Step 2: Pills tracking (time, supplier, name, ingredients, quantity)
  - Step 3: Herbs/Teas tracking (time, serving size, what's in it, ingredients with suppliers)
  - Step 4: Foods tracking (time, name, serving size, notes) - hidden if fasting 24+ hours
  - Real-time prep instructions for matched herbs
  - Daily serving requirement warnings
  - Delete individual entries
- **Data Sources:** getDailyRoutineLogNew(), saveDailyRoutineLogNew(), getHerbsFoods()

#### 6. Daily Journal (Phase 1 MVP)
- **File:** [src/components/DailyJournal.tsx](src/components/DailyJournal.tsx:1) (373 lines)
- **Status:** COMPLETE (legacy format)
- **Features:**
  - Date picker
  - Sleep hours (slider 0-12h)
  - Sleep quality (slider 1-5)
  - Workout toggle + type + duration
  - Stress level (slider 1-5)
  - Notes (textarea)
  - Herbs/foods consumed (badge selection)
  - **Lysine score calculator** (shows total lysine, arginine, net score)
- **Data Sources:** getJournalEntries(), saveJournalEntry(), getHerbsFoods()
- **Note:** This is legacy format, superseded by Daily Routine for more detailed tracking

#### 7. Outbreak Tracker (Phase 2 Enhancement)
- **File:** [src/components/OutbreakTracker.tsx](src/components/OutbreakTracker.tsx:1) (526 lines)
- **Status:** COMPLETE
- **Features:**
  - Record outbreak date/time
  - Severity rating (1-5: Mild, Moderate, Severe, Very Severe, Extreme)
  - Duration tracking (start/end) or mark as ongoing
  - Symptoms and triggers text fields
  - **Food correlation analysis** (configurable lookback period, default 48h)
    - Automatically finds foods consumed before outbreak
    - Shows exact time difference (hours before outbreak)
    - Sorted by recency
  - Statistics dashboard (total, ongoing, avg severity, recent trends)
  - Edit/delete outbreak entries
  - Color-coded severity badges
- **Data Sources:** getOutbreakEntries(), saveOutbreakEntry(), deleteOutbreakEntry(), getAllDailyRoutineLogs()

#### 8. Consistency Tracker (Phase 1 MVP)
- **File:** [src/components/ConsistencyTracker.tsx](src/components/ConsistencyTracker.tsx:1) (304 lines)
- **Status:** COMPLETE
- **Features:**
  - Current streak calculation
  - Longest streak calculation
  - Total entries count
  - Weekly consistency (7 days)
  - Monthly consistency (30 days)
  - Calendar view with highlighted entry dates
  - Click date to view entry details
  - Visual stress level indicators
- **Data Sources:** getJournalEntries()

#### 9. Testing Tracker (Phase 1 MVP)
- **File:** [src/components/TestingTracker.tsx](src/components/TestingTracker.tsx:1) (361 lines)
- **Status:** COMPLETE
- **Features:**
  - Add test reminder (type, frequency in days, notes)
  - Auto-calculate next test date
  - Status badges (Overdue, Due Today, Due Soon, Upcoming)
  - Mark complete → auto-schedule next occurrence
  - Separate sections for upcoming (≤14 days) vs all scheduled
  - Delete reminders
  - Last completed date tracking
- **Data Sources:** getTestingReminders(), saveTestingReminder(), deleteTestingReminder(), updateTestCompleted()

#### 10. Settings & Backup (Phase 1 MVP)
- **File:** [src/components/Settings.tsx](src/components/Settings.tsx:1) (264 lines)
- **Status:** COMPLETE
- **Features:**
  - Storage statistics (items per store)
  - Export all data (JSON download)
  - Import data (JSON upload, replaces all)
  - Clear all data (double confirmation)
  - Information about IndexedDB storage
- **Data Sources:** idb.exportAllData(), idb.importAllData(), idb.clearAllData(), idb.getStorageStats()

### ⚠️ Partially Implemented / Scaffolded

#### USDA API Integration
- **File:** [src/lib/usdaApi.ts](src/lib/usdaApi.ts:1)
- **Status:** SCAFFOLDED
- **Issue:** Uses `DEMO_KEY` (line 11), which has severe rate limits
- **Next Steps:** User must sign up at https://api.data.gov/signup/ and replace with real API key
- **Used By:** Foods.tsx for nutrition lookup

#### Legacy Herbs & Foods Component
- **File:** [src/components/HerbsAndFoods.tsx](src/components/HerbsAndFoods.tsx:1)
- **Status:** FUNCTIONAL but LEGACY
- **Issue:** Combined view superseded by separate Herbs/Foods tabs in App.tsx
- **Action:** Currently not linked in navigation (lines 40-90 in App.tsx show separate tabs)
- **Recommendation:** Can be safely removed after confirming no data dependencies

### 🔴 Missing / Not Implemented

1. **vite.config.ts**
   - Expected but not found in directory scan
   - Vite may be using default config
   - May cause issues with path aliases or build optimization

2. **React Query Usage**
   - Package installed but not used anywhere
   - All data fetching is direct async/await
   - Can be removed from dependencies or integrated for better caching

3. **Zustand Usage**
   - Package installed but not used anywhere
   - All state is local component state
   - Can be removed from dependencies or used for global state (e.g., user preferences)

4. **Form Validation**
   - react-hook-form and zod installed but not used
   - All forms use basic HTML validation
   - Can be integrated for better validation UX

5. **Guidelines**
   - [src/guidelines/Guidelines.md](src/guidelines/Guidelines.md:1) is empty template
   - No project-specific AI guidelines defined

---

## Open Issues & Drift

### ✅ RESOLVED - Data Model Inconsistencies

1. **~~Dual Data Stores for Herbs/Foods~~** ✅ FIXED
   - ~~Legacy store: `herbsFoods` (combined)~~
   - ~~New stores: `herbs` and `foods` (separate)~~
   - **Resolution:** DB v5 removed herbsFoods store completely
   - **Status:** Dashboard.tsx now uses getHerbs() + getFoods()
   - **Status:** All components updated to use separate stores
   - **Status:** HerbFood type removed from codebase
   - **Status:** Migration logic cleaned up

2. **~~Journal vs Routine Tracking~~** ✅ CLARIFIED
   - **Resolution:** Clear separation of responsibilities:
     - **DailyRoutine.tsx:** Protocol tracker (what/when you take supplements/foods)
     - **DailyJournal.tsx:** Wellness reflection (how you felt that day)
   - **Status:** DailyJournal no longer has herb/food badge selection
   - **Status:** Lysine calculator in DailyJournal now pulls from DailyRoutine logs
   - **Status:** Zero overlap between the two components

3. **Supplier Data Normalization**
   - Suppliers exist as separate entities in STORES.SUPPLIERS
   - BUT herbs/foods also have inline `supplier` string field
   - **Impact:** Renaming a supplier requires utility function (renameSupplierGlobally)
   - **Recommendation:** Use supplier ID references instead of names for data integrity (future enhancement)

### Package Dependencies

4. **Unused Dependencies**
   - `@tanstack/react-query` (v5.90.12) - Not imported anywhere
   - `zustand` (v5.0.9) - Not imported anywhere (React Context used for auth instead)
   - `react-hook-form` (v7.55.0) - Not imported anywhere
   - `zod` (v4.2.1) - Not imported anywhere
   - **Impact:** Bloated bundle size, confusion for new developers
   - **Recommendation:** Remove or integrate these libraries

5. **~~Missing Config Files~~** ✅ FIXED
   - ~~`vite.config.ts` expected but not found~~
   - ~~`tsconfig.json` expected but not found~~
   - **Resolution:** Both files now exist with proper configuration
   - **Status:** vite.config.ts includes PWA plugin for offline support
   - **Status:** tsconfig.json includes strict mode and path aliases

### Cloud Sync & Environment

6. **Supabase Configuration**
   - ✅ Supabase client configured with environment variables
   - ✅ .env.local file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
   - ⚠️ **Security:** .env.local gitignored but contains real production keys
   - ⚠️ **Next Step:** Actual cloud sync implementation (data sync logic not yet built)
   - **Note:** Authentication UI complete, but no auto-sync of IndexedDB ↔ Supabase yet

7. **USDA API Integration**
   - [src/lib/usdaApi.ts](src/lib/usdaApi.ts:11) uses `DEMO_KEY`
   - **Impact:** Severely rate-limited (1000 req/hour but shared across all users)
   - **Recommendation:** Add USDA API key to .env.local, prompt user to get their own key

### Code Quality

8. **Large Component Files**
   - Herbs.tsx: 1486 lines
   - Foods.tsx: 1094 lines
   - **Impact:** Difficult to maintain, review, test
   - **Recommendation:** Extract reusable subcomponents:
     - ItemTable component (shared by Herbs/Foods)
     - BulkEditPanel component
     - PurchaseHistoryCard component

9. **Alert Usage**
   - Heavy use of `alert()` and `confirm()` for user feedback
   - Examples:
     - DailyJournal.tsx: `alert('Entry saved successfully!')`
     - Suppliers.tsx for delete confirmations
   - **Impact:** Poor UX, not consistent with modern UI
   - **Recommendation:** Replace with toast notifications (sonner is installed)

### Documentation Drift

10. **README vs Implementation**
    - [README.md](README.md:1) lists "Herbs & Foods" as single feature
    - Actual implementation has separate Herbs, Foods, and Suppliers tabs
    - README.md doesn't mention:
      - Outbreak Tracker feature
      - Supplier management
      - Daily Routine (vs Daily Journal distinction)
      - Authentication layer
      - Cloud sync infrastructure
    - **Recommendation:** Update README.md to match current feature set

11. **~~Missing TypeScript Config~~** ✅ FIXED
    - ~~No `tsconfig.json` visible in directory scan~~
    - **Resolution:** tsconfig.json created with strict mode and path aliases
    - **Status:** TypeScript configuration now explicit and documented

---

## Recommended Next Steps

### High Priority (Critical for Cloud Sync)

1. **Implement Cloud Sync Logic** ⭐ NEW
   - Build sync engine to mirror IndexedDB ↔ Supabase
   - Handle conflict resolution (last-write-wins or user prompt)
   - Add sync status indicators (syncing/synced/failed)
   - Implement background sync when user is authenticated
   - Consider using Supabase realtime subscriptions for multi-device sync
   - Files to create: [src/lib/sync.ts](src/lib/sync.ts:1)

2. **~~Consolidate Data Model~~** ✅ COMPLETE
   - ~~Fully migrate away from legacy `herbsFoods` store~~
   - ~~Update Dashboard.tsx to use getHerbs() + getFoods()~~
   - **Status:** All components updated, HerbFood type removed, DB v5 clean

3. **~~Create vite.config.ts~~** ✅ COMPLETE
   - ~~Add path aliases (@/components, @/lib)~~
   - ~~Configure build optimization~~
   - **Status:** vite.config.ts created with PWA plugin

4. **Environment Variable Management**
   - Move USDA API key to .env.local
   - Add .env.example template file for developers
   - Add setup instructions to README.md
   - File: [src/lib/usdaApi.ts](src/lib/usdaApi.ts:11)

5. **Remove or Integrate Unused Dependencies**
   - Decision needed: Use or remove react-query, zustand, react-hook-form, zod
   - If removing: `npm uninstall @tanstack/react-query zustand react-hook-form zod`
   - If integrating: Create migration plan
   - Note: Zustand not needed (React Context working well for auth)

6. **Update Documentation**
   - Sync README.md with current feature set
   - Document authentication/cloud sync setup
   - Document Herbs vs Foods separation
   - Document Daily Journal vs Daily Routine use cases
   - Add USDA API key setup instructions
   - Add Supabase setup instructions

### Medium Priority (Code Quality)

7. **Refactor Large Components**
   - Extract shared table logic from Herbs.tsx and Foods.tsx
   - Create reusable BulkEditPanel component
   - Create reusable PurchaseHistory component
   - Estimated effort: 2-3 days

8. **Replace alert() with Toast Notifications**
   - Integrate sonner (already installed)
   - Replace all alert() and confirm() calls
   - Create useToast() hook wrapper
   - Estimated effort: 1 day

9. **~~Add TypeScript Config~~** ✅ COMPLETE
   - ~~Create tsconfig.json with strict settings~~
   - ~~Enable strict mode, noImplicitAny, strictNullChecks~~
   - **Status:** tsconfig.json created with strict mode and path aliases

10. **Normalize Supplier References**
    - Change herbs.supplier and foods.supplier to be IDs instead of names
    - Update all components to resolve supplier names on display
    - Add foreign key constraint utilities
    - Estimated effort: 2-3 days

11. **~~Remove Legacy HerbsAndFoods Component~~** ✅ COMPLETE
    - ~~Confirm no data dependencies~~
    - ~~Archive file for reference~~
    - **Status:** Renamed to _HerbsAndFoods.legacy.tsx, not in use

### Low Priority (Nice to Have)

12. **Integrate React Hook Form + Zod**
    - Replace manual form validation with libraries already installed
    - Start with one form (e.g., Add Herb) as proof of concept
    - Roll out to other forms
    - Auth.tsx already has good validation, could be model

13. **Add E2E Tests**
    - No test files found in directory scan
    - Set up Playwright or Cypress
    - Cover critical flows (add herb, track daily routine, outbreak correlation, auth)

14. **Add Loading States**
    - Most components lack loading indicators
    - Add skeleton loaders during data fetch
    - Improve perceived performance
    - Auth components already have loading states as example

15. **Mobile Responsiveness Audit**
    - Test all 10 tabs on mobile viewport
    - Herbs/Foods tables may not be mobile-friendly
    - Consider mobile-specific layouts
    - Auth modal is responsive, other components may need work

16. **Accessibility Audit**
    - Add ARIA labels to interactive elements
    - Test keyboard navigation
    - Test with screen reader
    - Ensure color contrast meets WCAG AA

17. **Supabase Database Setup**
    - Create Supabase tables matching TypeScript types in src/types/supabase.ts
    - Set up Row Level Security (RLS) policies for user data isolation
    - Create indexes for performance
    - Set up triggers for updated_at timestamps

---

## Data Flow Diagram (ASCII)

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Browser                             │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                      App.tsx                                │ │
│  │  - autoMigrate() on mount                                   │ │
│  │  - Tab navigation state                                     │ │
│  └──────────────┬───────────────────────────────────────────── ┘ │
│                 │                                                 │
│        ┌────────┴────────┬────────────┬────────────┬            │
│        │                 │            │            │             │
│   ┌────▼────┐      ┌────▼────┐  ┌───▼───┐   ┌───▼───┐         │
│   │Dashboard│      │  Herbs  │  │ Foods │   │ Daily │          │
│   │         │      │         │  │       │   │Routine│   ...    │
│   └────┬────┘      └────┬────┘  └───┬───┘   └───┬───┘          │
│        │                │           │           │                │
│        │   useEffect(() => loadData())          │                │
│        │                │           │           │                │
│        └────────────────┴───────────┴───────────┘                │
│                         │                                         │
│                    ┌────▼─────┐                                  │
│                    │storage.ts│                                  │
│                    │  (CRUD)  │                                  │
│                    └────┬─────┘                                  │
│                         │                                         │
│                  ┌──────▼───────┐                                │
│                  │ indexedDB.ts │                                │
│                  │  (Wrapper)   │                                │
│                  └──────┬───────┘                                │
│                         │                                         │
│           ┌─────────────▼────────────────┐                       │
│           │   IndexedDB (Browser API)     │                      │
│           │   HealingTrackerDB v4         │                      │
│           │                               │                       │
│           │  ┌─────────────────────────┐ │                       │
│           │  │ herbsFoods (legacy)     │ │                       │
│           │  │ herbs                   │ │                       │
│           │  │ foods                   │ │                       │
│           │  │ suppliers               │ │                       │
│           │  │ journalEntries          │ │                       │
│           │  │ dailyRoutines           │ │                       │
│           │  │ outbreaks               │ │                       │
│           │  │ testingReminders        │ │                       │
│           │  │ herbInventory           │ │                       │
│           │  └─────────────────────────┘ │                       │
│           └─────────────────────────────┘                        │
│                                                                   │
│  External Integration:                                           │
│  ┌──────────────────────┐                                        │
│  │   USDA FoodData API  │ ◄──── Foods.tsx (optional search)     │
│  │   (DEMO_KEY)         │                                        │
│  └──────────────────────┘                                        │
└───────────────────────────────────────────────────────────────────┘
```

---

## Summary

### What Works Well
✅ **Local-first architecture** - Full offline capability, works without sign in
✅ **Optional cloud sync** - Authentication layer ready, Supabase configured
✅ **PWA support** - Offline-capable with service worker, installable
✅ **Clean data model** - Legacy stores removed, separate herbs/foods with clear types
✅ **Comprehensive tracking** - Goes beyond original MVP, lots of features
✅ **IndexedDB migration** - Smooth upgrade path from localStorage
✅ **shadcn/ui integration** - Consistent, polished UI components
✅ **Type safety** - TypeScript throughout with strict mode
✅ **Outbreak correlation** - Unique feature for health tracking apps
✅ **Supplier management** - Professional inventory system
✅ **Component separation** - DailyRoutine vs DailyJournal have clear responsibilities
✅ **Authentication UI** - Sign in/up/forgot password with good UX

### What Needs Attention
⚠️ **Cloud sync logic** - Auth complete but no IndexedDB ↔ Supabase sync yet
⚠️ **Supabase database** - Tables need to be created in Supabase dashboard
⚠️ **Unused dependencies** - react-query, zustand, react-hook-form, zod not used
⚠️ **Large component files** - 1000+ line components hard to maintain
⚠️ **Documentation outdated** - README doesn't mention auth/cloud sync/new features
⚠️ **USDA API key** - Using demo key with severe rate limits
⚠️ **alert() usage** - Old-school alerts instead of modern toasts
⚠️ **No tests** - Zero test files found

### Recent Changes (2026-06-27)
✅ **Dashboard redesigned** - Date greeting, daily routine banner, 2-column clickable stat grid, clickable journal header
✅ **Dashboard navigation** - `onNavigate` prop wired from App.tsx; each card navigates to relevant tab
✅ **Timezone bug fixed** - All YYYY-MM-DD strings now parsed as `new Date(str + 'T00:00:00')` (local midnight) across Dashboard, ConsistencyTracker, DailyRoutine, TestingTracker, OutbreakTracker, Herbs, Foods
✅ **Dashboard herbs/foods split** - Separate herbs and foods counts shown instead of combined total

### Previous Changes (2026-05-21)
✅ **Data model consolidated** - HerbFood type removed, all components use separate stores
✅ **Component responsibilities clarified** - DailyRoutine (protocol) vs DailyJournal (wellness)
✅ **Legacy cleanup complete** - migration.ts simplified, _HerbsAndFoods.legacy.tsx archived
✅ **CSV template enhanced** - Guidance row + examples for herb imports
✅ **Config files added** - vite.config.ts, tsconfig.json, tsconfig.node.json
✅ **Supabase integration** - Client configured, types generated, auth helpers created
✅ **Authentication layer** - Full sign in/up UI, AuthProvider, SyncStatus component
✅ **Environment variables** - .env.local with Supabase keys (gitignored)

### Development Priorities
1. **Implement cloud sync logic** - Build IndexedDB ↔ Supabase bidirectional sync
2. **Set up Supabase database** - Create tables with RLS policies
3. **Replace USDA DEMO_KEY** - Move to .env.local
4. **Update documentation** - README needs auth/cloud sync instructions
5. **Refactor large component files** - Extract shared subcomponents

---

**Last Updated:** 2026-05-21
**Maintained By:** Claude Code
**Repository:** https://github.com/Banayah/healing-tracker (inferred from git remote)
