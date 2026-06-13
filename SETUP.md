# NutriMap AI — Setup Guide

## Quick Start

### 1. Install Node.js
Download from https://nodejs.org (LTS version recommended)

### 2. Install dependencies
```bash
cd /Users/sophiahayes/claude/nutrimapai
npm install
```

### 3. Set up environment variables
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your **Anthropic API key** (required for AI features):
```
ANTHROPIC_API_KEY=sk-ant-...
NEXTAUTH_SECRET=any-random-string-here
```

The app works without a database or Stripe for now — meal plans and grocery lists are saved in the browser's localStorage.

### 4. Run the app
```bash
npm run dev
```

Open http://localhost:3000

---

## Features

| Page | URL | Description |
|------|-----|-------------|
| Landing | `/` | Marketing homepage |
| Onboarding | `/onboarding` | Enter profile + pick diet style |
| Dashboard | `/dashboard` | See macros, generate meal plan |
| Grocery | `/grocery` | Generate + check off grocery list |
| Sign In | `/auth/signin` | Authentication |

## User Flow
1. `/onboarding` → fill in age, sex, height, weight, activity, goal, diet style
2. `/dashboard` → see your daily calorie/macro targets → click "Generate Meal Plan"
3. `/grocery` → click "Generate Grocery List" → check items off as you shop

## Optional: Database (PostgreSQL + Prisma)
For persistent storage, set `DATABASE_URL` in `.env.local` and run:
```bash
npx prisma db push
```

## Optional: Stripe Payments
Add your Stripe keys to `.env.local` to enable the subscription system.
