# CLAUDE.md

## Project Overview

DiploGO is a gamified learning platform (diploma project). It's a monorepo with two main packages:
- `api/` — NestJS + Prisma + PostgreSQL backend (port 4000)
- `mobile/` — Expo + React Native + NativeWind frontend

## Commands

### Backend (`api/`)

```bash
cd api
npm run start:dev      # Run in watch mode
npm run build          # Compile TypeScript
npm run lint           # ESLint
npm run test           # Unit tests (Jest)
npm run test:e2e       # End-to-end tests
npx prisma migrate dev # Run DB migrations
npx prisma generate    # Regenerate Prisma client
npx prisma studio      # Open DB browser
```

### Mobile (`mobile/`)

```bash
cd mobile
npx expo start         # Start Expo dev server
npx expo start --android
npx expo start --ios
```

### Docker (full stack)

```bash
docker-compose up      # Start PostgreSQL + API together
docker-compose up -d postgres  # Start only the DB
```

The API reads its config from `api/.env`. PostgreSQL runs on port 5432, API on port 4000.

## Architecture

### Backend (`api/src/`)

NestJS modular architecture. Each feature is a self-contained module with Controller → Service → Prisma pattern.

- `main.ts` — bootstraps NestJS, enables global `ValidationPipe` (whitelist), CORS, port 4000
- `app.module.ts` — root module; currently imports `PrismaModule`, `AuthModule`, `OnBoardingModule`
- `prisma/` — `PrismaService` (singleton, extends `PrismaClient`)
- `auth/` — `/auth/register` and `/auth/login` endpoints; JWT via `@nestjs/jwt`, bcrypt password hashing
- `onboarding/` — POST `/onboarding` to save user onboarding preferences

DTOs use `class-validator` decorators. Auth returns a JWT token; the mobile app stores it in `AsyncStorage` and attaches it via an Axios request interceptor.

### Database (`api/prisma/schema.prisma`)

PostgreSQL with two models:
- `User` — id (UUID), email (unique), username, passHash
- `OnBoardingSettings` — linked to User via userId; stores purpose, dailyTimeSpent, pushNotifications, onBoardingCompleted

### Mobile (`mobile/`)

File-based routing via Expo Router. Screens live in `app/`, shared logic in `src/`.

- `app/_layout.tsx` — root Stack layout, dark theme (`#121212`)
- `app/index.tsx` — login screen
- `app/register.tsx` — registration screen
- `src/api/api.client.ts` — Axios instance pointed at `http://localhost:4000`; attaches JWT from AsyncStorage, handles 401 by clearing token
- `src/api/auth.api.ts` — `register()` and `login()` methods
- `src/components/ThemeButton.tsx` — shared button with animated press scale, `primary` (purple `#BB86FC`) and `outline` variants

Styling uses NativeWind (Tailwind CSS for React Native). The design system uses a dark theme: background `#121212`, surface `#1E1E1E`, accent purple `#BB86FC`, teal `#03DAC6`.

## Roadmap Context

The project is in Phase 1 (MVP). Planned but not yet implemented: Topics CRUD, Questions (manual then AI-generated), Game Session screen, Streaks, Leaderboards, Duels. See `docs/idea-and-tasks.md` for the full roadmap.
