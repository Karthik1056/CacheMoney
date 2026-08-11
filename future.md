# 🚀 Future Feature Expansion Roadmap (`future.md`)

> Research-backed feature proposals for Expense Manager — sourced from top open-source personal finance repositories (*SmartExpenseBot*, *WealthWise*, *Fiscal Flow*, *Token Circles*, *Firefly III*) and emerging indie tools.

**Date:** 2026-08-09  
**Current Tech Stack:** Next.js 14 (App Router) · Prisma ORM · PostgreSQL · Tailwind CSS · shadcn/ui  
**AI Baseline:** Gemini API & OpenAI API (configured in `.env`)

---

## 🤖 Tier 1: AI & Bot Automations (High Impact)

### 1.1 📱 Telegram Bot — "Pocket Accountant"
* **Open Source References:** [SmartExpenseBot](https://github.com/BotirBakhtiyarov/SmartExpenseBot), [n8n Notion Expense Tracker](https://github.com/ulisestame/n8n_Notion_Expense_Tracker)
* **Overview:** Interact with Expense Manager via Telegram without opening the web application. Log expenses using natural text, voice notes, or receipt photos.
* **Command Set:**
  - `/add 500 Groceries from Cash #need` — Quick deterministic log
  - Voice Note (Whisper API) — Transcribes audio transcript to text, parses data, and logs transaction
  - Photo / Receipt (Gemini Vision OCR) — Extracts vendor, date, line items, and total amount
  - `/today`, `/week`, `/month` — Instant spending summaries
  - `/roast` — Generates an AI-driven humor roast of recent spending habits
  - `/undo` — Soft-deletes the last logged transaction
* **Architecture:** Next.js API Webhook endpoint at `src/app/api/bot/route.ts` using `grammy` to execute Prisma Server Actions.

---

### 1.2 🧠 AI Financial Advisor Chat — "Ask Your Money"
* **Open Source References:** [WealthWise](https://github.com/hoangsonww/WealthWise-Finance-Tracker), [Fiscal Flow](https://github.com/MelKorSA/fiscal-flow)
* **Overview:** In-app chat assistant widget where users query their financial data in plain English (*"How much did I spend on dining out this week?"*, *"Am I on track for my grocery budget?"*).
* **Architecture:** Streaming Next.js API route (`src/app/api/v1/chat/route.ts`) executing intent extraction against Prisma DB records.

---

### 1.3 🔥 AI Spending Roast
* **Overview:** A weekly/monthly feature that analyzes spending anomalies and generates a humorous, brutally honest summary of impulse purchases, excessive food deliveries, and unused subscriptions.

---

### 1.4 📸 Receipt Scanner & OCR Pipeline (`AI-3`)
* **Overview:** Web UI receipt drag-and-drop. Multimodal LLM parses the receipt into structured JSON. Low confidence (<0.85) automatically flags status as `UNREVIEWED` for human verification.

---

## 🎮 Tier 2: Quirky & Gamification Features

### 2.1 ⏰ Life-Hours Cost Display — "Is This Worth X Hours of Your Life?"
* **Open Source References:** [MoneyChakra](https://apps.apple.com/us/app/moneychakra/id6474542107), [Timecostify](https://apps.apple.com/us/app/timecostify/id1612889234)
* **Overview:** Converts money amounts into working time required (`Labor Hours = Amount / Hourly Wage`).
* **UI Details:** Adds `₹500 → 2.3 hrs` badges across transaction feeds, budget meters, and impulse wishlist items.

---

### 2.2 🧊 Impulse Buy Freeze — "The Cooling-Off Vault"
* **Overview:** Utilizes existing `WishlistItem` Prisma schema (`coolingUntil`, `WishlistStatus`). Users lock desired items behind a 48-hour countdown timer. If passed, the saved amount is logged to an **"Impulse Saved"** counter on the dashboard.

---

### 2.3 😤 Mood × Money Heatmap
* **Open Source References:** [MoodWallet](https://moodwallet.co/), [Feelance](https://apps.apple.com/)
* **Overview:** Maps transaction mood tags (`#stressed`, `#happy`, `#impulsive`, `#bored`) against spend volume to generate emotional spending insights and personality badges (e.g., 🦁 *The Lion*, 🐿️ *The Squirrel*, 🦉 *The Owl*).

---

### 2.4 🏆 No-Spend Streaks & Challenges
* **Overview:** Tracks consecutive zero-discretionary spending days with visual flame streaks 🔥 and awards achievements (*Diamond Hands*, *Budget Brain*).

---

### 2.5 🔮 Subscription Rot Detector
* **Open Source References:** [Monarch Money](https://www.monarchmoney.com/), [Subscription Track](https://subscriptiontrack.app/)
* **Overview:** Auto-detects recurring vendor transactions, computes ROI per usage, and sends proactive cancellation reminders before renewal dates.

---

## 📊 Tier 3: Smart Analytics & Forecasting

### 3.1 🏥 Financial Health Score (0–100)
* **Open Source References:** [Fiscal Flow](https://github.com/MelKorSA/fiscal-flow)
* **Sub-Metrics:** Savings Rate (30%), Budget Adherence (25%), Debt Ratio (20%), Emergency Runway (15%), Category Diversity (10%).

---

### 3.2 🗺️ Spending Heatmap Calendar
* **Open Source References:** [Token Circles](https://github.com/token-circles/token-circles), [Expensica](https://github.com/dhruvir-zala/obsidian-expensica)
* **Overview:** GitHub-contributions-style calendar visualizing daily spending density.

---

### 3.3 ⚡ "What-If" Scenario Simulator
* **Overview:** Interactive sliders simulating long-term financial impacts (*"What if I reduce dining out by 30%?"*, *"What if I cancel 2 subscriptions?"*).

---

## 🔌 Tier 4: Integrations & Infrastructure

### 4.1 🔗 Model Context Protocol (MCP) Server Route (`AI-4`)
* **Overview:** Endpoint at `/api/v1/mcp` allowing external AI assistants (Claude, Cursor, Antigravity) to query budget status, log expenses, and analyze spending patterns.

---

### 4.2 📊 CSV / PDF Import & Export
* **Overview:** Export monthly financial reports or bulk-import bank statement CSVs with auto-mapped categories.

---

## 🗂️ Execution Phase Matrix

| Phase | Targeted Features | Estimated Effort |
| :--- | :--- | :--- |
| **Phase 1 (Immediate)** | Telegram Bot (1.1) + AI Roast (1.3) + Life-Hours Badges (2.1) | 3–4 Days |
| **Phase 2** | Impulse Vault (2.2) + Health Score (3.1) + Heatmap Calendar (3.2) | 3–4 Days |
| **Phase 3** | AI Advisor Chat (1.2) + Mood × Money (2.3) + Subscription Rot (2.5) | 4–5 Days |
| **Phase 4** | MCP Server Route (4.1) + What-If Simulator (3.3) + CSV Import/Export (4.2) | 4–5 Days |

---

## 🌐 Key GitHub Open-Source Repositories
* **SmartExpenseBot:** `github.com/BotirBakhtiyarov/SmartExpenseBot`
* **WealthWise:** `github.com/hoangsonww/WealthWise-Finance-Tracker`
* **Fiscal Flow:** `github.com/MelKorSA/fiscal-flow`
* **Token Circles:** `github.com/token-circles/token-circles`
* **Firefly III:** `github.com/firefly-iii/firefly-iii`
