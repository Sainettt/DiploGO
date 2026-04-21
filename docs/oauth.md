# Google OAuth — How It Works in DiploGO

Цей документ описує ітераційно, як влаштований вхід через Google: від натискання кнопки «Continue with Google» в застосунку до моменту, коли сервер видає свій власний JWT-токен, яким захищаються всі інші ендпоінти.

## Чому ми використовуємо accessToken, а не idToken

**Коротко:** Android/iOS OAuth-клієнти Google Cloud **не видають `id_token`** — тільки `access_token`. Це обмеження на рівні Google, не баг конфігурації.

**Детально:** У Google Cloud Console OAuth-клієнти мають тип: **Web**, **Android**, або **iOS**. Нативні (Android/iOS) клієнти ідентифікуються через package name + SHA-1 fingerprint (без client_secret). Token endpoint Google (`oauth2.googleapis.com/token`) не включає `id_token` у відповідь для native-клієнтів з міркувань безпеки.

Тому наш підхід:
1. **Мобільний** отримує `accessToken` (він завжди є у відповіді Google)
2. **Бекенд** перевіряє його через `GET https://www.googleapis.com/oauth2/v3/userinfo` — запит іде з сервера, Google повертає `{ email, sub, name, picture }`. Це так само безпечно, як перевірка підпису `id_token`, бо запит server-to-server.

---

## Загальна схема

```
[Mobile App] ──(1) promptAsync()──► [Google Sign-In UI]
                                          │
                                   (2) user approves
                                          │
[Mobile App] ◄─(3) { accessToken }───────┘   ← id_token відсутній (native client)
     │
     │ (4) POST /auth/google { accessToken }
     ▼
[NestJS API] ──(5) GET /oauth2/v3/userinfo ──► [Google API]
                                                     │
                                          { email, sub, name, picture }
     │                                               │
     │◄────────────────────────────────────────────┘
     │ (6) find or create User by email
     ▼
[PostgreSQL]
     │
     │ (7) jwt.sign({ sub, email })
     ▼
[Mobile App] ◄─(8) { access_token (наш JWT), user }
     │
     │ (9) AsyncStorage.setItem('jwt_token', …)
     ▼
подальші запити з Authorization: Bearer <наш JWT>
```

---

## Компоненти

### Client (mobile)
| Файл | Роль |
| --- | --- |
| `mobile/src/api/oauth.api.ts` | `useGoogleAuth()` — хук із `Google.useAuthRequest`; `loginWithGoogle(accessToken)` — POST на `/auth/google` |
| `mobile/src/hooks/useGoogleSignIn.ts` | Спільний хук для login/register: обробляє `response` (success/error/cancel), викликає `loginWithGoogle`, визначає куди перенаправити (home vs onboarding) |
| `mobile/app/(auth)/login.tsx` | Екран входу, викликає `signIn()` з хуку |
| `mobile/app/(auth)/register.tsx` | Екран реєстрації, викликає `signIn()` з хуку |

### Server (api)
| Файл | Роль |
| --- | --- |
| `api/src/auth/auth.controller.ts` | `POST /auth/google` |
| `api/src/auth/dto/google-auth.dto.ts` | DTO `{ accessToken: string }` |
| `api/src/auth/auth.service.ts` | `googleAuth(dto)` — верифікує accessToken через userinfo, find-or-create User, повертає наш JWT |

### Змінні середовища
| Де | Змінна | Для чого |
| --- | --- | --- |
| `mobile/.env` | `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | OAuth-клієнт типу **Android** у Google Cloud |
| `mobile/.env` | `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | OAuth-клієнт типу **iOS** |
| `mobile/.env` | `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | OAuth-клієнт типу **Web** (необов'язковий, але корисний для майбутнього web-клієнта) |

> `GOOGLE_CLIENT_ID` у `api/.env` більше не потрібен для Google OAuth — бекенд звертається до userinfo endpoint без Client ID.

---

## Ітераційний flow

### Крок 1 — Користувач натискає «Continue with Google»
Хук `useGoogleSignIn` викликає `signIn()` → `promptAsync()` з `expo-auth-session/providers/google`. `expo-web-browser` відкриває системний браузер / Custom Tab з URL:
```
https://accounts.google.com/o/oauth2/v2/auth
  ?client_id=<ANDROID_CLIENT_ID>
  &redirect_uri=<expo-redirect-uri>
  &scope=openid+profile+email
  &response_type=code
  &code_challenge=<PKCE-challenge>
  &code_challenge_method=S256
