# test-bfa-refactor-002

A simple Todo app with JWT-based authentication and a REST API for CRUD operations. Users can register and log in to manage their personal todo items. The backend exposes authenticated endpoints for creating, reading, updating, and deleting todos, plus a health endpoint. The frontend includes login, registration, and a todo dashboard.

## Features
- JWT-based authentication (register/login)
- Protected Todo CRUD endpoints
- Pagination and filtering for todos
- Health/status endpoint
- Responsive, accessible UI scaffolding
- Prisma ORM with SQLite (ready for PostgreSQL migration)

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Prisma ORM + SQLite
- Tailwind CSS
- Jest + React Testing Library
- Playwright

## Prerequisites
- Node.js 18+
- npm 9+

## Quick Start
Use the provided install scripts:

### macOS/Linux
```bash
./install.sh
```

### Windows PowerShell
```powershell
./install.ps1
```

Then run:
```bash
npm run dev
```

## Environment Variables
Create a `.env` file (script will copy `.env.example` for you):

```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-min-32-chars-change-in-production"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

## Project Structure
```
src/
  app/               # App Router pages and route handlers
  components/        # Reusable UI components
  lib/               # Utilities and API client
  providers/         # App-wide providers
  types/             # Shared types
prisma/              # Prisma schema and migrations
```

## API Endpoints (Planned)
- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users/me`
- `GET /api/todos`
- `POST /api/todos`
- `GET /api/todos/:id`
- `PUT /api/todos/:id`
- `DELETE /api/todos/:id`

## Available Scripts
- `npm run dev` - Start dev server
- `npm run build` - Build the app (runs `prisma generate`)
- `npm run start` - Start production server
- `npm run lint` - Lint
- `npm run test` - Run Jest tests
- `npm run test:watch` - Jest watch mode
- `npm run test:e2e` - Run Playwright tests

## Testing
- Unit tests: Jest + React Testing Library
- E2E tests: Playwright

## Notes
- JWT tokens should be provided via `Authorization: Bearer <token>` for protected endpoints.
- For local development, SQLite is used by default.
