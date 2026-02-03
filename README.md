# Income & Expense Manager

Track incomes, expenses, and stock investments with monthly and yearly views.

## Setup

```bash
npm install
npx prisma db push
npm run db:seed
```

## Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` – development server
- `npm run build` – production build
- `npm run start` – run production server
- `npm run test` – run tests
- `npm run db:seed` – seed default categories
- `npx prisma db push` – sync schema to SQLite

## Features

- **Dashboard** – current month summary and quick links
- **Monthly** – incomes/expenses by month, add/edit/delete, search notes, export CSV
- **Yearly** – monthly breakdown table and chart, export year CSV
- **Stocks** – add purchases (ticker, quantity, price, date, broker, fee), optional current value and P&L
- **Recurring** – mark income/expense as recurring
- **PWA** – installable via `/manifest.json`

## Tech

- Next.js 16 (App Router), TypeScript, Tailwind CSS, Prisma, SQLite, Recharts.
