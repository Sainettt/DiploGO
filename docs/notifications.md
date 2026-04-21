# Push Notifications — DiploGO

Документ описує як влаштовані щоденні пуш-нагадування в DiploGO: від запиту дозволу в онбордингу до доставки повідомлення в потрібний час.

## Коротко про архітектуру

DiploGO використовує **гібридний підхід**:

1. **Локальні (local) сповіщення** — щоденні стрік-нагадування. Плануються на пристрої через `expo-notifications`. Працюють офлайн, без сервера.
2. **Віддалені (remote) сповіщення** — для майбутнього використання (досягнення, стрік-фріз, соціальні події). Потребують Expo Push Token, який зберігається на беку.

Це найпоширеніший паттерн у Duolingo-подібних додатках: щоденні однотипні нагадування — локальні, подієві повідомлення — від сервера.

## Чи потрібно серверу знати про дозвіл?

**Так, але з нюансом.**

| Що зберігається | Навіщо |
| --- | --- |
| `OnBoardingSettings.pushNotifications: boolean` | **User preference** — це вибір користувача ("хочу нагадування"). Потрібно щоб після перевстановлення / входу на іншому пристрої відновити налаштування. |
| `User.expoPushToken: string?` | **Device token** — адреса пристрою, на яку сервер відправлятиме пуші через Expo Push Service. Прив'язаний до конкретного пристрою, не до користувача глобально. |

**OS-level permission** (те, що користувач натиснув "Allow" у системному діалозі) на сервері не зберігається напряму — це стан пристрою. Ми його перевіряємо на клієнті через `Notifications.getPermissionsAsync()`. Якщо користувач заборонив в налаштуваннях ОС — `expoPushToken` буде відсутній, сервер це побачить.

Сервер приймає рішення відправляти пуш, перевіряючи **обидва**: `pushNotifications === true` AND `expoPushToken !== null`.

## Що зроблено в кодовій базі

### Backend
- `api/prisma/schema.prisma` — додано `User.expoPushToken: String?`
- `api/src/users/users.module.ts` — новий модуль
- `api/src/users/users.controller.ts` — `PATCH /users/me/push-token` (захищено `JwtGuard`)
- `api/src/users/users.service.ts` — оновлює токен у БД
- `api/src/app.module.ts` — зареєстровано `UsersModule`

> Після змін у schema: `cd api && npx prisma migrate dev --name add_expo_push_token`

### Mobile
- `mobile/src/services/notifications.ts` — `requestNotificationPermissions()`, `scheduleDailyReminders()`, `cancelDailyReminders()`, `getExpoPushToken()`, `configureNotificationHandler()`
- `mobile/src/utils/notificationMessages.ts` — пул Duolingo-style фраз + `getRandomReminderMessage()`
- `mobile/src/api/user.api.ts` — `userApi.updatePushToken(token)`
- `mobile/app/onboarding/notifications.tsx` — реальна логіка замість заглушки
- `mobile/app/_layout.tsx` — один раз конфігурує handler; на запуску додатку re-schedules нагадування та обробляє тапи по нотифікаціях (cold + warm start)

### Dependencies (install before running)
```bash
cd mobile
npx expo install expo-notifications expo-device
```

