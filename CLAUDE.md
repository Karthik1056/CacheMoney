# CLAUDE.md — Complete Technical Reference Manual: Expense Manager (CacheMoney)

> **Dual-Purpose Operational & Codebase Specification**  
> **Target Audience:** Claude Code, AI agents, developers, and system architects.  
> **Application:** Expense Manager (CacheMoney) — Production Personal Finance & Expense Management Web App.  
> **Stack:** Next.js 14 (App Router, Server Actions, Server Components) · React 18 · TypeScript 5 · Prisma ORM 5.22 · PostgreSQL (Prisma Accelerate / Neon / PgBouncer) · Tailwind CSS 3.4 · Radix UI / shadcn/ui · Recharts 3.10 · Lucide Icons · Zod 3 / React Hook Form 7.

---

## TABLE OF CONTENTS
1. [Claude Code Workflow, Operational Conventions & Development Guide](#1-claude-code-workflow-operational-conventions--development-guide)
   - [1.1 Project Overview & Architecture](#11-project-overview--architecture)
   - [1.2 Environment Setup & Configuration Variables](#12-environment-setup--configuration-variables)
   - [1.3 Core Development Commands & Scripts](#13-core-development-commands--scripts)
   - [1.4 Engineering Conventions, Architecture Rules & Invariants](#14-engineering-conventions-architecture-rules--invariants)
   - [1.5 Complete Repository Directory Layout](#15-complete-repository-directory-layout)
2. [Database Schema & Data Models Specification (Prisma / PostgreSQL)](#2-database-schema--data-models-specification-prisma--postgresql)
   - [2.1 Database Engines, Accelerate & Connection Pooling](#21-database-engines-accelerate--connection-pooling)
   - [2.2 Enums Reference](#22-enums-reference)
   - [2.3 Complete Entity Models & Schema Definitions](#23-complete-entity-models--schema-definitions)
   - [2.4 Referential Integrity & Foreign Key Cascade Rules](#24-referential-integrity--foreign-key-cascade-rules)
   - [2.5 Indexing Strategy & Performance Indexes](#25-indexing-strategy--performance-indexes)
3. [Server Actions & Backend API Routes Catalog](#3-server-actions--backend-api-routes-catalog)
   - [3.1 Transactions (`src/app/actions/transactions.ts`)](#31-transactions-srcappactionstransactionsts)
   - [3.2 Prepaid Amortized Expenses (`src/app/actions/amortized-expenses.ts`)](#32-prepaid-amortized-expenses-srcappactionsamortized-expensests)
   - [3.3 Bills & Utility Reminders (`src/app/actions/bills.ts`)](#33-bills--utility-reminders-srcappactionsbillsts)
   - [3.4 Monthly Budget & Savings Goals (`src/app/actions/budget-goals.ts`)](#34-monthly-budget--savings-goals-srcappactionsbudget-goalsts)
   - [3.5 Master Data Management (`src/app/actions/manage.ts`)](#35-master-data-management-srcappactionsmanagets)
   - [3.6 In-App Notifications (`src/app/actions/notifications.ts`)](#36-in-app-notifications-srcappactionsnotificationsts)
   - [3.7 WhatsApp Alerts & Reminders (`src/app/actions/whatsapp-reminders.ts`)](#37-whatsapp-alerts--reminders-srcappactionswhatsapp-remindersts)
   - [3.8 Entries Data & Filtering (`src/app/actions/entries.ts`)](#38-entries-data--filtering-srcappactionsentriests)
   - [3.9 Expenses & Calendar Analytics (`src/app/actions/expenses.ts`)](#39-expenses--calendar-analytics-srcappactionsexpensests)
   - [3.10 Overview Metrics & Trends (`src/app/actions/overview.ts`)](#310-overview-metrics--trends-srcappactionsoverviewts)
   - [3.11 Financial Reports & Distributions (`src/app/actions/reports.ts`)](#311-financial-reports--distributions-srcappactionsreportsts)
   - [3.12 Savings Ledger Metrics (`src/app/actions/savings.ts`)](#312-savings-ledger-metrics-srcappactionssavingsts)
   - [3.13 Reminders Feed (`src/app/actions/reminders.ts`)](#313-reminders-feed-srcappactionsremindersts)
   - [3.14 API Routes (`/api/upload` & `/api/reminders/whatsapp-cron`)](#314-api-routes-apiupload--apireminderswhatsapp-cron)
4. [Internal Utility Modules & Infrastructure](#4-internal-utility-modules--infrastructure)
   - [4.1 Singleton Prisma Client (`src/lib/prisma.ts`)](#41-singleton-prisma-client-srclibprismats)
   - [4.2 WhatsApp Client & Gateway (`src/lib/whatsapp-notifier.ts`)](#42-whatsapp-client--gateway-srclibwhatsapp-notifierts)
   - [4.3 Icon Map & Registry (`src/lib/icon-map.ts`)](#43-icon-map--registry-srclibicon-mapts)
   - [4.4 Relative Time Formatter (`src/lib/time-ago.ts`)](#44-relative-time-formatter-srclibtime-agots)
   - [4.5 Tailwind Class Merging (`src/lib/utils.ts`)](#45-tailwind-class-merging-srclibutilsts)
5. [Exhaustive UI Form Fields, Validation Schemas & State Handling Matrices](#5-exhaustive-ui-form-fields-validation-schemas--state-handling-matrices)
   - [5.1 Add Transaction Sheet (`AddTransactionDialog`)](#51-add-transaction-sheet-addtransactiondialog)
   - [5.2 Edit Transaction Sheet (`EditTransactionDialog`)](#52-edit-transaction-sheet-edittransactiondialog)
   - [5.3 Quick-Add Deterministic Parser Form (`createQuickAddTransaction`)](#53-quick-add-deterministic-parser-form-createquickaddtransaction)
   - [5.4 Add Utility Bill Sheet (`BillsScreen` -> Add Bill)](#54-add-utility-bill-sheet-billsscreen---add-bill)
   - [5.5 Pay Bill Confirmation Sheet (`BillsScreen` -> Pay Bill)](#55-pay-bill-confirmation-sheet-billsscreen---pay-bill)
   - [5.6 Delete Bill Action (`BillsScreen` -> Delete Button)](#56-delete-bill-action-billsscreen---delete-button)
   - [5.7 Room Rent & PG Prepayment Sheet (`AddAmortizedRentDialog`)](#57-room-rent--pg-prepayment-sheet-addamortizedrentdialog)
   - [5.8 Add Savings Goal Sheet (`AddGoalDialog`)](#58-add-savings-goal-sheet-addgoaldialog)
   - [5.9 Edit Savings Goal Sheet (`EditGoalDialog`)](#59-edit-savings-goal-sheet-editgoaldialog)
   - [5.10 Delete Savings Goal Action (`DeleteGoalButton`)](#510-delete-savings-goal-action-deletegoalbutton)
   - [5.11 Add Reminder / Subscription Sheet (`AddSubscriptionDialog`)](#511-add-reminder--subscription-sheet-addsubscriptiondialog)
   - [5.12 Delete Subscription Action (`DeleteSubscriptionButton`)](#512-delete-subscription-action-deletesubscriptionbutton)
   - [5.13 Monthly Budget & Salary Target Dialog (`BudgetSalaryDialog`)](#513-monthly-budget--salary-target-dialog-budgetsalarydialog)
   - [5.14 Category-Specific Budget Limit Sheet (`UpsertCategoryBudgetDialog`)](#514-category-specific-budget-limit-sheet-upsertcategorybudgetdialog)
   - [5.15 Delete Category Budget Action (`DeleteBudgetButton`)](#515-delete-category-budget-action-deletebudgetbutton)
   - [5.16 Linked Account Creation Form (`SettingsWebPage` -> `AccountForm`)](#516-linked-account-creation-form-settingswebpage---accountform)
   - [5.17 Edit Linked Account Sheet (`SettingsWebPage` -> `EditAccountDialog`)](#517-edit-linked-account-sheet-settingswebpage---editaccountdialog)
   - [5.18 Delete Linked Account Action (`SettingsWebPage` -> Delete Button)](#518-delete-linked-account-action-settingswebpage---delete-button)
   - [5.19 Category Creation Form (`SettingsWebPage` -> `CategoryForm`)](#519-category-creation-form-settingswebpage---categoryform)
   - [5.20 Edit Category Sheet (`SettingsWebPage` -> `EditCategoryDialog`)](#520-edit-category-sheet-settingswebpage---editcategorydialog)
   - [5.21 Delete Category Action (`SettingsWebPage` -> Delete Button)](#521-delete-category-action-settingswebpage---delete-button)
   - [5.22 Automation Rule Creation Form (`SettingsWebPage` -> `RuleForm`)](#522-automation-rule-creation-form-settingswebpage---ruleform)
   - [5.23 Delete Automation Rule Action (`SettingsWebPage` -> Delete Button)](#523-delete-automation-rule-action-settingswebpage---delete-button)
   - [5.24 WhatsApp Bot Setup Modal (`WhatsAppSettingsCard`)](#524-whatsapp-bot-setup-modal-whatsappsettingscard)
   - [5.25 Entries Multi-Filter Drawer (`FilterDrawer`)](#525-entries-multi-filter-drawer-filterdrawer)
   - [5.26 Budget Billing Month & Category Filter Sheet (`BudgetFilterSheet`)](#526-budget-billing-month--category-filter-sheet-budgetfiltersheet)
   - [5.27 Reports & Analytics Multi-Dimension Filter Sheet (`SettingsReportsSection`)](#527-reports--analytics-multi-dimension-filter-sheet-settingsreportssection)
   - [5.28 Live Entries Search Bar (`SearchBar`)](#528-live-entries-search-bar-searchbar)
   - [5.29 Interactive Expenses Calendar Navigation (`ExpensesCalendar`)](#529-interactive-expenses-calendar-navigation-expensescalendar)
   - [5.30 Transaction Inspector Sheet & Delete Confirmation (`TransactionDetailDialog`)](#530-transaction-inspector-sheet--delete-confirmation-transactiondetaildialog)
   - [5.31 Bill Inspector Sheet (`BillsScreen` -> Detail Sheet)](#531-bill-inspector-sheet-billsscreen---detail-sheet)
   - [5.32 Notifications Management Controls (`NotificationsWebPage`)](#532-notifications-management-controls-notificationswebpage)
6. [Frontend UI Architecture, Navigation & Layout System](#6-frontend-ui-architecture-navigation--layout-system)
   - [6.1 Responsive Route Shell (`ResponsiveRouteShell`)](#61-responsive-route-shell-responsiverouteshell)
   - [6.2 Route Breakdown & Page Structure](#62-route-breakdown--page-structure)
   - [6.3 Theme Toggle & CSS Variables System](#63-theme-toggle--css-variables-system)
   - [6.4 Interactive Data Visualizations & Charts](#64-interactive-data-visualizations--charts)
7. [AI Engine Architecture, Deterministic Pipelines & Future Roadmap](#7-ai-engine-architecture-deterministic-pipelines--future-roadmap)
   - [7.1 Deterministic-First Natural Language Quick-Add Parser (AI-1)](#71-deterministic-first-natural-language-quick-add-parser-ai-1)
   - [7.2 Rules Engine & Auto-Categorization (AI-2)](#72-rules-engine--auto-categorization-ai-2)
   - [7.3 Multimodal Receipt OCR & Audio Parsing Pipeline (AI-3)](#73-multimodal-receipt-ocr--audio-parsing-pipeline-ai-3)
   - [7.4 Model Context Protocol (MCP) Server Endpoint (AI-4)](#74-model-context-protocol-mcp-server-endpoint-ai-4)
   - [7.5 Gamification & Financial Intelligence Modules (Future Roadmap)](#75-gamification--financial-intelligence-modules-future-roadmap)

---

## 1. Claude Code Workflow, Operational Conventions & Development Guide

### 1.1 Project Overview & Architecture
**Expense Manager (CacheMoney)** is an enterprise-grade personal finance management web application built with Next.js 14 App Router and Prisma ORM. It couples high-frequency double-entry transactional accounting with predictive budget telemetry, prepaid expense schedule tracking (e.g., room rent/PG amortizations), recurring bill alert lifecycles, and automated WhatsApp notification bot triggers.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Next.js 14 App Router                              │
│  (Overview · Budget · Reports · Expenses · Entries · Bills · Reminders · …) │
└───────────────────────┬─────────────────────────────┬───────────────────────┘
                        │ Server Actions              │ Next.js Route Handlers
                        ▼                             ▼
┌─────────────────────────────────────────┐  ┌────────────────────────────────┐
│        Server Action Layer              │  │  /api/upload (Receipts)        │
│  - Atomic balance mutation              │  │  /api/reminders/whatsapp-cron  │
│  - Amortization scheduler engine        │  └────────────────────────────────┘
│  - Bill settlement transactions         │
│  - Revalidation via revalidatePath()    │
└───────────────────────┬─────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     Prisma ORM (Singleton Client)                           │
│  - PrismaPg Driver Adapter with pg.Pool (Local / Direct)                   │
│  - Prisma Accelerate URL Support (Cloud / Serverless)                      │
└───────────────────────┬─────────────────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      PostgreSQL Relational Database                         │
│  - 3NF Normalized Schema (13 Models, 6 Enums)                               │
│  - Composite indexes on (date, categoryId, accountId, status)               │
│  - Referential constraints: Restrict (Account) & SetNull (Category)        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Environment Setup & Configuration Variables
Create a `.env` file in the project root based on `.env.example`:

| Environment Variable | Required | Description & Sample Value |
| :--- | :--- | :--- |
| `DATABASE_URL` | **Yes** | Connection string for PostgreSQL. Supports standard `postgres://` or pooled Prisma Accelerate `prisma+postgres://` / `prisma://`. |
| `DIRECT_URL` | Optional | Direct unpooled connection URL (required for migrations when using PgBouncer/Supabase). |
| `NEXT_PUBLIC_API_BASE` | **Yes** | Base application URL for client-side API requests (`http://localhost:3000`). |
| `API_SECRET_KEY` | Optional | Internal shared secret key for securing scheduled cron invocations. |
| `META_WHATSAPP_PHONE_NUMBER_ID` | Optional | Official Meta WhatsApp Cloud API Phone Number ID from Meta Business Suite. |
| `META_WHATSAPP_ACCESS_TOKEN` | Optional | Meta Permanent System User Access Token with `whatsapp_business_messaging` permissions. |
| `META_WHATSAPP_RECIPIENT_PHONE` | Optional | Default destination phone number in international format without `+` (e.g. `919876543210`). |
| `WHATSAPP_PHONE_NUMBER` | Optional | Fallback destination phone number for CallMeBot (e.g. `+919876543210`). |
| `CALLMEBOT_API_KEY` | Optional | Free API Key generated by sending activation message to CallMeBot WhatsApp bot. |

### 1.3 Core Development Commands & Scripts

> **PowerShell Execution Policy & Windows Nuances:**  
> 1. Windows default PowerShell execution policies frequently block executing unsigned `.ps1` files (such as `npx.ps1` or `npm.ps1`), yielding `PSSecurityException: UnauthorizedAccess`. To bypass this, always invoke commands via `.cmd` wrappers (`npx.cmd`, `npm.cmd`) or prefix shell commands with `powershell -ExecutionPolicy Bypass -Command "<command>"`.  
> 2. `tsconfig.json` includes `"ts-node": { "compilerOptions": { "module": "CommonJS" } }`, which permits `npm.cmd run prisma:seed` and `npx.cmd ts-node prisma/seed.ts` to execute cleanly without CLI quote-escaping syntax errors on Node 20+.  
> 3. Running `next dev` causes the local Node process to acquire an exclusive file lock on `node_modules/.prisma/client/query_engine-windows.dll.node`. If you need to run `prisma generate` or `prisma migrate`, stop the local dev server first to avoid `EBUSY: resource busy or locked` errors.

```bash
# 1. Install dependencies
npm.cmd install
# Or: powershell -ExecutionPolicy Bypass -Command "npm install"

# 2. Generate Prisma Client
npm.cmd run prisma:generate
# Or: npx.cmd prisma generate

# 3. Apply database migrations
npm.cmd run prisma:migrate
# Or: npx.cmd prisma migrate dev

# 4. Seed database with master accounts, categories, rules, and sample data
npm.cmd run prisma:seed
# Or: npx.cmd ts-node prisma/seed.ts

# 5. Start Next.js local development server (http://localhost:3000)
npm.cmd run dev

# 6. Run Next.js production build verification
npm.cmd run build
# Or: powershell -ExecutionPolicy Bypass -Command "npx.cmd next build"

# 7. Start production build server
npm.cmd run start
```

### 1.4 Engineering Conventions, Architecture Rules & Invariants

1. **Balance Mutation Rules & Double-Entry Accounting:**
   - **`createTransaction(data)`:** When `!data.isIncome`, the paying account's balance is **decremented** (`balance: { decrement: data.amount }`). When `data.isIncome` is true, the account balance is **incremented** (`balance: { increment: data.amount }`).
   - **`payBill(data)`:** Executes an atomic `prisma.$transaction`: marks `Bill.status = 'PAID'`, inserts an expense `Transaction` (`intent: 'NEED'`), decrements the paying `Account.balance` by bill amount, and creates an in-app `Notification`.
   - **`createAmortizedExpenseSchedule(data)`:** Immediately decrements the **entire lump sum** from `Account.balance` upfront. Subsequent daily runs of `checkAndPostAmortizedExpenses()` post daily transactions (`intent: 'NEED'`) **without** deducting the bank balance again.
   - **ARCHITECTURAL NUANCES TO NOTE:**
     - `createQuickAddTransaction()` deterministic regex creates a `Transaction` (`status: CONFIRMED`, `intent: WANT`), but **does NOT** mutate `Account.balance`.
     - `updateTransaction()` updates transaction entity fields (`description`, `amount`, `date`, `categoryId`, `fromAccountId`, `intent`, `notes`, `attachments`) but **does NOT** adjust `Account.balance` for amount deltas or re-assign balances across accounts.
     - `deleteTransaction()` always executes balance reversion: if `!category?.isIncome`, increments account balance; if `isIncome`, decrements account balance. (Therefore, deleting an entry originally created via `createQuickAddTransaction` will increment the balance even though it was not decremented on creation).
     - `EditTransactionDialog` does not expose an `isIncome` toggle. The income vs. expense status of a transaction is immutable after initial creation.

2. **Monetary Precision & Decimal Handling:**
   - All amounts in PostgreSQL are stored with `@db.Decimal(12, 2)`.
   - In TypeScript Server Actions, always cast Prisma `Decimal` instances to JavaScript numbers (`Number(val)`) before returning across Server Action boundaries to Client Components to avoid Next.js serialization runtime errors.

3. **Route Revalidation:**
   - Every mutation in a Server Action calls `revalidatePath()` for all affected pages (`/overview`, `/entries`, `/expenses`, `/bills`, `/savings`, `/settings`, `/notifications`).

### 1.5 Complete Repository Directory Layout
```
D:\CacheMoney
├── .env                              # Active local runtime environment variables
├── .env.example                      # Production template for environment configuration
├── .gitignore                        # Git ignore file (excludes build artifacts and credentials)
├── components.json                   # shadcn/ui configuration metadata
├── next.config.mjs                   # Next.js compiler and bundle settings
├── next-env.d.ts                     # Next.js TypeScript ambient type definitions
├── package.json                      # Node dependencies and project scripts
├── postcss.config.js                 # PostCSS plugin definitions
├── tailwind.config.js                # Tailwind CSS styling and theme tokens
├── tsconfig.json                     # TypeScript compiler configuration (includes ts-node module config)
├── EXECUTION_PHASES_DB_AI.md         # Phased architecture roadmap for DB & AI modules
├── FIGMA_UI_SPEC.md                  # Mobile UI kit screen fidelity specifications
├── future.md                         # Future AI bots, telegram, and gamification proposals
├── prisma/
│   ├── schema.prisma                 # 3NF relational Prisma schema (13 models, 6 enums)
│   ├── seed.ts                       # Database seeding script for master accounts & categories
│   └── migrations/                   # SQL migration history log
├── public/
│   └── uploads/
│       └── receipts/                 # Local disk storage for receipt photos and PDF invoices
├── scripts/
│   ├── seed-categories.ts            # Standalone category seeder script
│   └── wipe-data.ts                  # Database reset script for staging test suites
└── src/
    ├── app/
    │   ├── globals.css               # Global theme styling, dark background gradients, fonts
    │   ├── layout.tsx                # Root layout with ReactQueryProvider & viewport config
    │   ├── page.tsx                  # App entry root (redirects directly to /overview)
    │   ├── actions/                  # Next.js Server Actions (mutations and DB queries)
    │   │   ├── amortized-expenses.ts # Room rent and prepaid expense amortization schedules
    │   │   ├── bills.ts              # Bill CRUD, overdue checks, and atomic payment execution
    │   │   ├── budget-goals.ts       # Monthly budget, salary target, and savings goals
    │   │   ├── entries.ts            # Paginated transaction feed and multi-attribute filters
    │   │   ├── expenses.ts           # Monthly spending breakdowns and analytics queries
    │   │   ├── manage.ts             # Master data (Accounts, Categories, Rules CRUD)
    │   │   ├── notifications.ts      # Activity feed and automatic due bill notifications
    │   │   ├── overview.ts           # Executive dashboard metrics and cashflow trends
    │   │   ├── reminders.ts          # Subscription reminders retrieval
    │   │   ├── reports.ts            # Financial chart aggregations across 4 dimensions
    │   │   ├── savings.ts            # Liquid asset totals and wishlist target progress
    │   │   ├── transactions.ts       # Core transaction CRUD and deterministic quick-add
    │   │   └── whatsapp-reminders.ts # Tomorrow-reminder scanner and WhatsApp bot dispatcher
    │   ├── api/
    │   │   ├── reminders/whatsapp-cron/route.ts # Cron endpoint to trigger WhatsApp alerts
    │   │   └── upload/route.ts       # Multipart/form-data upload handler for receipts/PDFs
    │   ├── bills/page.tsx            # /bills page
    │   ├── budget/page.tsx           # /budget page
    │   ├── entries/page.tsx          # /entries page
    │   ├── expenses/page.tsx         # /expenses page
    │   ├── notifications/page.tsx    # /notifications page
    │   ├── overview/page.tsx         # /overview page
    │   ├── reminders/page.tsx        # /reminders page
    │   ├── reports/page.tsx          # /reports page
    │   ├── savings/page.tsx          # /savings page
    │   └── settings/page.tsx         # /settings page
    ├── components/
    │   ├── responsive-route-shell.tsx# Master desktop/mobile navigation layout wrapper
    │   ├── web-screens.tsx           # Primary web screens and UI panel compositions
    │   ├── bills-screen.tsx          # Bills & utilities management interface
    │   ├── settings-page.tsx         # Accounts, categories, and rule settings view
    │   ├── settings-reports.tsx      # Multi-dimensional reports and charts interface
    │   ├── add-transaction-dialog.tsx# Add transaction drawer with drag-drop receipt upload
    │   ├── edit-transaction-dialog.tsx# Edit transaction drawer
    │   ├── add-amortized-rent-dialog.tsx# Room rent & PG prepayment scheduler drawer
    │   ├── manage-data-dialogs.tsx   # Budget, Goal, and Reminder modal sheets & delete buttons
    │   ├── budget-filter-sheet.tsx   # Filter sheet for budget view
    │   ├── filter-drawer.tsx         # Multi-criteria filter drawer for entries page
    │   ├── transaction-detail-dialog.tsx # Detailed inspector drawer for transactions
    │   ├── whatsapp-settings-card.tsx# WhatsApp Meta & CallMeBot configuration modal
    │   ├── calendar.tsx              # Monthly calendar view with transaction markers
    │   ├── search-bar.tsx            # Debounced client search bar
    │   ├── theme-toggle.tsx          # Dark / light theme toggle switch
    │   ├── overview-line-chart.tsx   # Interactive cashflow trend line chart
    │   ├── overview-radial-chart.tsx # Radial bar balance snapshot chart
    │   ├── analytics-charts.tsx      # Bar and pie analytics charts for expenses
    │   ├── types.ts                  # Shared component TypeScript interfaces
    │   ├── providers/
    │   │   └── react-query-provider.tsx # TanStack React Query client provider
    │   └── ui/                       # Full shadcn/ui accessible primitive components
    │       ├── alert.tsx             # Callout alert banner component
    │       ├── badge.tsx             # Status badge component
    │       ├── button.tsx            # Accessible button with CVA variants
    │       ├── calendar.tsx          # React DayPicker calendar wrapper
    │       ├── card.tsx              # Card, CardHeader, CardTitle, CardContent
    │       ├── chart.tsx             # Recharts container and tooltip formatting
    │       ├── date-picker.tsx       # Popover date picker input
    │       ├── dialog.tsx            # Radix modal dialog primitive
    │       ├── dropdown-menu.tsx     # Radix dropdown menu primitive
    │       ├── form.tsx              # React Hook Form form control wrapper
    │       ├── input.tsx             # Text, number, and file input primitive
    │       ├── label.tsx             # Form label primitive
    │       ├── popover.tsx           # Floating popover primitive
    │       ├── scroll-area.tsx       # Custom scrollable area primitive
    │       ├── select.tsx            # Radix select dropdown primitive
    │       ├── separator.tsx         # Visual horizontal / vertical separator
    │       ├── sheet.tsx             # Side & bottom drawer sliding sheet primitive
    │       ├── switch.tsx            # Boolean toggle switch primitive
    │       ├── table.tsx             # Data table header, body, row, and cell
    │       ├── tabs.tsx              # Radix tabs switcher primitive
    │       └── time-picker.tsx       # Time selection input component
    └── lib/
        ├── prisma.ts                 # Singleton PrismaClient with PostgreSQL driver adapter
        ├── whatsapp-notifier.ts      # Meta Cloud API & CallMeBot delivery client
        ├── icon-map.ts               # Lucide icon dictionary mapping & AVAILABLE_ICONS
        ├── time-ago.ts               # Date-fns relative timestamp formatter
        └── utils.ts                  # Tailwind class merge utility (cn)
```

---

## 2. Database Schema & Data Models Specification (Prisma / PostgreSQL)

### 2.1 Database Engines, Accelerate & Connection Pooling
The application uses Prisma Client 5.22 configured with driver adapters:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}
```

### 2.2 Enums Reference

| Enum Name | Values | Business Domain & Purpose |
| :--- | :--- | :--- |
| `AccountType` | `ASSET`, `LIABILITY`, `INCOME`, `EXPENSE` | Classifies accounts (ASSET: Checking, Savings, Cash; LIABILITY: Credit Card, Loan). |
| `TransactionStatus` | `UNREVIEWED`, `CONFIRMED`, `FLAGGED` | Status of transaction verification (OCR / n8n imports default to UNREVIEWED). |
| `SpendingIntent` | `NEED`, `WANT`, `INVESTMENT` | Budgeting intent classification adhering to 50/30/20 personal finance framework. |
| `BillingCycle` | `ONE_TIME`, `DAILY`, `WEEKLY`, `MONTHLY`, `QUARTERLY`, `YEARLY` | Repeat interval for recurring reminders and subscriptions. |
| `WishlistStatus` | `WAITING`, `PURCHASED`, `PASSED` | Cooling-off lock state for impulse wishlist items. |
| `BillStatus` | `DUE`, `PAID`, `OVERDUE` | Payment lifecycle state for utilities and recurring bills. |

### 2.3 Complete Entity Models & Schema Definitions

#### 1. Account (`model Account`)
Stores financial accounts (bank accounts, wallets, credit cards).
```prisma
model Account {
  id               String            @id @default(cuid())
  name             String            @unique
  type             AccountType       @default(ASSET)
  currency         String            @default("USD")
  balance          Decimal           @default(0.0) @db.Decimal(12, 2)
  color            String?
  logoUrl          String?
  deletedAt        DateTime?
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt

  fromTransactions   Transaction[]       @relation("FromAccount")
  toTransactions     Transaction[]       @relation("ToAccount")
  amortizedSchedules AmortizedSchedule[] @relation("AmortizedFromAccount")

  @@index([deletedAt])
}
```

#### 2. Category (`model Category`)
Spending and income categories with icons and color themes.
```prisma
model Category {
  id        String    @id @default(cuid())
  name      String    @unique
  icon      String?   // Lucide icon identifier (e.g. "Utensils", "Home")
  imageUrl  String?
  color     String?   // Hex code (e.g. "#EF4444")
  isIncome  Boolean   @default(false)
  deletedAt DateTime?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  transactions       Transaction[]
  budgets            Budget[]
  rules              Rule[]
  bills              Bill[]
  amortizedSchedules AmortizedSchedule[]

  @@index([deletedAt])
}
```

*Special Dynamic Categories created by the system:*
- `"Overall"`: Fallback category used when quick-add cannot match a category name, and initial seed budget default.
- `"Overall Salary"`: Auto-created with `isIncome: true` when `salaryTarget` is upserted.
- `"Overall Expense Budget"`: Auto-created with `isIncome: false` when `overallExpenseLimit` is upserted.
- Categories containing `"Rent"`: Auto-selected by `createAmortizedExpenseSchedule`.

#### 3. Tag (`model Tag`)
Cross-cutting labels for transactions (e.g., `#vacation`, `#work`).
```prisma
model Tag {
  id           String        @id @default(cuid())
  name         String        @unique
  transactions Transaction[] @relation("TransactionTags")
}
```

#### 4. Transaction (`model Transaction`)
The central double-entry financial ledger record.
```prisma
model Transaction {
  id            String            @id @default(cuid())
  amount        Decimal           @db.Decimal(12, 2)
  description   String
  rawInput      String?           // Original text or voice transcript
  date          DateTime          @default(now())
  status        TransactionStatus @default(CONFIRMED)
  intent        SpendingIntent    @default(WANT)
  notes         String?
  mood          String?           // e.g. "#stressed", "#impulsive", "#happy"
  isRecurring   Boolean           @default(false)
  deletedAt     DateTime?

  categoryId    String?
  category      Category?         @relation(fields: [categoryId], references: [id], onDelete: SetNull)

  fromAccountId String
  fromAccount   Account           @relation("FromAccount", fields: [fromAccountId], references: [id], onDelete: Restrict)

  toAccountId   String?
  toAccount     Account?          @relation("ToAccount", fields: [toAccountId], references: [id], onDelete: Restrict)

  tags          Tag[]             @relation("TransactionTags")
  attachments   Attachment[]

  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt

  @@index([date(sort: Desc)])
  @@index([categoryId, date])
  @@index([fromAccountId, date])
  @@index([toAccountId, date])
  @@index([status])
  @@index([deletedAt])
}
```

#### 5. Attachment (`model Attachment`)
Receipt photos, PDF invoices, and parsed OCR data linked to transactions.
```prisma
model Attachment {
  id            String       @id @default(cuid())
  filename      String
  fileUrl       String
  mimeType      String       // image/jpeg, image/png, application/pdf
  size          Int          // Size in bytes
  ocrText       String?
  ocrJson       Json?

  transactionId String?
  transaction   Transaction? @relation(fields: [transactionId], references: [id], onDelete: Cascade)

  createdAt     DateTime     @default(now())

  @@index([transactionId])
}
```

#### 6. Subscription (`model Subscription`)
Recurring subscription and reminder calendar records.
```prisma
model Subscription {
  id           String       @id @default(cuid())
  name         String
  category     String?      @default("General")
  amount       Decimal      @default(0.0) @db.Decimal(12, 2)
  cycle        BillingCycle @default(MONTHLY)
  nextBilling  DateTime
  notes        String?
  trialEnds    DateTime?
  logoUrl      String?
  active       Boolean      @default(true)
  deletedAt    DateTime?
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  @@index([active, nextBilling])
  @@index([deletedAt])
}
```

#### 7. WishlistItem (`model WishlistItem`)
Cooling-off impulse purchase vault.
```prisma
model WishlistItem {
  id           String         @id @default(cuid())
  title        String
  amount       Decimal        @db.Decimal(12, 2)
  imageUrl     String?
  itemUrl      String?
  coolingUntil DateTime       // Countdown release date
  status       WishlistStatus @default(WAITING)
  deletedAt    DateTime?
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt

  @@index([coolingUntil])
  @@index([deletedAt])
}
```

#### 8. Budget (`model Budget`)
Monthly allocated budget limits per category (or overall).
```prisma
model Budget {
  id         String   @id @default(cuid())
  month      String   // Format: YYYY-MM
  amount     Decimal  @db.Decimal(12, 2)
  categoryId String
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  rollover   Boolean  @default(false)

  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([month, categoryId])
  @@index([month])
}
```

#### 9. Rule (`model Rule`)
Deterministic keyword-based auto-categorization rules.
```prisma
model Rule {
  id          String   @id @default(cuid())
  keyword     String
  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  autoConfirm Boolean  @default(false)
  priority    Int      @default(0)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([priority(sort: Desc), keyword])
}
```

#### 10. ApiKey (`model ApiKey`)
Automation API keys (for n8n, webhooks, or external bots).
```prisma
model ApiKey {
  id        String    @id @default(cuid())
  key       String    @unique
  name      String
  lastUsed  DateTime?
  createdAt DateTime  @default(now())
}
```

#### 11. Notification (`model Notification`)
In-app activity feed and automated due date notifications.
```prisma
model Notification {
  id        String   @id @default(cuid())
  type      String   // "transaction" | "budget_alert" | "subscription_due" | "reminder_alert"
  title     String
  subtitle  String
  icon      String   // Lucide icon identifier
  read      Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([read, createdAt(sort: Desc)])
}
```

#### 12. Bill (`model Bill`)
Utility and recurring vendor bills with receipt attachment support.
```prisma
model Bill {
  id          String     @id @default(cuid())
  title       String
  billerName  String?
  amount      Decimal    @db.Decimal(12, 2)
  dueDate     DateTime
  status      BillStatus @default(DUE)
  categoryId  String?
  category    Category?  @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  notes       String?
  receiptUrl  String?
  paidAt      DateTime?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@index([status, dueDate])
}
```

#### 13. AmortizedSchedule (`model AmortizedSchedule`)
Schedules for prepaid lump sums amortized smoothly across a date range.
```prisma
model AmortizedSchedule {
  id             String    @id @default(cuid())
  title          String    // e.g. "Room Rent / PG Fee"
  totalAmount    Decimal   @db.Decimal(12, 2)
  dailyAmount    Decimal   @db.Decimal(12, 2)
  remainingAsset Decimal   @db.Decimal(12, 2)
  startDate      DateTime
  endDate        DateTime
  lastPostedDate DateTime?
  fromAccountId  String?
  fromAccount    Account?  @relation("AmortizedFromAccount", fields: [fromAccountId], references: [id], onDelete: SetNull)
  categoryId     String?
  category       Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  active         Boolean   @default(true)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  @@index([active, startDate, endDate])
}
```

### 2.4 Referential Integrity & Foreign Key Cascade Rules
- `onDelete: Restrict` on `Account` relations (`fromAccount`, `toAccount`): Prevents accidental deletion of accounts that have active transaction ledger history.
- `onDelete: SetNull` on `Category` relations: Allows deleting or merging categories without destroying associated transactions or bills.
- `onDelete: Cascade` on `Attachment` and `Budget`: Automatically cleans up receipt attachments when a parent transaction is deleted, and cleans up budgets when a category is deleted.

### 2.5 Indexing Strategy & Performance Indexes
- `Transaction`: `@@index([date(sort: Desc)])` accelerates feeds; `@@index([categoryId, date])` and `@@index([fromAccountId, date])` optimize monthly category/account aggregations; `@@index([status])` speeds up human review queries.
- `Subscription`: `@@index([active, nextBilling])` supports rapid scan by the daily WhatsApp reminder job.
- `Bill`: `@@index([status, dueDate])` enables instant overdue status resolution and due-date alerts.
- `AmortizedSchedule`: `@@index([active, startDate, endDate])` accelerates daily posting scans.

---

## 3. Server Actions & Backend API Routes Catalog

### 3.1 Transactions (`src/app/actions/transactions.ts`)

#### `getTransactions()`
- **Signature:** `async function getTransactions(): Promise<Array<TransactionWithRelations>>`
- **Logic:** Queries the latest 20 non-deleted transactions, sorted by `date desc`, including `category`, `fromAccount`, `toAccount`, and `tags`.
- **Return:** Array of transactions with Decimal amounts converted to JavaScript numbers.

#### `createQuickAddTransaction(rawInput: string)`
- **Signature:** `async function createQuickAddTransaction(rawInput: string): Promise<{ success: boolean; transactionId?: string; error?: string }>`
- **Logic:** Deterministic regex parsing of strings like `"Swiggy 450 from Checking #food #happy"`. Extracts `#tags`, `#mood`, `from <Account>`, numeric amount, and description. Matches category by name substring or falls back to `"Overall"`.
- **Ledger Behavior:** Creates transaction record with `status: CONFIRMED` and `intent: WANT`. **Does NOT decrement account balance.**
- **Revalidates:** `/entries`, `/overview`, `/expenses`.

#### `createTransaction(data)`
- **Signature:**
  ```typescript
  async function createTransaction(data: {
    description: string;
    amount: number;
    date: string;
    categoryId?: string;
    fromAccountId: string;
    intent?: 'NEED' | 'WANT' | 'INVESTMENT';
    notes?: string;
    imageUrl?: string;
    isIncome?: boolean;
  }): Promise<{ success: boolean; transactionId?: string; error?: string }>
  ```
- **Logic:**
  1. Inserts `Transaction` with status `CONFIRMED`.
  2. If `imageUrl` is provided, creates an `Attachment` linked to the transaction.
  3. Updates `Account` balance: decrements if expense (`!data.isIncome`), increments if income.
  4. Generates an in-app `Notification`.
- **Revalidates:** `/entries`, `/overview`, `/expenses`, `/savings`.

#### `updateTransaction(id, data)`
- **Signature:**
  ```typescript
  async function updateTransaction(
    id: string,
    data: {
      description?: string;
      amount?: number;
      date?: string;
      categoryId?: string;
      fromAccountId?: string;
      intent?: 'NEED' | 'WANT' | 'INVESTMENT';
      notes?: string;
      imageUrl?: string;
    }
  ): Promise<{ success: boolean; error?: string }>
  ```
- **Logic:** Updates transaction record fields. If `imageUrl` changed, deletes old attachments and creates a new `Attachment` record.
- **Ledger Behavior:** Does NOT alter account balance on edit.
- **Revalidates:** `/entries`, `/overview`, `/expenses`, `/savings`.

#### `deleteTransaction(id: string)`
- **Signature:** `async function deleteTransaction(id: string): Promise<{ success: boolean; error?: string }>`
- **Logic:** Reverses the account balance adjustment:
  - If expense (`!isIncome`): `balance: { increment: amount }`.
  - If income: `balance: { decrement: amount }`.
  Sets `deletedAt = new Date()`.
- **Revalidates:** `/entries`, `/overview`, `/expenses`, `/bills`.

---

### 3.2 Prepaid Amortized Expenses (`src/app/actions/amortized-expenses.ts`)

#### `createAmortizedExpenseSchedule(data)`
- **Signature:**
  ```typescript
  async function createAmortizedExpenseSchedule(data: {
    title: string;
    totalAmount: number;
    startDate: string; // YYYY-MM-DD
    endDate: string;   // YYYY-MM-DD
    fromAccountId: string;
    categoryId?: string;
  }): Promise<{ success: boolean; scheduleId?: string; dailyAmount?: number; daysCount?: number; error?: string }>
  ```
- **Business Logic:**
  1. Computes total coverage duration: `daysCount = Math.max(Math.ceil((end - start) / 86400000) + 1, 1)`.
  2. Computes daily allocation: `dailyAmount = Math.round((total / daysCount) * 100) / 100`.
  3. Deducts total lump sum from `Account.balance` immediately to prevent account balance inflation.
  4. Creates `AmortizedSchedule` record with `remainingAsset = totalAmount`.
  5. Triggers `checkAndPostAmortizedExpenses()` to catch up entries to current date.
- **Revalidates:** `/overview`, `/expenses`, `/savings`, `/settings`.

#### `checkAndPostAmortizedExpenses()`
- **Signature:** `async function checkAndPostAmortizedExpenses(): Promise<{ success: boolean; postedCount: number; error?: string }>`
- **Logic:** Queries active schedules where `startDate <= now`. Iterates from `lastPostedDate + 1 day` through `today`. For each missing day, generates a `Transaction` titled `${schedule.title} (Daily Amortized)` with `intent: 'NEED'` **without** deducting the bank balance again. Updates `remainingAsset` and sets `active = false` once fully amortized.

#### `getAmortizedSchedules()`
- **Signature:** `async function getAmortizedSchedules(): Promise<Array<AmortizedScheduleView>>`
- **Logic:** Runs `checkAndPostAmortizedExpenses()`, then returns all schedules sorted by `createdAt desc`.

---

### 3.3 Bills & Utility Reminders (`src/app/actions/bills.ts`)

#### `getBillsData()`
- **Signature:** `async function getBillsData(): Promise<{ bills, totalDue, totalPaid, overdueCount, categories, accounts }>`
- **Logic:** Queries all bills ordered by `dueDate asc`. Dynamically marks bills with `dueDate < now && status !== 'PAID'` as `OVERDUE`. Aggregates total due, total paid, and overdue counts.

#### `createBill(data)`
- **Signature:**
  ```typescript
  async function createBill(data: {
    title: string;
    billerName?: string;
    amount: number;
    dueDate: string;
    categoryId?: string;
    notes?: string;
    receiptUrl?: string;
  }): Promise<{ success: boolean; billId?: string; error?: string }>
  ```
- **Logic:** Creates `Bill` with status `DUE`. Dispatches an in-app `Notification`.
- **Revalidates:** `/bills`, `/overview`, `/notifications`.

#### `payBill(data)`
- **Signature:** `async function payBill(data: { billId: string; accountId: string }): Promise<{ success: boolean; error?: string }>`
- **Logic:** Executes atomic `prisma.$transaction`:
  1. Updates `Bill.status = 'PAID'` and sets `paidAt = new Date()`.
  2. Creates expense `Transaction` with description `Bill Payment: <title>`, category, and `intent = 'NEED'`.
  3. Decrements `Account.balance` by bill amount.
  4. Creates confirmation `Notification`.
- **Revalidates:** `/bills`, `/expenses`, `/overview`, `/entries`.

#### `deleteBill(id: string)`
- **Signature:** `async function deleteBill(id: string): Promise<{ success: boolean; error?: string }>`
- **Logic:** Deletes bill record.
- **Revalidates:** `/bills`, `/overview`.

---

### 3.4 Monthly Budget & Savings Goals (`src/app/actions/budget-goals.ts`)

- `createGoal({ title, targetAmount, coolingDays })`: Creates a `WishlistItem` with `coolingUntil = now + coolingDays` and status `WAITING`.
- `updateGoal({ id, title, targetAmount, status })`: Modifies title, amount, or status (`WAITING`, `PURCHASED`, `PASSED`).
- `deleteGoal(id)`: Soft-deletes `WishlistItem` (`deletedAt = new Date()`).
- `createSubscription({ name, category, amount, cycle, nextBilling, notes })`: Inserts recurring `Subscription`.
- `deleteSubscription(id)`: Soft-deletes `Subscription` (`active = false`, `deletedAt = new Date()`).
- `upsertMonthlySalaryAndOverallBudget({ salaryTarget, overallExpenseLimit, month })`: Upserts master `Budget` records under special categories `"Overall Salary"` (isIncome: true) and `"Overall Expense Budget"` (isIncome: false) for target `YYYY-MM`.
- `upsertBudget({ categoryId, amount, month })`: Upserts category-specific budget limits for target `YYYY-MM`.
- `getBudgetsForMonth(month)`: Returns all budget records for the specified month.
- `deleteBudget(id)`: Deletes category budget allocation.

---

### 3.5 Master Data Management (`src/app/actions/manage.ts`)

- `getAccounts()`, `createAccount(data)`, `updateAccount(id, data)`, `deleteAccount(id)`: Manages asset and liability accounts. Soft-deletes using `deletedAt`.
- `getCategories()`, `createCategory(data)`, `updateCategory(id, data)`, `deleteCategory(id)`: Manages categories. Automatically seeds 13 default categories (`PREDEFINED_CATEGORIES`) if table is empty.
- `getRules()`, `createRule(data)`, `updateRule(id, data)`, `deleteRule(id)`: Manages auto-categorization keyword rules.

---

### 3.6 In-App Notifications (`src/app/actions/notifications.ts`)

- `getNotifications()`: Automatically scans for bills and subscriptions due within 24 hours (or overdue), auto-generates missing notification entries, and returns notifications from the last 7 days.
- `getUnreadCount()`: Returns total unread notifications created in the last 7 days.
- `markNotificationRead(id)`: Sets `read = true`.
- `markAllRead()`: Marks all unread notifications as read.
- `deleteNotification(id)`: Deletes notification record.
- `createNotification({ type, title, subtitle, icon })`: Utility helper to insert notification.

---

### 3.7 WhatsApp Alerts & Reminders (`src/app/actions/whatsapp-reminders.ts`)

- `checkAndSendTomorrowReminders(phone?, apiKey?)`: Scans active `Subscription` records due tomorrow (`now + 1 day`). Formats message alert with title, amount, frequency, and notes. Dispatches via `sendWhatsAppNotification()`.
- `sendTestWhatsAppAlert(phone, apiKey)`: Sends immediate test handshake message to verify credentials.

---

### 3.8 Entries Data & Filtering (`src/app/actions/entries.ts`)

- `getEntries(params)`: Supports full-text search on description, category filtering, account filtering, status filtering (`CONFIRMED`, `UNREVIEWED`, `FLAGGED`), date range presets (`week`, `month`, `year`, custom `startDate` / `endDate`), and server-side pagination (`skip`, `take`, default limit: 20).
- `getFilterOptions()`: Returns available categories and accounts for filter menus.

---

### 3.9 Expenses & Calendar Analytics (`src/app/actions/expenses.ts`)

- `getExpensesData(month?, selectedDateStr?)`: Fetches non-income transactions and budgets for the month. Computes `transactionDates` (dates with transactions for calendar dot markers), `totalSpent`, `totalBudget`, `spentPercentage`, and per-category percentage breakdown for gauge chart.
- `getAnalyticsData(year?, month?, selectedDateStr?)`: Aggregates 12-month Income vs Expense bar chart data and year-to-date category distribution pie chart data.

---

### 3.10 Overview Metrics & Trends (`src/app/actions/overview.ts`)

- `getOverviewData(month?)`: Consolidated parallel query fetching accounts, income/expense aggregations, month-over-month percentage change (`momChange`), dynamic net balance (`rawAccountBalance - totalExpense`), 30-day daily trend timeline (`dailyTrends`), latest 5 transactions, savings goals, reminders, and top 5 category budget meters.

---

### 3.11 Financial Reports & Distributions (`src/app/actions/reports.ts`)

- `getReportsData(params)`: Aggregates financial data across 4 dimensions: Category Spending Chart (`categoryCharts`), Payment Account Expense Share (`accountCharts`), Bills Paid vs Due Breakdown (`billsCharts`), and Reminders Volume by Cycle (`reminderCharts`).

---

### 3.12 Savings Ledger Metrics (`src/app/actions/savings.ts`)

- `getSavingsData()`: Parallel query calculating `totalSavings` (sum of all ASSET account balances), current month overall budget cap vs spent, and wishlist savings goals with cooling countdowns.

---

### 3.13 Reminders Feed (`src/app/actions/reminders.ts`)

- `getReminders()`: Returns all active non-deleted subscriptions sorted by `nextBilling asc`.

---

### 3.14 API Routes (`/api/upload` & `/api/reminders/whatsapp-cron`)

#### `POST /api/upload` (`src/app/api/upload/route.ts`)
- **Payload:** `multipart/form-data` with `file`.
- **Validation:** Allowed types: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`, `image/heic`, `application/pdf`. Max size: 10MB (`10 * 1024 * 1024`).
- **Disk Storage:** Saves to `public/uploads/receipts/receipt_<timestamp>_<rand>.<ext>`.
- **Response:** `{ url: "/uploads/receipts/receipt_....jpg", filename: "..." }`.

#### `GET` & `POST /api/reminders/whatsapp-cron` (`src/app/api/reminders/whatsapp-cron/route.ts`)
- **Execution:** Calls `checkAndSendTomorrowReminders()`.
- **Response:** `{ success: true, count: number, totalDue: number, message: string }`.

---

## 4. Internal Utility Modules & Infrastructure

### 4.1 Singleton Prisma Client (`src/lib/prisma.ts`)
Maintains a singleton Prisma instance preventing database connection exhaustion during Next.js Hot Module Reloading (HMR). Detects connection strings:
- If starts with `prisma://` or `prisma+postgres://`, connects via **Prisma Accelerate**.
- If standard `postgres://`, initializes a `pg.Pool` (max 10 connections, 30s idle timeout) wrapped in `PrismaPg(pool)` driver adapter.

### 4.2 WhatsApp Client & Gateway (`src/lib/whatsapp-notifier.ts`)
Dual-engine notification delivery architecture:
1. **Primary: Official Meta WhatsApp Cloud API (v19.0)**
   - Endpoint: `https://graph.facebook.com/v19.0/${phoneId}/messages`
   - Authorization: Bearer token header.
   - Cleans recipient phone string (removes `+` and spaces).
2. **Fallback: CallMeBot API Gateway**
   - Endpoint: `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${text}&apikey=${apiKey}`
   - GET request delivery with encoded text.

*Wiring Details with Client:*
When testing from `WhatsAppSettingsCard`, `sendTestWhatsAppAlert` accepts `(phone, apiKey)`. If Meta API is chosen in the UI modal, the client passes `metaRecipient` as `phone` and `metaToken` as `apiKey`, omitting `metaPhoneId`. `sendWhatsAppNotification` checks `process.env.META_WHATSAPP_PHONE_NUMBER_ID` and `process.env.META_WHATSAPP_ACCESS_TOKEN`. Therefore, Meta Cloud API requires credentials in `.env`, otherwise it falls back to CallMeBot.

### 4.3 Icon Map & Registry (`src/lib/icon-map.ts`)
Exports `getIcon(name?: string | null): LucideIcon`. Maps 20 Lucide icon symbols (`Activity`, `Bell`, `Bike`, `Briefcase`, `Car`, `CircleDollarSign`, `Coffee`, `CreditCard`, `FileText`, `Film`, `House`, `PieChart`, `Repeat`, `ShoppingBag`, `ShoppingCart`, `TrendingUp`, `UtensilsCrossed`, `Wallet`, `Zap`). Defaults safely to `CircleDollarSign`. Also exports `AVAILABLE_ICONS`.

### 4.4 Relative Time Formatter (`src/lib/time-ago.ts`)
Wraps `date-fns/formatDistanceToNow`. If elapsed time is less than 10 seconds, returns `"Just now"`; otherwise returns relative string with suffix (e.g. `"2 hours ago"`).

### 4.5 Tailwind Class Merging (`src/lib/utils.ts`)
Exports `cn(...inputs: ClassValue[])` combining `clsx` logic with `twMerge` to eliminate Tailwind class collision.

---

## 5. Exhaustive UI Form Fields, Validation Schemas & State Handling Matrices

### 5.1 Add Transaction Sheet (`AddTransactionDialog`)
- **Component File:** `src/components/add-transaction-dialog.tsx`
- **Trigger:** Desktop header "+ Add Entry" button / Mobile Center Floating FAB (+)
- **Form Engine:** `react-hook-form` with `@hookform/resolvers/zod`
- **Schema (`formSchema`):**
  ```typescript
  const formSchema = z.object({
    description: z.string().min(1, 'Description is required'),
    amount: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, {
      message: 'Amount must be a positive number',
    }),
    date: z.string().min(1, 'Date is required'),
    fromAccountId: z.string().min(1, 'Please select an account'),
    categoryId: z.string().optional(),
    intent: z.enum(['NEED', 'WANT', 'INVESTMENT']),
    notes: z.string().optional(),
    isIncome: z.boolean(),
  });
  ```

| Field Name | Input Component | Type | Default Value | Validation & Rules | Error Feedback |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `isIncome` | Segmented Button Group | `boolean` | `false` | Required boolean switch (Expense vs Income/Salary) | None |
| `description` | `<Input>` with FileText icon | `string` | `""` | `min(1)` non-empty string | "Description is required" |
| `amount` | `<Input type="number">` with Rupee icon | `string` | `""` | Positive float > 0 | "Amount must be a positive number" |
| `date` | `<DatePicker>` Popover | `string` | Today (`YYYY-MM-DD`) | `min(1)` valid date string | "Date is required" |
| `fromAccountId` | `<Select>` Dropdown | `string` | `accounts[0]?.id` | `min(1)` selection required | "Please select an account" |
| `categoryId` | `<Select>` Dropdown | `string` | `""` | Optional (filtered by `isIncome`) | None |
| `intent` | `<Select>` Dropdown | `enum` | `'WANT'` | Visible only when `!isIncome` (`NEED`, `WANT`, `INVESTMENT`) | None |
| `notes` | `<Input>` | `string` | `""` | Optional additional notes | None |
| Receipt Upload | Hidden `<input type="file">` | File | `null` | Drag-and-drop or click; JPG, PNG, WEBP, PDF up to 10MB | "File too large" / "Invalid file type" |

- **State Handling:**
  - `isUploading`: Uploads receipt to `/api/upload`, shows `<Loader2>` spinner overlay on preview.
  - `formState.isSubmitting`: Disables submit button and renders "Saving Transaction...".
  - `success`: Renders `<CheckCircle2>` green success card with animation.
  - `serverError`: Renders alert banner with server error message.
- **Submission Action:** Calls `createTransaction()`. On success, calls `router.refresh()`, resets form, and dismisses sheet.

---

### 5.2 Edit Transaction Sheet (`EditTransactionDialog`)
- **Component File:** `src/components/edit-transaction-dialog.tsx`
- **Trigger:** Transaction row edit pencil icon / Transaction Inspector drawer
- **Form Engine:** `react-hook-form` + `zod`
- **Schema (`formSchema`):**
  ```typescript
  const formSchema = z.object({
    description: z.string().min(1, 'Description is required'),
    amount: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, { message: 'Amount must be positive' }),
    date: z.string().min(1, 'Date is required'),
    fromAccountId: z.string().min(1, 'Select an account'),
    categoryId: z.string().optional(),
    intent: z.enum(['NEED', 'WANT', 'INVESTMENT']),
    notes: z.string().optional(),
  });
  ```
- **Important Note:** Does NOT permit toggling `isIncome`. The income/expense status is fixed once created.
- **Submission Action:** Calls `updateTransaction(transaction.id, data)`. Does not adjust account balances.

---

### 5.3 Quick-Add Deterministic Parser Form (`createQuickAddTransaction`)
- **Engine File:** `src/app/actions/transactions.ts` (`createQuickAddTransaction`)
- **Syntax:** `<Category/Desc> <Amount> [from <Account>] [#tag] [#mood]`
- **Pattern Matching:**
  - Tags: `/#(\w+)/g`
  - Account: `/from\s+([A-Za-z0-9\s]+)/i`
  - Amount: `/(\d+(?:\.\d{1,2})?)/`
  - Moods: `#stressed`, `#impulsive`, `#happy`, `#bored`
- **Ledger Behavior:** Inserts transaction into DB (`status: CONFIRMED`), falls back to `"Overall"` category if unmatched, but **does NOT decrement account balance**.

---

### 5.4 Add Utility Bill Sheet (`BillsScreen` -> Add Bill)
- **Component File:** `src/components/bills-screen.tsx`
- **Trigger:** "+ Add Bill" button on `/bills`
- **Form Engine:** `react-hook-form` + `zod`
- **Schema (`billSchema`):**
  ```typescript
  const billSchema = z.object({
    title: z.string().min(1, 'Bill title is required'),
    amount: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, { message: 'Amount must be positive' }),
    dueDate: z.string().min(1, 'Due date is required'),
    categoryId: z.string().optional(),
    notes: z.string().optional(),
  });
  ```

| Field Name | Component | Type | Validation & Rules |
| :--- | :--- | :--- | :--- |
| `title` | `<Input>` | `string` | `min(1)` non-empty string |
| `amount` | `<Input type="number">` with Rupee icon | `string` | Float > 0 |
| `dueDate` | `<DatePicker>` Popover | `string` | Date string (`YYYY-MM-DD`) |
| `categoryId` | `<Select>` Dropdown | `string` | Optional category selection |
| `notes` | `<Input>` | `string` | Optional notes |
| Receipt Upload | Hidden `<input type="file">` | File | Uploaded to `/api/upload` |

*Note: While backend schema supports `billerName`, the UI form omits it and uses `title`.*
- **Submission Action:** Calls `createBill()`.

---

### 5.5 Pay Bill Confirmation Sheet (`BillsScreen` -> Pay Bill)
- **Component File:** `src/components/bills-screen.tsx`
- **Trigger:** "Pay Bill" button on unpaid bill row
- **Fields:** Account selector dropdown showing account name and current balance.
- **Execution:** Calls `payBill({ billId, accountId })`. Executes atomic ledger deduction, marks bill PAID, logs expense transaction (`intent: NEED`), and notifies user.

---

### 5.6 Delete Bill Action (`BillsScreen` -> Delete Button)
- **Component File:** `src/components/bills-screen.tsx`
- **Trigger:** Trash icon button on bill row
- **State Handling:** `deletingId` tracks active deletion spinner.
- **Submission Action:** Calls `deleteBill(id)` and refreshes page.

---

### 5.7 Room Rent & PG Prepayment Sheet (`AddAmortizedRentDialog`)
- **Component File:** `src/components/add-amortized-rent-dialog.tsx`
- **Trigger:** "+ Add Room Rent / PG Lump Sum" button
- **Fields & Live Calculations:**

| Field Name | Type | Default Value | Description / Live Computation |
| :--- | :--- | :--- | :--- |
| `title` | `string` | `"Room Rent / PG Fee"` | Amortization schedule title |
| `totalAmount` | `number` | `"6800"` | Total prepaid amount deducted from bank |
| `fromAccountId` | `<Select>` | Primary Account ID | Account from which lump sum is deducted |
| `categoryId` | `<Select>` | Rent Category ID | Category for auto-posted daily expenses |
| `startDate` | `<DatePicker>` | `""` | Coverage period start date |
| `endDate` | `<DatePicker>` | `""` | Coverage period end date |
| *Live Summary Box* | Read-only | Computed | Shows: Duration in days (`daysCount`), bank outflow (`totalAmount`), and daily auto-posted rate (`₹calculatedDaily / day`). |

- **Submission Action:** Calls `createAmortizedExpenseSchedule()`.

---

### 5.8 Add Savings Goal Sheet (`AddGoalDialog`)
- **Component File:** `src/components/manage-data-dialogs.tsx`
- **Trigger:** "+ Add Savings Goal" on `/savings`
- **Schema (`goalSchema`):**
  ```typescript
  const goalSchema = z.object({
    title: z.string().min(1, 'Goal title is required'),
    targetAmount: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, { message: 'Target amount must be a positive number' }),
    coolingDays: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 0, { message: 'Must be 0 or more days' }),
  });
  ```
- **Submission Action:** Calls `createGoal({ title, targetAmount, coolingDays })`. Sets `status = 'WAITING'` and computes `coolingUntil`.

---

### 5.9 Edit Savings Goal Sheet (`EditGoalDialog`)
- **Component File:** `src/components/manage-data-dialogs.tsx`
- **Trigger:** Pencil edit icon on savings goal card
- **Fields:** `title` (text), `targetAmount` (number), `status` dropdown (`WAITING` | `PURCHASED` | `PASSED`).
- **Submission Action:** Calls `updateGoal({ id, title, targetAmount, status })`.

---

### 5.10 Delete Savings Goal Action (`DeleteGoalButton`)
- **Component File:** `src/components/manage-data-dialogs.tsx`
- **Trigger:** Trash icon button on savings goal card
- **Submission Action:** Calls `deleteGoal(id)` (soft-delete with `deletedAt: new Date()`).

---

### 5.11 Add Reminder / Subscription Sheet (`AddSubscriptionDialog`)
- **Component File:** `src/components/manage-data-dialogs.tsx`
- **Trigger:** "+ Add Reminder" on `/reminders`
- **Schema (`subscriptionSchema`):**
  ```typescript
  const subscriptionSchema = z.object({
    name: z.string().min(1, 'Reminder name is required'),
    category: z.string().optional(),
    amount: z.string().optional(),
    cycle: z.enum(['ONE_TIME', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']),
    nextBilling: z.string().min(1, 'Reminder date is required'),
    reminderTime: z.string().optional(),
    notes: z.string().optional(),
  });
  ```
- **Dynamic Field Presets:**
  - `DAILY`: Hides date picker and shows `<TimePicker>` for daily alert time.
  - `WEEKLY`: Auto-presets date to next upcoming Monday.
  - `MONTHLY` / `QUARTERLY`: Auto-presets date to 1st of next month.
  - `YEARLY`: Auto-presets date to Jan 1st of next year.
- **Submission Action:** Calls `createSubscription()`.

---

### 5.12 Delete Subscription Action (`DeleteSubscriptionButton`)
- **Component File:** `src/components/manage-data-dialogs.tsx`
- **Trigger:** Trash icon button on subscription card
- **Submission Action:** Calls `deleteSubscription(id)` (`active = false`, `deletedAt: new Date()`).

---

### 5.13 Monthly Budget & Salary Target Dialog (`BudgetSalaryDialog`)
- **Component File:** `src/components/manage-data-dialogs.tsx`
- **Trigger:** "Configure Targets" / "Set Budget & Salary" button
- **Controls & Subforms:**
  1. **Master Target Form:**
     - Month Picker (`selectedMonth`: `YYYY-MM`).
     - `salaryTarget`: Expected monthly salary income.
     - `overallLimit`: Total monthly expense cap.
     - "Save Overall Targets" button: calls `upsertMonthlySalaryAndOverallBudget()`.
  2. **Inline Category Limit Rows (`CategoryBudgetRow`):**
     - Lists all non-income categories.
     - Number input (`min="0"`, `step="100"`).
     - "Set" button: calls `upsertBudget({ month, categoryId, amount })`.
     - "Delete" button: calls `deleteBudget(id)`.

---

### 5.14 Category-Specific Budget Limit Sheet (`UpsertCategoryBudgetDialog`)
- **Component File:** `src/components/manage-data-dialogs.tsx`
- **Trigger:** "+ Add Category Limit" / Edit button on `/budget`
- **Fields:** Category selection dropdown (disabled when editing existing limit), numeric budget limit (₹).
- **Submission Action:** Calls `upsertBudget()`.

---

### 5.15 Delete Category Budget Action (`DeleteBudgetButton`)
- **Component File:** `src/components/manage-data-dialogs.tsx`
- **Trigger:** Trash icon button on category budget row on `/budget`
- **Submission Action:** Calls `deleteBudget(id)`.

---

### 5.16 Linked Account Creation Form (`SettingsWebPage` -> `AccountForm`)
- **Component File:** `src/components/settings-page.tsx`
- **Fields:** Account Name (`required`), Account Type (`ASSET` | `LIABILITY`), Initial Balance (`number`, step `0.01`).
- **Submission Action:** Calls `createAccount()`.

---

### 5.17 Edit Linked Account Sheet (`SettingsWebPage` -> `EditAccountDialog`)
- **Component File:** `src/components/settings-page.tsx`
- **Fields:** Pre-populated Account Name, Account Type, Current Balance.
- **Submission Action:** Calls `updateAccount()`.

---

### 5.18 Delete Linked Account Action (`SettingsWebPage` -> Delete Button)
- **Component File:** `src/components/settings-page.tsx`
- **Submission Action:** Calls `deleteAccount(id)` (soft-deletes using `deletedAt`).

---

### 5.19 Category Creation Form (`SettingsWebPage` -> `CategoryForm`)
- **Component File:** `src/components/settings-page.tsx`
- **Fields:**
  - `name`: Category Title (`required`).
  - `icon`: Icon picker selecting from 20 Lucide icon symbols.
  - `color`: HTML5 native color picker + 12 quick-preset color swatches.
  - `isIncome`: Switch toggle between Income and Expense category.
- **Submission Action:** Calls `createCategory()`.

---

### 5.20 Edit Category Sheet (`SettingsWebPage` -> `EditCategoryDialog`)
- **Component File:** `src/components/settings-page.tsx`
- **Fields:** Pre-populated name, icon picker, hex color input, and income toggle switch.
- **Submission Action:** Calls `updateCategory()`.

---

### 5.21 Delete Category Action (`SettingsWebPage` -> Delete Button)
- **Component File:** `src/components/settings-page.tsx`
- **Submission Action:** Calls `deleteCategory(id)` (soft-deletes using `deletedAt`).

---

### 5.22 Automation Rule Creation Form (`SettingsWebPage` -> `RuleForm`)
- **Component File:** `src/components/settings-page.tsx`
- **Fields:**
  - `keyword`: Keyword substring to match (e.g. `"uber"`, `"starbucks"`).
  - `categoryId`: Target category selection dropdown.
  - `autoConfirm`: Switch toggle for automatic transaction confirmation.
- **Submission Action:** Calls `createRule()`.

---

### 5.23 Delete Automation Rule Action (`SettingsWebPage` -> Delete Button)
- **Component File:** `src/components/settings-page.tsx`
- **Submission Action:** Calls `deleteRule(id)` (permanent delete from `Rule` table).

---

### 5.24 WhatsApp Bot Setup Modal (`WhatsAppSettingsCard`)
- **Component File:** `src/components/whatsapp-settings-card.tsx`
- **Trigger:** "WhatsApp Bot Settings" button on `/reminders`
- **Tab 1: Meta Cloud API (Official)**
  - `metaPhoneId`: Phone Number ID from Meta Business Suite.
  - `metaToken`: Permanent System User Access Token.
  - `metaRecipient`: Target recipient phone number (country code without `+`).
- **Tab 2: CallMeBot Gateway**
  - `phone`: Destination phone number with `+`.
  - `apiKey`: CallMeBot API key.
- **Actions:**
  - "Test Meta API" / "Test CallMeBot": Sends live test WhatsApp message via `sendTestWhatsAppAlert()`.
  - "Check Tomorrow": Executes dry-run scan for reminders due tomorrow via `checkAndSendTomorrowReminders()`.

---

### 5.25 Entries Multi-Filter Drawer (`FilterDrawer`)
- **Component File:** `src/components/filter-drawer.tsx`
- **Trigger:** "Filter" button on `/entries`
- **Filter Controls:**
  - Quick period presets: `All Time`, `Current Week`, `Current Month`, `Current Year`.
  - Custom calendar range: From Date & To Date Popovers with `<Calendar>`.
  - Category dropdown filter.
  - Payment account dropdown filter.
  - Status dropdown filter (`All`, `Confirmed`, `Unreviewed`, `Flagged`).
  - "Reset" button: Clears all filters back to default.
- **Submission Action:** Appends query parameters to URL and pushes router to `/entries?category=...&range=...&page=1`.

---

### 5.26 Budget Billing Month & Category Filter Sheet (`BudgetFilterSheet`)
- **Component File:** `src/components/budget-filter-sheet.tsx`
- **Trigger:** "Filters" button on `/budget`
- **Controls:** Billing month calendar popover (`format(date, 'yyyy-MM')`), category dropdown, and "Reset" button.
- **Submission Action:** Pushes router to `/budget?month=YYYY-MM&category=...`.

---

### 5.27 Reports & Analytics Multi-Dimension Filter Sheet (`SettingsReportsSection`)
- **Component File:** `src/components/settings-reports.tsx`
- **Controls:** Period presets (`day`, `week`, `month`, `year`, `custom`), custom date range popovers, category filter, account filter, "Reset Filters" action, and Chart Type switcher (Bar, Pie, Line, Area).
- **Execution:** Calls `getReportsData(params)` dynamically and re-renders Recharts visualizations.

---

### 5.28 Live Entries Search Bar (`SearchBar`)
- **Component File:** `src/components/search-bar.tsx`
- **Location:** Header on `/entries`
- **Functionality:** Controlled input with 300ms debounce. Typing updates `search` query parameter and resets `page=1`. Clicking clear `(X)` button wipes query immediately.

---

### 5.29 Interactive Expenses Calendar Navigation (`ExpensesCalendar`)
- **Component File:** `src/components/calendar.tsx`
- **Location:** Left panel on `/expenses`
- **Functionality:** Displays monthly grid via React DayPicker. Renders blue dot indicators on dates with recorded transactions (`transactionDates`). Clicking a date pushes `/expenses?date=YYYY-MM-DD`. Clicking previous/next month chevrons pushes `/expenses?month=YYYY-MM`.

---

### 5.30 Transaction Inspector Sheet & Delete Confirmation (`TransactionDetailDialog`)
- **Component File:** `src/components/transaction-detail-dialog.tsx`
- **Trigger:** Clicking any transaction row
- **Contents:**
  - Full-width hero amount badge (`+` or `-`).
  - Date & time, payment account, category, spending intent, notes.
  - Receipt photo thumbnail with link to full photo lightbox.
  - "Edit Entry" button (opens nested `EditTransactionDialog`).
  - "Delete Entry" button: Expands inline confirmation box: *"Deleting will automatically revert ₹X back to your account balance. Continue?"* with "Yes, Delete Entry" (calls `deleteTransaction()`) and "Cancel" actions.

---

### 5.31 Bill Inspector Sheet (`BillsScreen` -> Detail Sheet)
- **Component File:** `src/components/bills-screen.tsx`
- **Trigger:** Clicking any bill row
- **Contents:** Bill title, status badge (`DUE`, `PAID`, `OVERDUE`), amount, due date, category, notes, receipt download link, and "Pay Bill Now" action.

---

### 5.32 Notifications Management Controls (`NotificationsWebPage`)
- **Component File:** `src/components/web-screens.tsx`
- **Location:** `/notifications`
- **Controls:**
  - "Mark All Read" button: calls `markAllRead()`.
  - Individual notification click: calls `markNotificationRead(id)`.
  - Trash icon button: calls `deleteNotification(id)`.

---

## 6. Frontend UI Architecture, Navigation & Layout System

### 6.1 Responsive Route Shell (`ResponsiveRouteShell`)
Wraps every page with adaptive desktop and mobile viewports:
- **Desktop Sidebar (≥ 1024px):** Fixed 280px sidebar displaying EM Logo, page title, full vertical navigation links, theme toggle, and monthly expense widget.
- **Mobile Top Bar (< 640px):** Slim header displaying page title and theme toggle.
- **Mobile Bottom Navigation Bar (< 1024px):** Fixed bottom iOS-style bar with:
  1. Home (`/overview`)
  2. Entries (`/entries`)
  3. Center Floating Action Button (FAB Plus) linking to `/expenses`
  4. Notifications (`/notifications`) with red unread counter badge
  5. More Menu Drawer trigger
- **Mobile More Menu Drawer (`SheetContent side="bottom"`):** Slides up providing access to secondary routes: Monthly Budget, Reports, Bills & Utilities, Expenses, Savings, Reminders, and Settings.

### 6.2 Route Breakdown & Page Structure

| URL Route | Active Nav Key | Server Component File | Key Action Executed | Primary Component Rendered |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `overview` | `src/app/page.tsx` | `redirect('/overview')` | Redirect |
| `/overview` | `overview` | `src/app/overview/page.tsx` | `getOverviewData(month)` | `<OverviewWebPage>` |
| `/budget` | `budget` | `src/app/budget/page.tsx` | `getBudgetsForMonth()`, `getCategories()` | Budget allocation cards & tables |
| `/expenses` | `expenses` | `src/app/expenses/page.tsx` | `getExpensesData()`, `getAnalyticsData()` | `<ExpensesWebPage>` |
| `/entries` | `entries` | `src/app/entries/page.tsx` | `getEntries(params)`, `getFilterOptions()` | `<EntriesWebPage>` |
| `/bills` | `bills` | `src/app/bills/page.tsx` | `getBillsData()` | `<BillsScreen>` |
| `/savings` | `savings` | `src/app/savings/page.tsx` | `getSavingsData()` | `<SavingsWebPage>` |
| `/reminders` | `reminders` | `src/app/reminders/page.tsx` | `getReminders()` | `<RemindersWebPage>` |
| `/notifications` | `notifications` | `src/app/notifications/page.tsx` | `getNotifications()`, `getUnreadCount()` | `<NotificationsWebPage>` |
| `/reports` | `reports` | `src/app/reports/page.tsx` | `getAccounts()`, `getCategories()` | `<SettingsReportsSection>` |
| `/settings` | `settings` | `src/app/settings/page.tsx` | `getAccounts()`, `getCategories()`, `getRules()` | `<SettingsWebPage>` |

### 6.3 Theme Toggle & CSS Variables System
- Theme state persisted in `localStorage` under key `'app-theme'`.
- Toggles `.light-theme` class on root `<html>`.
- Default base: Deep dark finance theme (`bg-[#070b12]` with radial gradient to `#182636`).

### 6.4 Interactive Data Visualizations & Charts
1. **Interactive Cashflow Trend Line Chart (`OverviewInteractiveLineChart`):** Dual metric toggle (`Expense` vs `Income`) with selectable month dropdown and daily Recharts line plotting.
2. **Radial Balance Snapshot (`OverviewRadialChart`):** Recharts `RadialBarChart` visualizing Income, Expense, Budget, and Balance percentages with month-over-month trend indicators.
3. **Category Donut Ring (`CategoryDonutRing`):** SVG donut with interactive hover states displaying category spend and share of starting capital.
4. **Income vs Expense Bar Chart (`AnalyticsCharts`):** Annual 12-month bar chart with year selector dropdown.
5. **Multi-Type Analytics Engine (`SettingsReportsSection`):** Instant switcher between Bar, Pie, Line, and Area charts across category, account, bill, and reminder datasets.

---

## 7. AI Engine Architecture, Deterministic Pipelines & Future Roadmap

### 7.1 Deterministic-First Natural Language Quick-Add Parser (AI-1)
Follows a confidence-gated pipeline. Deterministic regex parses structured input immediately:
```
<Category/Description> <Amount> [from <Account>] [to <TargetAccount>] [on <Date>] [#tag] [#mood]
```
Calculates **Life-Hours Cost**:
$$\text{Labor Hours} = \frac{\text{Transaction Amount}}{\text{Hourly Wage } W}$$

### 7.2 Rules Engine & Auto-Categorization (AI-2)
Matches transaction descriptions against the `Rule` table by priority. If hit, assigns `categoryId` and default `SpendingIntent`.

### 7.3 Multimodal Receipt OCR & Audio Parsing Pipeline (AI-3)
Receipt images and audio notes processed via Gemini Vision / Whisper API returning structured JSON. If extraction confidence is $< 0.85$, marks `status = 'UNREVIEWED'` for human verification.

### 7.4 Model Context Protocol (MCP) Server Endpoint (AI-4)
Native endpoint planned at `/api/v1/mcp` providing tool definitions for AI assistants:
- `get_monthly_budget_status(month: string)`
- `log_expense(quick_add_text: string)`
- `search_transactions(query, category, startDate, endDate)`
- `get_spending_insights(period: string)`

### 7.5 Gamification & Financial Intelligence Modules (Future Roadmap)
- **Telegram Bot ("Pocket Accountant"):** Webhook route at `/api/bot/route.ts` using `grammy` to log expenses via voice notes and photos.
- **AI Financial Advisor Chat ("Ask Your Money"):** Streaming chat route at `/api/v1/chat/route.ts`.
- **AI Spending Roast:** Humor-driven monthly spending critique analyzing excessive deliveries and unused subscriptions.
- **Impulse Buy Vault:** 48-hour cooling timer tracking avoided purchases and logging an "Impulse Saved" balance.
- **Mood x Money Heatmap:** Cross-tabulates mood tags (`#stressed`, `#happy`, `#impulsive`, `#bored`) against spend volume.
- **Subscription Rot Detector:** Proactive renewal cancellation alerts for low-ROI subscriptions.

---
*End of CLAUDE.md Technical Specification.*
