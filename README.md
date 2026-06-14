
# 🌿 NutriBloom

**A closed-loop nutrition intelligence platform built with Next.js 16, Prisma, and NextAuth.**
NutriBloom is a full-stack nutrition tracking web app that goes far beyond simple calorie counting. It helps users **search recipes**, **plan weekly meals**, **log food intake**, **auto-generate grocery lists**, and **receive AI-powered insights** — all in a seamless, dark-mode-first UI.

The core philosophy is the **NutriBloom Loop**:

```
Search & Discover → Plan & Organize → Track & Log → Analyze & Improve → (repeat)
```

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 **Smart Recipe Discovery** | Search 1,000+ recipes filtered by nutrition, cuisine, and dietary needs |
| 📊 **Nutrition Dashboard** | Track macros (protein, carbs, fat) and calories with real-time progress rings |
| 📅 **Weekly Meal Planner** | Plan your week day-by-day and meal-by-meal |
| 🛒 **Auto Grocery Lists** | Generate categorized, aisle-sorted shopping lists from your meal plan |
| 🧠 **AI Insights Engine** | Behavior-driven nutrition insights that improve as you log more data |
| 📈 **Analytics & Trends** | Weekly/monthly calorie trends, macro breakdowns, and goal hit rates |
| 👤 **Auth System** | Secure email/password signup with NextAuth v5 + Prisma adapter |
| ⚙️ **Custom Goals** | Set personalized calorie, protein, carb, fat targets per diet type |

---

## 🛠 Tech Stack