### App config
Для production-збірки (EAS) додайте в `mobile/app.json`:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#BB86FC"
        }
      ]
    ]
  }
}
```

## Ітераційний flow

### Крок 1 — Користувач у онбордингу бачить "Never miss a day"
Екран `mobile/app/onboarding/notifications.tsx`. Дві кнопки: **Allow Notifications** / **Maybe Later**.

### Крок 2 — Тап на "Allow Notifications"
`handleAllow()` робить:
1. `requestNotificationPermissions()` — системний діалог iOS/Android. Якщо вже granted — діалог не показується.
2. На Android створюється канал `daily-reminder` (обов'язково з Android 8+).
3. Якщо permission granted:
   - `scheduleDailyReminders()` планує **14 локальних нотифікацій** (по одній на кожен з наступних 14 днів о 19:00 локального часу), кожна з випадковим повідомленням з пула.
   - `getExpoPushToken()` отримує Expo Push Token цього пристрою.
   - `userApi.updatePushToken(token)` зберігає токен у БД через `PATCH /users/me/push-token`.
4. `onboardingApi.save({ pushNotifications: true, … })` — зберігає preference.
5. `router.replace('/home')`.

### Крок 3 — Тап на "Maybe Later" (або permission denied)
1. `cancelDailyReminders()` — на всяк випадок.
2. `userApi.updatePushToken(null)` — очищає токен на сервері.
3. `onboardingApi.save({ pushNotifications: false, … })`.
4. `/home`.

### Крок 4 — Кожен запуск додатка (після логіну)
`_layout.tsx` при монтуванні:
1. Читає JWT з `AsyncStorage`. Якщо немає — нічого не робить.
2. Перевіряє `hasNotificationPermission()` (OS-level).
3. Тягне `onboardingApi.getOnBoarding()`.
4. Якщо `pushNotifications === true` **і** permission granted → `scheduleDailyReminders()` ще раз (скидає старі, ставить нові на наступні 14 днів з свіжими рандомними фразами).

Це вирішує дві проблеми:
- Користувач не відкривав додаток 14 днів → 14 запланованих нотифікацій закінчилися → після першого відкриття знову є 14 днів запасу.
- Повідомлення не "застряють" на одній фразі — кожен запуск генерує нову ротацію.

### Крок 5 — О 19:00 пристрій показує сповіщення
Це робить ОС локально — сервер не задіяний. Користувач бачить баннер/звук.

### Крок 6 — Тап на нотифікацію
`_layout.tsx` має `Notifications.addNotificationResponseReceivedListener()`. З `data.route = '/home'` робиться `router.replace('/home')`. Для cold-start (додаток був закритий) — `Notifications.getLastNotificationResponseAsync()` повертає той самий об'єкт при старті.

## Чому саме 14 нотифікацій, а не одна "щоденна повторювана"?

Є два варіанти в `expo-notifications`:

**A. Один тригер `CALENDAR/DAILY` з `repeats: true`:**
- Плюс: одна нотифікація назавжди.
- Мінус: **повідомлення фіксоване** — не можна рандомізувати фразу. Як у Duolingo кожен день різне — не вийде.

**B. Пакет одноразових тригерів (наш варіант):**
- Плюс: кожна нотифікація має своє унікальне повідомлення.
- Мінус: треба періодично re-schedule.

Оскільки Duolingo-style передбачає різноманіття фраз — ми обрали B. iOS дозволяє до 64 запланованих пушів, так що 14 — це безпечно.

## Server-side (майбутнє розширення)

Для відправки пуша з сервера потрібен Expo Push Token. Endpoint:
```
POST https://exp.host/--/api/v2/push/send
Content-Type: application/json

{
  "to": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "title": "You earned a badge!",
  "body": "10-day streak — here's a freeze!",
  "data": { "route": "/profile/achievements" }
}
```

Приклад сценарію: нічний cron на беку перевіряє, у кого стрік на межі зриву (не було activity сьогодні, але є вчора), і шле їм особистий пуш. Це виходить за межі MVP — тому поки що не реалізовано, але фундамент (токен в БД) вже є.

## Best practices

1. **Запитуй дозвіл у контексті**, не одразу при старті. Ми робимо це на 3-му кроці онбордингу — користувач вже зрозумів цінність додатку.
2. **Поясни "навіщо"** перед системним діалогом (у нас екран "Never miss a day" — саме це).
3. **Поважай відмову**. Якщо користувач сказав "Maybe Later" — не перепитуй. Дай опцію увімкнути в налаштуваннях додатку пізніше.
4. **Не спам**. Одне нагадування на день — не більше.
5. **Рандомізуй текст** — інакше нотифікацію перестають помічати ("banner blindness").
6. **Deep link у data payload** — щоб тап відкривав релевантний екран (`/home`, `/streak`, `/challenges`…), не просто лаунчив застосунок.
7. **Android channels**. На Android 8+ без каналу нотифікація **не з'явиться**. Ми створюємо `daily-reminder` в `ensureAndroidChannel()`.
8. **Check permission на старті**. Користувач міг відкликати дозвіл у налаштуваннях ОС — бекапи нагадувань треба зупинити.
9. **Re-schedule при логіні/логауті**. При логауті — `cancelDailyReminders()` + `updatePushToken(null)`, щоб не слати пуші колишньому юзеру з цього пристрою.
10. **Не плануй на минуле**. Якщо "19:00 сьогодні" вже пройшло — перший push йде завтра. Код це обробляє (`i === 1 && when <= now`).
11. **Токен — це пристрій, не юзер**. Один юзер на 2 пристроях = 2 токени. Для production-готовності краще модель `UserDevice { id, userId, expoPushToken, platform, lastSeen }`, але MVP обходиться одним полем у User.
12. **Ніколи не шли пуш без перевірки preference**. Сервер повинен шукати `WHERE pushNotifications = true AND expoPushToken IS NOT NULL`.
