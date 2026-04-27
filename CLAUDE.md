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
- `app.module.ts` — root module; imports `PrismaModule`, `AuthModule`, `JwtAuthModule`, `OnBoardingModule`, `UsersModule`, `AiModule`, `TopicsModule`
- `prisma/` — `PrismaService` (singleton, extends `PrismaClient`)
- `auth/` — `/auth/register` and `/auth/login` endpoints; JWT via `@nestjs/jwt`, bcrypt password hashing
- `auth/jwt-auth.module.ts` — `@Global()` module that provides and exports `JwtGuard` as a single shared instance. Any module that needs `@UseGuards(JwtGuard)` just uses it directly; no need to list `JwtGuard` in `providers`.
- `onboarding/` — POST `/onboarding` to save user onboarding preferences
- `topics/` — CRUD for topics + nested questions/answers. Per-question-type validation lives in `topics/question-types.ts` (single source of truth — extend the `QUESTION_TYPE_VALIDATORS` map to add a new type)
- `ai/` — provider-abstraction module. `AiService` resolves a provider from env (`AI_PROVIDER`, defaults to `stub`). Adapters under `ai/providers/`: `StubAiProvider` (offline fallback) and `AnthropicAiProvider` (HTTP to Anthropic Messages API). See `docs/ai-integration.md` for how to add OpenAI/Gemini.

DTOs use `class-validator` decorators. Auth returns a JWT token; the mobile app stores it in `AsyncStorage` and attaches it via an Axios request interceptor.

### Database (`api/prisma/schema.prisma`)

PostgreSQL. Core models in use:
- `User` — id (UUID), email (unique), username, passHash, googleId, expoPushToken
- `OnBoardingSettings` — linked to User via userId; purpose, dailyTimeSpent, pushNotifications, onBoardingCompleted
- `Topic` — userId, title, description, icon, color, difficulty, isPublic, isArchived
- `Question` — topicId, text, explanation, `type` (SINGLE_CHOICE / MULTIPLE_CHOICE / TRUE_FALSE / OPEN_TEXT), `source` (MANUAL / AI / IMPORTED), difficulty
- `Answer` — questionId, text, isCorrect, order

The schema also defines (not yet wired into endpoints): `StudySession`, `QuestionAttempt`, `UserQuestionStat`, `UserTopicStat`, `Streak`, `DailyActivity`.

### Mobile (`mobile/`)

File-based routing via Expo Router. Screens live in `app/`, shared logic in `src/`.

- `app/_layout.tsx` — root Stack layout, dark theme (`#121212`)
- `app/(auth)/` — login + register
- `app/(tabs)/` — tabbed shell (home, library, stats, profile)
- `app/(tabs)/library.tsx` — topic list + bottom-right FAB that opens the create flow. Uses `useFocusEffect` to refetch on every visit.
- `app/topic-create/` — modal-presented stack: `index` (name + method) → `type` → `manual` or `ai`. Wrapped in `TopicDraftProvider` so wizard state survives navigation between steps.
- `src/api/api.client.ts` — Axios instance pointed at `http://localhost:4000`; attaches JWT from AsyncStorage, handles 401 by clearing token
- `src/api/auth.api.ts`, `src/api/topics.api.ts`, `src/api/onboarding.api.ts`, etc.
- `src/topic-types/registry.ts` — single source of truth for question kinds on the mobile side. Each entry defines `defaultDraft`, `validate`, `multipleCorrect`, answer-count limits, label/emoji. **Adding a new type requires:** (1) extend Prisma `QuestionType` enum + migration, (2) add validator in `api/src/topics/question-types.ts`, (3) add registry entry here.
- `src/topic-types/draftContext.tsx` — React Context holding the in-progress topic across wizard screens.
- `src/components/ThemeButton.tsx` — shared button with animated press scale, `primary` (purple `#BB86FC`) and `outline` variants

Styling uses NativeWind (Tailwind CSS for React Native). The design system uses a dark theme: background `#121212`, surface `#1E1E1E`, accent purple `#BB86FC`, teal `#03DAC6`.

## Roadmap Context

The project is in Phase 1 (MVP). Implemented: auth, onboarding, Topics CRUD with nested Questions/Answers, AI generation + AI text-formatter, Library screen with creation flow. Not yet implemented: Game Session screen, Streaks, Leaderboards, Duels. See `docs/idea-and-tasks.md` for the full roadmap and `docs/ai-integration.md` for swapping AI providers.