**Frontend**
- [Next.js 16](https://nextjs.org/) (App Router, Server Components)
- [React 19](https://react.dev/)
- [TypeScript 6](https://www.typescriptlang.org/)
- [Recharts](https://recharts.org/) — data visualization
- [Motion](https://motion.dev/) — animations
- [Lucide React](https://lucide.dev/) — icons

**Backend**
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Prisma ORM 5](https://www.prisma.io/) with PostgreSQL
- [NextAuth v5](https://authjs.dev/) (beta) for authentication
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js) for password hashing
- [Zod](https://zod.dev/) for input validation

---

## 📁 Project Structure

```
NutriBloom/
├── prisma/
│   ├── schema.prisma        # Database models
│   ├── seed.js              # Recipe seed data
│   └── migrations/          # SQL migration history
├── src/
│   ├── app/
│   │   ├── page.tsx         # Landing page
│   │   ├── layout.tsx       # Root layout
│   │   ├── dashboard/       # Main dashboard
│   │   ├── meals/           # Meal logging
│   │   ├── recipes/         # Recipe browser
│   │   ├── planner/         # Weekly meal planner
│   │   ├── grocery/         # Grocery list manager
│   │   ├── insights/        # Analytics & AI insights
│   │   ├── settings/        # User goals & preferences
│   │   ├── login/           # Login page
│   │   ├── signup/          # Signup page
│   │   └── api/             # API route handlers
│   │       ├── analytics/
│   │       ├── auth/
│   │       ├── dashboard/
│   │       ├── grocery/
│   │       ├── meals/
│   │       ├── planner/
│   │       ├── recipes/
│   │       ├── settings/
│   │       └── signup/
│   ├── components/
│   │   ├── AuthGuard.tsx    # Protected route wrapper
│   │   ├── ProgressRing.tsx # SVG circular progress
│   │   ├── Sidebar.tsx      # Navigation sidebar
│   │   └── TopBar.tsx       # Dashboard top bar
│   ├── lib/
│   │   ├── prisma.ts        # Prisma client singleton
│   │   └── utils.ts         # Shared utilities
│   └── auth.ts              # NextAuth configuration
├── next.config.js
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (local or hosted, e.g. [Supabase](https://supabase.com/), [Neon](https://neon.tech/))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/nutribloom.git
cd nutribloom

# 2. Install dependencies
npm install

# 3. Set up your environment variables (see below)
cp .env.example .env.local

# 4. Push the database schema
npx prisma migrate dev

# 5. Seed the database with recipe data
npm run seed

# 6. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Environment Variables

Create a `.env.local` file in the project root:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/nutribloom"
DIRECT_URL="postgresql://user:password@localhost:5432/nutribloom"

# NextAuth
AUTH_SECRET="your-random-secret-here"   # Run: openssl rand -base64 32
AUTH_URL="http://localhost:3000"
```

> **Tip:** For production, use a managed Postgres provider like [Neon](https://neon.tech/) (free tier available) and set `AUTH_URL` to your deployed domain.

---

## 🗄 Database Setup

NutriBloom uses **Prisma** with **PostgreSQL**. All migrations live in `prisma/migrations/`.

```bash
# Apply migrations to a new database
npx prisma migrate deploy

# Seed the database with 1,000+ recipes
npm run seed

# Open Prisma Studio (visual DB explorer)
npx prisma studio

# Reset the database (dev only)
npx prisma migrate reset
```

---

## 📡 API Reference

All routes require authentication (session cookie) unless noted.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard` | Today's nutrition summary, recent meals, insights |
| `GET` | `/api/meals?date=YYYY-MM-DD` | Fetch meals for a given date |
| `POST` | `/api/meals` | Log a meal entry (recipe or custom food) |
| `DELETE` | `/api/meals?entryId=...` | Remove a meal entry |
| `GET` | `/api/recipes?q=...` | Search recipes by name |
| `GET` | `/api/recipes/[id]` | Get single recipe with full ingredients |
| `GET` | `/api/planner?startDate=...&endDate=...` | Fetch planned meals for a date range |
| `POST` | `/api/planner` | Add a recipe to the planner |
| `DELETE` | `/api/planner?id=...` | Remove a planned meal |
| `GET` | `/api/grocery` | Fetch all grocery lists |
| `POST` | `/api/grocery` | Generate a grocery list from weekly plan |
| `PUT` | `/api/grocery` | Toggle grocery item checked state |
| `DELETE` | `/api/grocery?listId=...` | Delete a grocery list |
| `GET` | `/api/analytics?range=week\|month` | Fetch chart data and AI insights |
| `GET` | `/api/settings` | Get user goals and preferences |
| `PUT` | `/api/settings` | Update nutrition goals |
| `POST` | `/api/signup` | Create a new user account (public) |

---

## 🗃 Data Models

Key Prisma models:

```
User ──────┬── Meal ──── MealEntry ──── Recipe ──── RecipeIngredient ──── Ingredient
           ├── NutritionLog
           ├── Goal
           ├── UserPreference
           ├── PlannedMeal ──── Recipe
           ├── GroceryList ──── GroceryItem
           ├── Insight
           └── SavedRecipe ──── Recipe
```

See [`prisma/schema.prisma`](prisma/schema.prisma) for full field definitions.

---

## 🗺 Roadmap

### Near-Term

- [ ] **Barcode Scanner** — Scan packaged food barcodes to auto-fill nutrition info via Open Food Facts API
- [ ] **Water Intake Tracker** — Daily hydration logging with reminders
- [ ] **Micronutrient Tracking** — Vitamins (A, C, D, B12), minerals (iron, calcium, magnesium)
- [ ] **Custom Recipe Creator** — Build and save personal recipes with auto-calculated nutrition
- [ ] **Dark/Light Theme Toggle** — User-selectable theme preference

### Medium-Term

- [ ] **AI Meal Suggestions** — Claude/GPT-powered recipe recommendations based on goals, history, and pantry
- [ ] **Streaks & Gamification** — Logging streaks, achievement badges, and weekly challenges
- [ ] **Meal Photo Analysis** — Upload a photo of your meal and get an estimated nutrition breakdown
- [ ] **Export to PDF/CSV** — Download nutrition reports for sharing with a dietitian
- [ ] **Google OAuth Login** — One-click sign-in via Google
- [ ] **Mobile App (PWA)** — Progressive Web App support with offline logging

### Long-Term

- [ ] **Dietary Coach Chatbot** — In-app AI assistant for answering nutrition questions and meal advice
- [ ] **Grocery Delivery Integration** — Connect with Instacart/Swiggy Instamart to order directly from lists
- [ ] **Wearable Sync** — Import calorie burn data from Apple Health, Google Fit, or Fitbit
- [ ] **Social & Community** — Share meal plans, follow friends, and discover popular recipes
- [ ] **Restaurant Meal Lookup** — Search menu items from popular chains and restaurants

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

```bash
# Fork the repo and create a feature branch
git checkout -b feature/your-feature-name

# Make your changes, then commit
git commit -m "feat: add your feature description"

# Push and open a pull request
git push origin feature/your-feature-name
```

Please follow the existing code style (TypeScript strict mode, functional components, inline styles consistent with the design system).

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with 💚 by the NutriBloom team · *Make smarter food decisions, every day.*

</div>