```

### Крок 2 — Користувач підтверджує доступ
Google валідує `client_id` та `redirect_uri` (тому важливо, щоб SHA-1 підпису Android / bundleId iOS були зареєстровані у Google Cloud Console) і редиректить назад в застосунок.

### Крок 3 — Expo отримує authorization code та обмінює на токени
Отримавши `code`, `expo-auth-session` робить POST на `https://oauth2.googleapis.com/token` з `code_verifier` (PKCE). Google повертає JSON для **native client**:
```json
{
  "access_token": "ya29...",
  "expires_in": 3599,
  "scope": "openid email profile",
  "token_type": "Bearer"
}
```
⚠️ `id_token` відсутній — це нормально для Android/iOS-клієнтів.  
Expo кладе відповідь у `response.authentication`. Хук бере `response.authentication?.accessToken`.

### Крок 4 — Клієнт відправляє accessToken на бекенд
`loginWithGoogle(accessToken)` робить `POST /auth/google` з тілом `{ accessToken }`. Authorization-header не ставиться — ми ще не аутентифіковані нашим сервером.

### Крок 5 — Бекенд верифікує accessToken через Google userinfo
`AuthService.googleAuth()` робить:
```
GET https://www.googleapis.com/oauth2/v3/userinfo
Authorization: Bearer <accessToken>
```
Google перевіряє accessToken і повертає:
```json
{
  "sub": "109912345678901234567",
  "email": "user@gmail.com",
  "email_verified": true,
  "name": "John Doe",
  "picture": "https://..."
}
```
Якщо токен невалідний (прострочений, підроблений) — Google поверне HTTP 401, бекенд кидає `UnauthorizedException`.

### Крок 6 — Find-or-create User
З відповіді беруться `email`, `sub` (Google user id), `name`, `picture`.
- Якщо юзер з таким `email` існує і ще не пов'язаний з Google — додається `googleId` та `avatarUrl`.
- Якщо не існує — створюється новий (`passHash = null`, `username = name ?? email.split('@')[0]`).

### Крок 7 — Видача нашого JWT
`buildTokenResponse(userId, email)` підписує `{ sub, email }` секретом з `api/.env` (`JWT_SECRET`) через `@nestjs/jwt`. Повертається:
```json
{
  "access_token": "<наш JWT>",
  "user": { "id": "...", "email": "..." }
}
```

### Крок 8 — Клієнт зберігає JWT
`loginWithGoogle()` кладе `access_token` в `AsyncStorage['jwt_token']`. Хук вирішує куди перейти: якщо `onboardingApi.getOnBoarding().onBoardingCompleted === true` — на `/home`, інакше — на `/onboarding/purpose`.

### Крок 9 — Подальші запити
`mobile/src/api/api.client.ts` через Axios request interceptor автоматично вішає `Authorization: Bearer <jwt>` з `AsyncStorage`. Якщо сервер відповідає 401 — interceptor очищає токен і повертає на логін.

---

## Типові помилки

| Симптом | Причина | Що робити |
| --- | --- | --- |
| `response.authentication.idToken === undefined` | Native Android/iOS клієнт ніколи не повертає `id_token` — це обмеження Google | Використовувати `accessToken` (вже реалізовано) |
| `response.type === 'error'` з `invalid_client` | `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` не відповідає package name / SHA-1 у Google Cloud | Перевірити OAuth Clients у Google Cloud Console |
| HTTP 401 від Google userinfo на бекенді | `accessToken` прострочений (живе ~1 год) або підроблений | Повторний вхід; на клієнті `expo-auth-session` автоматично не оновлює токен |
| Redirect не повертається в застосунок | Не викликано `WebBrowser.maybeCompleteAuthSession()` на верхньому рівні модуля | Вже викликано в `oauth.api.ts` |
| `response.type === 'cancel'` або `'dismiss'` | Користувач закрив Google Sign-In | Просто скидається `loading: false`, помилка не показується |
