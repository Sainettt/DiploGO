# Expo (React Native) Client

This directory (when `mobile` is created) contains the client part of the DiploGO application, written in React Native using the Expo framework.

## Stack
- **Expo Framework**
- **TypeScript**
- **React Navigation** (recommended for routing)
- **Axios** or **Fetch API** (for backend communication)

## Directory Structure (Proposed)

`mobile/`
- `assets/` — Images, fonts, and icons.
- `app/` — File-based routes (Expo Router). `(auth)/login.tsx`, `(auth)/register.tsx`, `onboarding/*`, `home`.
- `src/`
  - `components/` — Reusable elements (Buttons, Cards, Inputs).
  - `hooks/` — Shared React hooks (e.g. `useGoogleSignIn` — encapsulates the Google OAuth response handling used by both login and register screens).
  - `api/` — Services for making backend calls (`auth.api.ts`, `oauth.api.ts`, `onboarding.api.ts`, `api.client.ts`).
  - `store/` or `context/` — State management (Zustand/Redux/Context API).
  - `utils/` — Helpers (time formatting, calculations).

## Google OAuth
See [`oauth.md`](./oauth.md) for the end-to-end flow (client → Google → our `/auth/google` → our JWT) and required env vars.

## Best Practices
1. **Absolute paths**: Configure `babel.config.js` and `tsconfig.json` to use aliases (e.g., `~components/Button`).
2. **Typing**: Strict typing of components through `interface` and `type`. Avoid using `any`.
3. **Separation of logic and UI**: Use custom hooks (`hooks/`) to encapsulate screen logic.
4. **Styling**: For styling, use `StyleSheet.create` or specialized libraries like NativeWind (Tailwind for RN), while staying consistent with the Design System.
