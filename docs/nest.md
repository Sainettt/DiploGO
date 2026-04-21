# NestJS API & Prisma

This directory (when `api` is created) contains the RESTful (or GraphQL) API to facilitate mobile client interaction with the server database. The application is written in TypeScript using the NestJS framework.

## Stack
- **NestJS** — architecture and controllers.
- **Prisma** — ORM for database interaction and type generation.
- **PostgreSQL** — relational database for secure and reliable data storage.

## Module Structure
The NestJS application will be divided by logical domains (Modules):

1. **AuthModule**: Registration, login (JWT), and Google OAuth via `POST /auth/google` (see [`oauth.md`](./oauth.md)). `id_token` verification is done server-side with `google-auth-library`; the API then issues its own JWT.
2. **UsersModule**: User profiles, managing statistics and streaks.
3. **TopicsModule**: Creating, deleting, editing topics.
4. **QuestionsModule**: CRUD for questions (with an endpoint for AI question generation).
5. **GameSessionsModule**: Logic for starting, playing, and ending a game session on a specific topic.

## Prisma (ORM)
- The database schema will be described in `prisma/schema.prisma`.
- Models: `User`, `Topic`, `Question`, `GameSession`, `Answer`.
- After any schema modifications, run: `npx prisma migrate dev` (updates the DB) and `npx prisma generate` (updates TypeScript client types).

## Best Practices
1. **DTO (Data Transfer Objects)**: Use DTOs along with `class-validator` and `class-transformer` for reliable incoming data validation in controllers.
2. **Dependency Injection**: All business logic should be situated in providers (Services) for easier mocking and unit testing.
3. **Error Handling**: Use the built-in exception filtering features provided by NestJS (`HttpExceptionFilters`).
