# DiploGO

**DiploGO** is a gaming/competitive tool designed for interactive learning of new topics. Users can create their own topics, add questions to them or let AI do it for them, and then answer questions, earn points, build streaks, and compete.

## Architecture
The project consists of two main parts:
- `mobile/`: Client application built with **React Native (Expo)** and **TypeScript**.
- `api/`: Server application built with **NestJS**, interacting with **PostgreSQL** via **Prisma ORM**.

## Documentation
The `docs/` directory contains a detailed description and guidelines for the project:
- [idea-and-tasks.md](docs/idea-and-tasks.md) — Main concept and project Roadmap.
- [design-system.md](docs/design-system.md) — Color palette and UI Guidelines of the app.
- [expo.md](docs/expo.md) — Documentation and best practices for the mobile client.
- [nest.md](docs/nest.md) — Documentation and best practices for the server backend.

## How to run

### Backend (NestJS)
1. Go to the server folder: `cd api`
2. Install dependencies: `npm install`
3. Configure your PostgreSQL database (specify `DATABASE_URL` in `.env`).
4. Apply Prisma migrations: `npx prisma migrate dev`
5. Start the server: `npm run start:dev`

### Mobile (Expo)
1. Go to the client folder: `cd mobile`
2. Install dependencies: `npm install`
3. Start the Expo server: `npm start`
4. Scan the QR code with the **Expo Go** app on your mobile device (or press `i` to launch iOS simulator, `a` for Android emulator).
