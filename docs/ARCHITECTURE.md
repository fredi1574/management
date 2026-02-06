# Architecture & Best Practices

## Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── expenses/      # Expense endpoints
│   │   │   ├── incomes/       # Income endpoints
│   │   │   ├── categories/    # Category endpoints
│   │   │   ├── stocks/        # Stock endpoints
│   │   │   ├── summary/       # Summary aggregates
│   │   │   └── recurring/     # Recurring transaction processing
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # Reusable components
│   ├── hooks/                 # Custom React hooks
│   │   ├── useExpenses.ts     # Expense data fetching
│   │   └── useSummary.ts      # Summary aggregates
│   ├── lib/                   # Utilities and helpers
│   │   ├── api-middleware.ts  # Rate limiting & security
│   │   ├── analytics.ts       # Analytics calculations
│   │   ├── cache.ts           # Caching headers & utils
│   │   ├── db.ts              # Database connection
│   │   ├── error-handler.ts   # Error handling utilities
│   │   ├── filters.ts         # Data filtering logic
│   │   ├── format.ts          # Formatting utilities
│   │   ├── logger.ts          # Structured logging
│   │   ├── rate-limit.ts      # Rate limiting logic
│   │   ├── recurring.ts       # Recurring transactions
│   │   ├── sanitize.ts        # Input sanitization
│   │   └── validators.ts      # Zod schemas & validation
│   ├── middleware.ts          # Global middleware
│   └── types/                 # TypeScript types
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Database seeding
├── e2e/                       # End-to-end tests
├── docs/                      # Documentation
├── playwright.config.ts       # E2E test configuration
└── vitest.config.ts          # Unit test configuration
```

## Core Concepts

### 1. Data Flow

```
User Action
    ↓
React Component (Client)
    ↓
Fetch → API Route (Server)
    ↓
Validation (Zod)
    ↓
Sanitization
    ↓
Database Operation (Prisma)
    ↓
Cache & Response
    ↓
Component State (SWR)
    ↓
UI Update
```

### 2. Error Handling Strategy

```typescript
// All API routes follow this pattern:
try {
  // Validate input
  const data = schema.parse(body);
  
  // Sanitize
  const clean = sanitizeObject(data);
  
  // Execute
  const result = await db.operation(clean);
  
  // Cache & respond
  return jsonResponseWithCache(result);
} catch (error) {
  return handleApiError(error);
}
```

### 3. Caching Hierarchy

```
Browser Cache (1 min)
    ↓ (on miss)
CDN Cache (5 min)
    ↓ (on miss)
Server Cache (stale-while-revalidate)
    ↓ (on miss)
Database
```

## API Design Principles

### RESTful Endpoints

| Method | Endpoint | Purpose | Cache |
|--------|----------|---------|-------|
| GET | `/api/expenses` | List all expenses | 1 min |
| POST | `/api/expenses` | Create expense | None |
| GET | `/api/expenses/:id` | Get single expense | 1 min |
| PUT | `/api/expenses/:id` | Update expense | None |
| DELETE | `/api/expenses/:id` | Delete expense | None |

### Response Format

**Success (2xx)**
```json
{
  "id": "uuid",
  "amount": 100.50,
  "categoryId": "cat-id",
  "date": "2025-01-15T00:00:00Z",
  "notes": "Groceries",
  "isRecurring": false,
  "category": {
    "id": "cat-id",
    "name": "Food",
    "type": "expense",
    "color": "#FF0000",
    "icon": "ShoppingCart"
  }
}
```

**Error (4xx/5xx)**
```json
{
  "error": "Validation error",
  "details": {
    "amount": ["Amount must be positive"],
    "categoryId": ["Category is required"]
  }
}
```

## Security Measures

### 1. Input Validation
- Zod schema validation on all endpoints
- Type-safe validation with detailed error messages
- Reject invalid data immediately

### 2. Input Sanitization
- Remove HTML/XSS from text inputs
- Trim whitespace
- Prevent injection attacks

### 3. Rate Limiting
- 100 requests per minute (default)
- IP-based identification
- Configurable per endpoint

### 4. Security Headers
- CSP (Content Security Policy)
- X-Frame-Options (DENY)
- X-Content-Type-Options (nosniff)
- HSTS (production only)

### 5. Database
- Parameterized queries (Prisma)
- No SQL injection possible
- Row-level permissions (when using Supabase)

## Performance Optimization

### 1. Data Fetching
```typescript
// ✅ Use SWR for client-side caching
const { expenses } = useExpenses(year, month);

// ✅ Deduplicate requests
// Multiple components requesting same data = single request

