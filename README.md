# EngageNinja

AI-first engagement platform combining WhatsApp, Email, and campaign automation for agencies and SMBs.

## Tech Stack

| Component | Tech |
|-----------|------|
| **Frontend** | Next.js 16, React 19, Tailwind, shadcn/ui |
| **API** | NestJS, PostgreSQL, Prisma 7 |
| **Worker** | NestJS, BullMQ, Redis |
| **Tests** | Jest (unit), Playwright (E2E) |

## Quick Start (3 Minutes)

### Prerequisites
```bash
# Ensure PostgreSQL is running
docker ps | grep postgres

# Ensure Node 18+ and pnpm 10+ installed
node --version
pnpm --version
```

### Setup & Run

**Terminal 1: Database + API**
```bash
cd api
pnpm install
DATABASE_URL="postgresql://engageninja:engageninja@localhost:5433/engageninja" pnpm run start:dev
# Wait for "Listening on port 3000"
```

**Terminal 2: Web**
```bash
cd web
pnpm install
pnpm run dev
# Wait for "ready - started server on 0.0.0.0:3001"
```

**Test locally:**
- Signup: http://localhost:3001/signup
- Login: http://localhost:3001/login (use seeded creds below)

## Running Tests

### Unit & Integration Tests

```bash
# Web tests
cd web && pnpm test

# API tests
cd api && pnpm test

# Watch mode
cd web && pnpm test:watch
cd api && pnpm test:watch
```

### E2E Tests (Playwright)

```bash
# Ensure API and Web are running (see Quick Start above)

cd web

# Run with UI (recommended)
pnpm run test:e2e:ui

# Run headless
pnpm run test:e2e

# Debug mode
pnpm run test:e2e:debug

# View results
pnpm run test:e2e:report
```

See `web/e2e/README.md` for detailed E2E test documentation.

## Database Setup

### First Time Only
```bash
cd api
pnpm run prepare-db
# This creates tables and seeds sample data
```

### Migrations
```bash
# Create migration after schema changes
cd packages/prisma
pnpm prisma migrate dev --name your_migration_name

# Apply migrations
pnpm prepare-db
```

## Seeded Credentials

After running `prepare-db`, use these to test locally:

| Email | Password | Tenant | Role |
|-------|----------|--------|------|
| `owner@example.com` | `Test123!Aa` | Alpha Workspace (Growth) | Owner |
| `member@example.com` | `Test123!Aa` | Beta Collective (Starter) | Member |

## Project Structure

```
EngageNinja/
├── api/                  # NestJS backend
│   ├── src/
│   │   ├── auth/        # Authentication
│   │   ├── modules/     # Feature modules
│   │   └── common/      # Shared (guards, filters, interceptors)
│   └── test/            # E2E tests
├── web/                 # Next.js frontend
│   ├── src/
│   │   ├── app/         # Routes and pages
│   │   ├── components/  # React components
│   │   └── lib/         # Utilities and API clients
│   └── e2e/            # Playwright E2E tests
├── worker/             # Background jobs (BullMQ)
├── packages/
│   └── prisma/         # Shared database schema
└── docs/               # Documentation
```

## Key Flows

### Authentication
- **Signup**: `POST /auth/signup` → creates user + tenant → sets cookies
- **Login**: `POST /auth/login` → validates creds → sets access/refresh tokens + tenant_id
- **Switch Tenant**: `POST /auth/switch-tenant` → updates active tenant → new tokens

### Routes
- `/login` - Login page
- `/signup` - Signup page
- `/select-tenant` - Choose or create tenant
- `/dashboard` - Main app (protected)

Protected routes redirect to `/login?redirect=...` if not authenticated.

## Common Commands

### Development
```bash
# Format code
pnpm run format

# Lint
pnpm run lint

# Build
pnpm run build

# Type check
pnpm run typecheck
```

### Testing
```bash
# Run all tests
pnpm test

# Run E2E tests with UI
cd web && pnpm run test:e2e:ui

# Run tests in watch mode
pnpm test:watch
```

### Database
```bash
# Seed database
pnpm run prepare-db

# Access Prisma Studio (visual DB explorer)
cd packages/prisma && pnpm prisma studio
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| **"Cannot connect to database"** | Ensure PostgreSQL is running and DATABASE_URL is set |
| **"Port 3000/3001 already in use"** | Kill the process or use `lsof -i :3000` to find it |
| **"Tests fail but pass locally"** | Ensure you're not using `test.only()` or `test.skip()` |
| **"E2E tests timeout"** | Check that API is responding: `curl http://localhost:3000/health` |
| **"Module not found errors"** | Run `pnpm install` in the relevant directory (api/, web/) |

## Documentation

- **[E2E Tests](./web/e2e/README.md)** - How to write and run Playwright tests
- **[Product Brief](./docs/prd.md)** - Product requirements and features
- **[Architecture](./docs/architecture.md)** - Technical architecture decisions
- **[Epics & Stories](./docs/epics.md)** - Feature breakdown for development

## Contributing

1. Create a branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run tests: `pnpm test` (unit) and `pnpm run test:e2e` (E2E for UI changes)
4. Push and create a PR
5. CI runs automatically - all tests must pass

## Questions?

- Check docs in `/docs/`
- Read test examples in `web/e2e/tests/`
- Review API endpoints in `api/src/`