// ✅ Revalidate on focus/reconnect
// Fresh data when user returns to tab
```

### 2. Caching Strategy
```typescript
// ✅ Different TTLs for different data types
READ_ONLY_CACHE.TRANSACTIONS    // 1 min browser, 5 min CDN
READ_ONLY_CACHE.SUMMARY         // 5 min browser, 10 min CDN
READ_ONLY_CACHE.CATEGORIES      // 1 hour browser, 1 hour CDN
```

### 3. Database Optimization
- Indexes on frequently queried fields
- Include relations efficiently
- Batch operations where possible

## Testing Strategy

### Unit Tests (Vitest)
- Validators: `src/lib/validators.test.ts`
- Error handler: `src/lib/error-handler.test.ts`
- Utilities: Format, filters, analytics

### Integration Tests
- API route handlers
- Database operations
- Data transformations

### E2E Tests (Playwright)
- User workflows
- Page navigation
- API integration
- Responsive design

## Monitoring & Logging

### Log Levels
```typescript
logger.debug("Internal details", context);
logger.info("User action", context);
logger.warn("Potential issue", context);
logger.error("Error occurred", error, context);
```

### Metrics to Track
- API response times
- Database query duration
- Cache hit rates
- Error rates
- User actions

## Recurring Transactions

### Processing Flow
```
1. Check if recurring transaction
2. Find last instance date
3. Calculate next date based on pattern
4. Create new transaction
5. Log success/failure
```

### Patterns Supported
- Daily
- Weekly
- Monthly
- Yearly

### Execution
- Triggered via `/api/recurring/process`
- Should be called daily (cron job)
- Idempotent (safe to call multiple times)

## Analytics & Insights

### Calculations
- **Trends**: Monthly income/expense over time
- **Breakdown**: Category distribution
- **Velocity**: Spending per day
- **Anomalies**: Unusual transactions
- **Projections**: Future balance estimate
- **Savings Rate**: Income saved percentage

### Implementation
```typescript
// Use analytics utilities
const trends = calculateYearlyTrends(transactions, 2025);
const breakdown = calculateCategoryBreakdown(expenses);
const anomalies = identifyAnomalies(transactions);
```

## Filtering & Search

### Available Filters
- Date range (start/end)
- Categories (multi-select)
- Amount range (min/max)
- Search text (notes/category)
- Recurrence status

### Implementation
```typescript
const filtered = filterExpenses(expenses, {
  startDate: "2025-01-01",
  endDate: "2025-12-31",
  categories: ["food", "transport"],
  minAmount: 10,
  maxAmount: 500,
  search: "grocery",
});
```

## Development Workflow

### Setup
```bash
# Clone & install
git clone <repo>
npm install

# Setup database
npx prisma generate
npx prisma db push
npx prisma db seed

# Start development
npm run dev
```

### Testing
```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# E2E tests
npm run test:e2e

# E2E with UI
npm run test:e2e:ui
```

### Building
```bash
# Build for production
npm run build

# Start production server
npm start
```

## Deployment

### Environment Variables
```bash
DATABASE_URL          # Database connection string
NODE_ENV             # development|production
APP_NAME             # Application name
APP_URL              # Public URL
```

### Vercel Deployment
```bash
# Connect repo to Vercel
vercel link

# Set environment variables
vercel env add DATABASE_URL

# Deploy
vercel deploy --prod
```

### Database Selection
- **Development**: SQLite (included)
- **Production**: PostgreSQL (Neon/Supabase recommended)

See `docs/DATABASE_MIGRATION.md` for detailed database setup.

## Best Practices

### Code Quality
- ✅ Type-safe with TypeScript
- ✅ Input validation with Zod
- ✅ Error handling in all routes
- ✅ Consistent formatting
- ✅ Comprehensive tests

### Performance
- ✅ SWR for data fetching
- ✅ HTTP caching headers
- ✅ Database query optimization
- ✅ Rate limiting
- ✅ Lazy loading

### Security
- ✅ Input sanitization
- ✅ CSRF protection
- ✅ XSS prevention
- ✅ SQL injection prevention
- ✅ Security headers

### Maintainability
- ✅ Clear file structure
- ✅ Reusable utilities
- ✅ Well-documented code
- ✅ Consistent patterns
- ✅ Modular components

## Common Patterns

### API Route Pattern
```typescript
import { handleApiError } from "@/lib/error-handler";
import { schema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const data = schema.parse(await request.json());
    const result = await db.operation(data);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Component Data Pattern
```typescript
"use client";

import { useExpenses } from "@/hooks/useExpenses";

export function MyComponent({ year, month }: Props) {
  const { expenses, isLoading, error, mutate } = useExpenses(year, month);

  if (isLoading) return <Loading />;
  if (error) return <Error />;

  return <div>{expenses.map(...)}</div>;
}
```

### Hook Pattern
```typescript
import useSWR from "swr";

export function useData(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/data/${id}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return { data, error, isLoading, mutate };
}
```

## References

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Zod Validation](https://zod.dev)
- [SWR Documentation](https://swr.vercel.app)
- [Playwright Testing](https://playwright.dev)
