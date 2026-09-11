# Fechita

Prode (pronósticos de fútbol) enfocado 100% en el público argentino. Pensado como proyecto de
portfolio con potencial de uso real: identidad local + diseño cuidado + el eje puesto en la
competencia social (ligas con ascenso/descenso, grupos de amigos), no solo en acertar resultados.

**Estado:** el loop central anda de punta a punta y las capas sociales (ligas por fecha, grupos
privados, bots, insignias, racha, notificaciones) están sobre un modelo real y auth real. Los
partidos salen de **The Odds API** (free tier, temporada argentina en curso). El registro tiene
un primer nivel de hardening (rate limit + honeypot + verificación de email armada pero
**desactivada** hasta tener un dominio propio verificado en Resend — ver "Seguridad del
registro" más abajo); el consentimiento de Google OAuth ya está **publicado** (no requirió
revisión de Google, los scopes son básicos), así que cualquiera puede entrar por Google, no
solo test users. Falta: trivia diaria y, si hace falta más que rate limit + honeypot antes de
difundir la app más ampliamente, Cloudflare Turnstile. El logo ya tiene una primera versión
de símbolo —un banderín de córner sobre un cuadrado con degradé (`BrandMark.tsx`)— usado en
favicon/PWA/login/landing; meter ese banderín como la "i" dentro de la palabra "fechita" sigue
pendiente de trabajo tipográfico fino.

El diseño completo del producto —por qué existe, contra quién compite, todas las mecánicas y las
decisiones de scope— está en **[`docs/product-design.md`](docs/product-design.md)**. Notas de
arquitectura para trabajar en el repo, en **[`CLAUDE.md`](CLAUDE.md)**.

---

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, Server Components, Server Actions), TypeScript, Turbopack |
| Estilos | Tailwind v4, tipografía Manrope (`font-display` = Manrope 800) |
| Base de datos | MongoDB + Mongoose (cluster real en Atlas) |
| Auth | NextAuth v5 / Auth.js — Google OAuth + email/password, sesión JWT, sin adapter de DB |
| Datos de partidos | Fuente intercambiable detrás de `FixtureProvider` (ver abajo), sync a la DB propia |
| Email | [Resend](https://resend.com) (free tier) vía `fetch` directo a su API REST, sin SDK — verificación de email |
| PWA | manifest + metadata mobile desde el arranque |
| Deploy | Vercel, región `gru1` (São Paulo, misma región que el cluster de Atlas) — cron de resultados vía GitHub Actions / cron-job.org |

> **Ojo:** Next.js 16 tiene breaking changes respecto de versiones anteriores (entre otras,
> `middleware.ts` → `proxy.ts`). Ver `web/AGENTS.md`.

---

## Estructura del repo

```
fechita/
├── docs/product-design.md   # fuente de verdad del producto: mecánicas, decisiones, scope
├── CLAUDE.md                 # notas de arquitectura / cómo trabajar en el código
├── docker-compose.yml        # MongoDB local para desarrollo
├── .github/workflows/sync.yml # cron externo que dispara /api/cron/sync
└── web/                       # la app Next.js (paquete `fechita-web`)
    ├── src/
    │   ├── app/               # rutas (App Router)
    │   │   ├── page.tsx           # landing pública
    │   │   ├── pronosticos/       # pantalla principal: tu posición + cargar la fecha
    │   │   ├── liga/              # tu liga de la fecha (grupo, categoría, ascenso/descenso)
    │   │   ├── grupos/            # grupos privados de amigos
    │   │   ├── perfil/            # perfil + cambiar club (equipo/), mi carrera (carrera/),
    │   │   │                      # insignias (insignias/), borrar cuenta (eliminar/)
    │   │   ├── reglas/            # "cómo se juega", pública
    │   │   ├── legal/             # términos/privacidad (versión inicial, honesta), pública
    │   │   ├── login/ signup/ onboarding/ verificar-email/
    │   │   └── api/
    │   │       ├── auth/[...nextauth]/
    │   │       └── cron/sync/     # endpoint de sincronización (decide si pega a la API)
    │   ├── lib/
    │   │   ├── fixtures/         # FixtureProvider + implementaciones (ver "Fuente de partidos")
    │   │   ├── sync.ts            # trae fixtures → upsert Match/Team → califica predicciones
    │   │   ├── leagues.ts         # ligas por fecha: grupos, ascenso/descenso, ganador de la fecha
    │   │   ├── groups.ts          # grupos privados
    │   │   ├── bots/              # 50 usuarios bot que pronostican solos
    │   │   ├── badges/            # catálogo de insignias + cálculo de racha (currentRoundStreak)
    │   │   ├── profile.ts         # stats de carrera + historial de fechas para /perfil
    │   │   ├── push/              # web push: claves VAPID, envío, dedupe, mensajes
    │   │   ├── notifications.ts   # feed in-app (la campanita) sobre NotificationLog
    │   │   ├── email/             # envío de mail (Resend) para la verificación
    │   │   ├── emailVerification.ts # tokens + gate canParticipate() (ver "Seguridad del registro")
    │   │   ├── rateLimit.ts       # rate limit por IP sobre Mongo, para signup/login
    │   │   ├── points.ts          # cálculo 5 / 3 / 0
    │   │   ├── tiers.ts           # categorías D → C → B → NACIONAL → PRIMERA
    │   │   ├── competitions.ts    # qué competencias se sincronizan
    │   │   ├── auth.ts / session.ts / db.ts / site.ts
    │   └── models/               # schemas de Mongoose
    └── scripts/                  # seed-leagues / seed-bots (corren con tsx)
```

---

## Arranque local

**Requisitos:** Node 20+, Docker (para Mongo) o un MongoDB accesible.

```bash
# 1. MongoDB local
docker compose up -d          # levanta mongo:7 en localhost:27017

# 2. App
cd web
npm install
cp .env.example .env.local    # y completá las variables (ver abajo)
npx web-push generate-vapid-keys   # opcional: pegá el par en .env.local para probar notificaciones

# 3. Datos de prueba (modo mock: no necesita ninguna API key)
#    con FIXTURE_SOURCE=mock, abrí /pronosticos y usá el panel dev para "Sincronizar
#    partidos ahora", o corré el seed directamente:
npm run seed                  # crea usuarios de prueba, bots y pronósticos con spread

# 4. Correr
npm run dev                   # http://localhost:3000
```

### Variables de entorno (`web/.env.local`)

| Variable | Para qué | Requerida |
|---|---|---|
| `MONGODB_URI` | Conexión a Mongo (`mongodb://localhost:27017/fechita` en local) | sí |
| `FIXTURE_SOURCE` | `mock` \| `theoddsapi` \| `replay` (uno a la vez) | sí (default `mock`) |
| `THE_ODDS_API_KEY` | Key de [the-odds-api.com](https://the-odds-api.com) — free tier, sin tarjeta, 500 créditos/mes. Solo si `FIXTURE_SOURCE=theoddsapi` (`mock` y `replay` no necesitan ninguna key) | si `theoddsapi` |
| `CRON_SECRET` | Secreto para autorizar `/api/cron/sync` | sí en prod |
| `AUTH_SECRET` | Secreto de NextAuth (`openssl rand -base64 32`) | sí |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | OAuth Client ID de Google Cloud Console | solo para el botón de Google |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | Par de claves web push (`npx web-push generate-vapid-keys`) | no (sin ellas las notificaciones quedan desactivadas) |
| `VAPID_SUBJECT` | `mailto:` o URL de contacto para el push | con las VAPID keys |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Igual que `VAPID_PUBLIC_KEY` (la usa el cliente para suscribirse) | con las VAPID keys |
| `RESEND_API_KEY` | Key de [resend.com](https://resend.com) (free tier, sin tarjeta) para el mail de verificación. Sin ella `sendEmail()` es no-op | no (sin ella nadie recibe el mail, la app funciona igual) |
| `EMAIL_FROM` | Remitente del mail de verificación (default el dominio de pruebas de Resend, que solo entrega al dueño de la cuenta) | no |
| `REQUIRE_EMAIL_VERIFICATION` | `"true"` para **exigir** el mail confirmado antes de pronosticar o crear/unirse a un grupo | no (default `false` — ver "Seguridad del registro") |
| `NEXT_PUBLIC_SITE_URL` | URL pública (metadata OG, QR de la landing). En dev, la IP de LAN para probar el QR desde el celu | no (fallback a localhost) |

---

## Arquitectura

### El loop central

```
Fuente de partidos ──sync──▶ Match / Team / Competition ◀── el usuario carga Prediction (ficha 1-X-2)
                                     │
                              partido termina
                                     │
                              calculatePoints (5 / 3 / 0)  ──▶ Prediction.points
                                     │
                        agregación por fecha ──▶ tabla de la liga ──▶ ascenso / descenso
```

- **Cargar pronósticos** (`/pronosticos`): ficha **1-X-2** (la notación de las boletas de quiniela)
  — tocás la dirección del resultado. Quien se anima al resultado exacto (bonus +5) despliega un
  mini marcador con steppers `−` / `+` (nada de inputs numéricos con flechitas). Al mover el
  marcador la ficha 1-X-2 se recalcula en el acto sin esperar al servidor; el guardado va con
  debounce. Todo en un solo client component, `app/pronosticos/MatchPredictor.tsx`.
  `Prediction.predictedDirection` es siempre obligatorio;
  `predictedHomeScore`/`predictedAwayScore` son opcionales.
- **Cierre de carga**: la carga de cada partido cierra **1 hora antes del kickoff** (no al kickoff).
  Es puro cálculo de tiempo contra `Match.kickoffAt` (`isPredictionLocked()` /
  `PREDICTION_LOCK_LEAD_MS` en `lib/time.ts`) — **nunca llama a la API**. Lo aplican las server
  actions de `pronosticos/actions.ts` (autoridad, reloj del servidor) y el `MatchPredictor` en el
  cliente con un timer que deshabilita la UI al llegar la hora, aunque la pestaña quede abierta.
- **Puntos** (`lib/points.ts`): **5** si acierta el marcador exacto, **3** si acierta solo la
  dirección, **0** si no. Partido anulado del todo → 1 punto flat para quien ya había pronosticado.

### Fuente de partidos (`FIXTURE_SOURCE`)

Interfaz `FixtureProvider` en `lib/fixtures/`, **una implementación activa a la vez**.
`getFixtures(seed, window)` recibe el `CompetitionSeed` entero para que cada fuente numere las
fechas a su manera.

| Valor | Provider | Qué hace | ¿Key? |
|---|---|---|---|
| `mock` | `mockFixtureProvider` | Fixtures simulados, sin red. **Habilita el panel dev** de `/pronosticos` y `/liga` (sincronizar, simular resultados, "Cerrar fecha ahora"). Para iterar mecánicas rápido. | no |
| `theoddsapi` | `theoddsapiFixtureProvider` | **La que va a prod.** [The Odds API](https://the-odds-api.com) — API de cuotas que también da fixtures y resultados. Free tier, sin tarjeta, 500 créditos/mes, temporada argentina en curso. | `THE_ODDS_API_KEY` |
| `replay` | `replayFixtureProvider` | La temporada **real 2024 completa** (JSON congelado en `lib/fixtures/data/`) corrida al presente, ~1 fecha/semana. Datos e IDs reales, cero red. Para demos offline. | no |

Se probaron y descartaron TheSportsDB (free tier limita las listas a 1 resultado) y API-Football
en vivo (free tier solo cubre 2022–2024, plan Pro ~$19/mes). Si The Odds API se queda corto, el
próximo escalón sería TheSportsDB Premium ($9/mes) o API-Football Pro.

The Odds API no da número de fecha (se sintetiza agrupando por huecos > 2.5 días y numerando desde
`competitions.ts#theOddsApiRoundAnchor` — **verificar contra promiedos.com.ar**) ni escudos/IDs de
equipo (se mapean por nombre a IDs de API-Football en `TEAMS`, dentro del provider — esos ids son
el estándar canónico de equipos en toda la app).

### Sync y el cron de resultados

Objetivo: que el usuario vea sus puntos **~10-15 min después del pitazo final** sin quemar créditos.

- **El cron externo ≠ la llamada a la API.** Un disparador (`.github/workflows/sync.yml` cada 10 min,
  o [cron-job.org](https://cron-job.org) — más confiable) pega a `/api/cron/sync`. Eso es gratis.
- **`/api/cron/sync` decide** (`route.ts#decide()`) si vale la pena pegarle a la fuente de partidos:
  - `"recent"` (1 crédito): hay un partido que arrancó hace 105 min – 3 h sin resultado → poleá hasta
    que llegue el score.
  - `"full"` (2 créditos): se viene una fecha y hace > 12 h del último refresco, o hay un resultado
    atrasado, o red de seguridad (> 2 días sin sync).
  - **skip** (0 créditos): martes a jueves sin fútbol.
- 1 crédito = 1 llamada, **no importa cuántos partidos** (`/scores` devuelve todos juntos). Estimado
  ~200-250 créditos/mes de los 500.
- `DevState.lastSyncAt` marca la última llamada real.
- `vercel.json` mantiene un cron 1×/día como red de seguridad (Vercel Hobby limita los crons a 1/día).

### Ligas por fecha (`lib/leagues.ts`)

> **Regla:** cada fecha del campeonato, los mejores de tu grupo suben de categoría y los últimos bajan.
> El #1 es el **ganador de la fecha**.

- Categorías reales del ascenso argentino: **Primera D → C → B → Nacional → Primera División**
  (`User.currentTier`, todos arrancan en la D).
- Grupos de ~24 por `(fecha, categoría)` — `RoundLeagueGroup`, identificado por `roundKey`
  (= `Match.round`, ej. `"Fecha 9"`). Mezclados entre hinchas de distintos clubes a propósito.
- Los puntos de la fecha se agregan en vivo de `Prediction.points` (por `Match.round`).
- **Cierre perezoso**: `closeExpiredGroups()` corre cuando alguien visita `/liga` o `/pronosticos`.
  Cierra un grupo cuando **terminan todos los partidos de la fecha** (o 24 h después del último
  kickoff — fallback para un partido postergado). Top/bottom ~25% (`zoneSize()`) asciende/desciende;
  sin ascenso desde Primera ni descenso desde la D. Después reinscribe a todos en la fecha siguiente.
- El ciclo es **la fecha, no la semana calendario** — una fecha jueves-lunes es una unidad. No hay
  "campeón del torneo" (requeriría un ranking global de Primera, que se descartó); el prestigio de
  largo plazo son las insignias y tu categoría en sí.
- Modo `mock`: botón dev "Cerrar fecha ahora" termina los partidos de la fecha al azar y la cierra.

### Grupos privados de amigos (`lib/groups.ts`)

`Group` (nombre + código de invitación de 6 caracteres, sin `0/O/1/I`) + `GroupMembership`.
Cualquiera con el código se suma — sin roles ni aprobación. El ranking del grupo
(`getGroupLeaderboard`) es de **puntos totales históricos**, no por fecha — un grupo de amigos es
competencia de largo plazo.

### Bots (`lib/bots/`)

20 usuarios con `isBot: true` y `botSkill` (0..1) que dan vida a las ligas mientras haya pocos
jugadores reales. Se muestran con un tag **"BOT"** (nada de rivales encubiertos). `runBots()` corre
después de cada sync `"full"`: para cada bot y cada partido `scheduled` dentro de 12 días sin
pronóstico, crea uno. La estrategia pesa el 1-X-2 por fuerza de equipo (`teamStrength.ts`) + localía,
mezclado con azar según el skill. **RNG determinístico por `(botId, matchId)`** — un re-run nunca
cambia una jugada hecha.

### Notificaciones (`lib/push/`, `lib/notifications.ts`)

Dos superficies sobre los mismos eventos:

- **Push del sistema operativo** (web push / VAPID) — sin dependencias de terceros salvo
  `web-push` para mandar. Service worker solo-push en `public/sw.js` (no cachea nada, el
  offline completo queda fuera de scope), registrado desde `PhoneFrame` vía `<PushRegistrar>`.
  Opt-in con un toggle en `/perfil` (`PushToggle`) más una tarjeta suave la primera vez en
  `/pronosticos` (`PushNudge`), ambos en `components/PushClient.tsx`. Una fila
  `PushSubscription` por dispositivo; el sender (`lib/push/send.ts`) borra las que devuelven
  404/410. **Sin las VAPID keys esta capa queda inerte** y la app funciona igual.
  **iOS**: solo anda con la PWA instalada en la pantalla de inicio (el toggle lo detecta).
- **Campanita in-app** (`NotificationBell`, solo en `/pronosticos`, dentro del hero) — el
  historial de novedades con contador de no leídas y una hoja con la lista. Lee de
  `NotificationLog` vía `lib/notifications.ts` + `app/notifications-actions.ts`. **Funciona
  aunque el push no esté configurado.**

`NotificationLog` (índice único `userId+kind+dedupeKey`, TTL 60 días) cumple las dos cosas:
es el **anti-duplicados** (antes de notificar un evento se inserta ahí; si rebota, ya se
notificó) y guarda el **texto** (`title`/`body`/`url`) + `readAt` para el feed. `sendToUser()`
escribe esa fila siempre; el push del SO es la capa opcional encima. Las notificaciones de
prueba (sin `dedupe`) no entran al feed.

Disparadores (v1, todos reactivos):

| # | Cuándo | Dónde se engancha |
|---|---|---|
| T2 | Terminó una fecha entera → "sumaste N pts" | `lib/push/notify.ts#notifyFinishedRounds`, llamado desde `syncCompetition` |
| T3 | Insignia nueva | `evaluateBadgesForUser` (`lib/badges/award.ts`) |
| T4 | Cerró tu grupo de la fecha → ascenso / descenso / ganador | `closeGroup` (`lib/leagues.ts`) |
| T1 | Notificación de prueba (botón en el toggle) | `perfil/push-actions.ts#sendTestNotification` |
| T5 | Te faltan pronósticos y la carga cierra en ~2h | `lib/push/notify.ts#notifyRoundClosingSoon`, llamado en cada tick de `/api/cron/sync` |

T5 es puro cálculo de tiempo contra `Match.kickoffAt` (no depende de pegarle a la fuente de
partidos): mira el partido más próximo sin arrancar de la fecha actual, y si a su
`predictionLockAt()` (`lib/time.ts`) le quedan entre 0 y 2 horas, avisa a los usuarios reales
inscriptos en esa fecha que todavía no le cargaron un pronóstico a ese partido. Ventana ancha a
propósito (el cron no pega justo en el minuto exacto) — el dedupe por `dedupeKey = roundKey`
evita mandarlo más de una vez por usuario aunque varias corridas caigan adentro de la ventana.

### Insignias, racha y perfil (`lib/badges/`, `lib/profile.ts`)

- **Insignias**: 18 insignias en código (`lib/badges/catalog.ts`, sin colección de catálogo en
  DB — el mismo criterio que `tiers.ts`), en 6 familias: aciertos acumulados, rachas, resultados
  exactos, ascensos de categoría, hitos (ganador de la fecha, superclásico, sorpresa) y una meta
  ("Las tenés todas") por completar las otras 17. Cada usuario ganado se guarda en `UserBadge`.
  Se evalúan (`evaluateBadgesForUser`, `lib/badges/award.ts`) al sincronizar, al cerrar una fecha y
  al abrir `/pronosticos`; los bots quedan afuera. La grilla vive en `/perfil/insignias`
  (`BadgeShowcase`, con el criterio de cada una); ganar una dispara un festejo
  (`BadgeUnlockOverlay`, confeti + resorte) en `/pronosticos`.
- **Racha** (`currentRoundStreak` en `award.ts`): fechas cerradas consecutivas en las que el
  usuario acertó al menos el 50% de sus pronósticos (piso de 3 cargados esa fecha). Se muestra
  como una llama en el hero de `/pronosticos` (`StreakInfo`) y festeja cuando crece
  (`StreakCelebration`), con `LeagueMembership.streakAfter`/`streakSeen` para no repetir el festejo.
- **Perfil enriquecido** (`/perfil` + `/perfil/carrera`): tarjeta de categoría actual y techo
  histórico (`User.bestTier`), chip de racha, y `/perfil/carrera` con 6 stats de por vida
  (puntos, aciertos, % de acierto, exactos, fechas jugadas/ganadas) más el historial fecha por
  fecha — todo calculado en `lib/profile.ts`. `/reglas` (pública) explica las mecánicas del juego;
  `/legal` tiene una primera versión de términos/privacidad (honesta sobre el estado actual,
  sin pretender ser un texto con revisión legal todavía).

### Seguridad del registro (`lib/rateLimit.ts`, `lib/emailVerification.ts`)

Primer nivel de hardening sobre `/signup` y `/login`, sin servicios de terceros:

- **Rate limit por IP** sobre Mongo (`RateLimitHit`, TTL 1h, sin Redis): 5 altas / 10 min en
  signup, 10 intentos / 10 min en login — protege contra registro masivo automatizado y fuerza
  bruta / credential stuffing sin bloquear a un grupo de amigos en la misma red.
- **Honeypot** en `/signup`: un campo oculto (`website`) que ningún humano completa; si llega
  lleno, la acción responde como si el alta hubiese salido bien sin crear nada.
- **Verificación de email**: `User.emailVerified` + `EmailVerificationToken` (TTL 24h) +
  `/verificar-email?token=` + banners en `/pronosticos` y `/grupos`. "Existe la cuenta" ≠
  "participa" — un usuario sin confirmar puede loguearse y mirar la app, pero no cargar
  pronósticos ni crear/unirse a un grupo (`canParticipate()`). Los usuarios de Google ya llegan
  verificados. **Está desactivada por default** (`REQUIRE_EMAIL_VERIFICATION=false`): el
  remitente de prueba de Resend solo entrega al dueño de la cuenta hasta verificar un dominio
  propio, así que exigirla hoy dejaría trabado a cualquier amigo que se registre.

Ninguna de las dos protege contra un atacante dirigido al repo público (los umbrales y el nombre
del honeypot se ven en el código) — el siguiente escalón, si hace falta, es Cloudflare Turnstile.

El consentimiento de Google OAuth ya está **publicado y verificado en la práctica** (2026-09-11):
entra cualquier cuenta de Google sin ningún cartel de "app no verificada" —solo la pantalla
normal de consentimiento ("vas a compartir tu nombre/mail con Fechita") que ve cualquier app,
verificada o no. Confirmado logueándose con una cuenta real que no era test user. Google no
exige el proceso de verificación completa para apps que solo piden los scopes básicos de login
(`openid`/`email`/`profile`, exactamente los que usa Fechita) —por eso no hizo falta nada más
que publicar.

### Auth (`src/auth.ts`)

NextAuth v5, sesión JWT **sin adapter de DB** (deliberado — el adapter manejaría su propia colección
de usuarios, y `Prediction`/`LeagueMembership`/`GroupMembership` ya dependen del modelo `User` de
Mongoose por `userId`). Los callbacks `signIn`/`jwt`/`session` hacen upsert/lookup directo contra
`User`. `getCurrentUser()` (`lib/session.ts`) devuelve el `User` de Mongoose o `null`. Como Google
no da el club de hincha, los usuarios nuevos por Google pasan por `/onboarding`.

### Landing, SEO y PWA

`/` es una landing responsive de verdad (redirige a `/pronosticos` si estás logueado). Metadata OG +
Twitter card, imagen OG generada con `next/og`, `robots.ts` + `sitemap.ts`. Las pantallas de la app
usan `PhoneFrame` (columna angosta) a propósito — es un producto mobile. Accesibilidad: skip-link,
`<nav>` con `aria-current`, `<h1>` por pantalla, foco visible, `prefers-reduced-motion`.

---

## Modelo de datos

| Colección | Qué guarda |
|---|---|
| `User` | nombre, email, club de hincha (`favoriteTeamId`), `currentTier`, `passwordHash` (solo email/password), `isBot` / `botSkill` |
| `Competition` | competencia sincronizada (`externalId`, `slug`, `season`) |
| `Team` | equipo (`externalId` real, nombre, escudo) |
| `Match` | partido (`externalId` único, `round`, equipos, `kickoffAt`, `status`, marcador) |
| `Prediction` | pronóstico de un usuario para un partido (`predictedDirection` + marcador opcional + `points`) |
| `RoundLeagueGroup` | grupo de liga de una fecha (`roundKey`, `tier`, `closesAt`, `status`) |
| `LeagueMembership` | usuario en un grupo (`points` snapshot, `result`, `wonRound`) |
| `Group` / `GroupMembership` | grupos privados de amigos |
| `UserBadge` | insignia ganada por un usuario (`badgeId`, fecha) — el catálogo vive en código, no en DB |
| `PushSubscription` | una suscripción web push por dispositivo (`endpoint` único) |
| `NotificationLog` | anti-duplicados de notificaciones + feed in-app (`title`/`body`/`url`/`readAt`; `userId+kind+dedupeKey` único, TTL 60d) |
| `EmailVerificationToken` | token de confirmación de email (TTL 24h) |
| `RateLimitHit` | un hit por intento de signup/login, para el rate limit por IP (TTL 1h) |
| `DevState` | doc único: `lastSyncAt`, `replayStartedAt` |

Los `externalId` de partidos y equipos son ids reales de API-Football, así que cambiar de fuente de
datos no requiere re-mapear.

---

## Scripts (`web/`)

| Comando | Qué hace |
|---|---|
| `npm run dev` | Server de desarrollo |
| `npm run build` / `npm start` | Build de producción / correrlo |
| `npm run lint` | ESLint |
| `npm test` / `npm run test:watch` | Vitest — unit tests de la lógica pura del juego |
| `npm run seed` | Limpia datos de prueba viejos y crea 6 usuarios por categoría (contraseña `seed1234`) con pronósticos de spread + siembra los 50 bots |
| `npm run seed:clean` | Solo limpia |
| `npm run seed:bots` | Crea/actualiza los 50 bots y les carga los pronósticos de la ventana actual (idempotente) |

---

## Tests

**Vitest** — `npm test` (todo) · `npm run test:watch`. Dos proyectos:

### `unit` — lógica pura (`src/**/*.test.ts`), entorno node, sin DB

| Archivo | Qué verifica |
|---|---|
| `lib/points.test.ts` | El cálculo 5 / 3 / 0, el bonus de marcador exacto, media carga |
| `lib/time.test.ts` | El cierre de la carga 1 h antes del kickoff, ventanas de fechas (con reloj falso) |
| `lib/tiers.test.ts` | Ascenso/descenso entre categorías, topes en D y PRIMERA |
| `lib/leagueZones.test.ts` | El tamaño de la zona de ascenso/descenso (`zoneSize`, ~25% clampeado) |
| `lib/bots/strategy.test.ts` | Determinismo del RNG por `(bot, partido)`, efecto del `skill`, probabilidades bien formadas |
| `lib/push/messages.test.ts` | El copy de cada notificación según el evento |
| `lib/fixtures/theoddsapiProvider.test.ts` | `assignRounds`: numerar fechas agrupando por huecos > 2.5 días desde el ancla real de la primera fecha |
| `lib/emailVerification.test.ts` | `canParticipate`: la política (`REQUIRE_EMAIL_VERIFICATION`) manda sobre el estado real del usuario; default apagado |
| `lib/profile.test.ts` | `bestTierOf`: el techo histórico no baja al descender, y no se rompe sin `bestTier` persistido |
| `lib/badges/catalog.test.ts` | El catálogo de 18 insignias: ids únicos, cada una con rareza/grupo válidos, `BADGE_GROUPS` las reparte todas sin repetir, `coleccionista` es la única de la meta |

Para testear la matemática de zonas aislada se separó a `lib/leagueZones.ts` (mismo criterio
que `lib/tiers.ts`: lo puro va aparte de lo que toca modelos/DB).

### `integration` — lógica que toca la base (`src/**/*.integration.test.ts`)

Contra una **MongoDB en memoria** (`mongodb-memory-server`, `test/setup-integration.ts`) —
no toca ninguna base real. Fixtures en `test/factories.ts`.

| Archivo | Qué verifica |
|---|---|
| `lib/leagues.integration.test.ts` | `closeExpiredGroups`: ascenso del top ~25% y descenso del bottom ~25%, `wonRound` solo del #1, sin ascenso desde PRIMERA ni descenso desde D, reinscripción en la fecha siguiente con el tier actualizado, orden de `getGroupStanding` |
| `lib/badges/streak.integration.test.ts` | `currentRoundStreak`: la regla de ≥3 pronósticos y +50% de aciertos por fecha, el corte en la primera fecha que falla, "la mitad justa no alcanza" |

Pendiente: E2E del loop central (Playwright), y más integración de `evaluateBadgesForUser`.

---

## Deploy (Vercel)

1. Importar `web/` como proyecto Vercel (root dir `web/`, Framework Preset **Next.js** — si sale
   404 en todo, el preset quedó en "Other").
2. Env vars en el dashboard: `MONGODB_URI` (Atlas), `FIXTURE_SOURCE=theoddsapi`, `THE_ODDS_API_KEY`,
   `CRON_SECRET`, `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`, `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` si se
   usa Google, `VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY`/`VAPID_SUBJECT`/`NEXT_PUBLIC_VAPID_PUBLIC_KEY`
   para las notificaciones push (generá el par una vez con `npx web-push generate-vapid-keys` y no lo
   cambies después — rotarlo invalida todas las suscripciones existentes), y `RESEND_API_KEY` /
   `EMAIL_FROM` si querés que salga el mail de verificación (queda armado pero apagado sin
   `REQUIRE_EMAIL_VERIFICATION=true`, y esa var no conviene prenderla sin un dominio propio
   verificado en Resend — ver "Seguridad del registro").
3. **`vercel.json` fija la región en `gru1` (São Paulo)** — a propósito, para estar cerca del
   cluster de Atlas (si el cluster está en otra región de AWS, ajustar esto o el RTT se nota).
4. **Cron de resultados**: Vercel Hobby limita los crons a 1×/día. Para el poleo fino (cada ~10 min),
   configurar un disparador externo que pegue a `https://<dominio>/api/cron/sync` con el header
   `Authorization: Bearer <CRON_SECRET>`:
   - `.github/workflows/sync.yml` (ya está — necesita los secrets `SYNC_URL` y `CRON_SECRET` en el repo), o
   - [cron-job.org](https://cron-job.org) — más confiable, sin límite de minutos.
5. En Google Cloud Console, agregar `https://<dominio>/api/auth/callback/google` como redirect
   URI. El consentimiento OAuth (**OAuth consent screen**) ya está publicado (`Publish App`,
   2026-09-11) con el link de política de privacidad en `https://<dominio>/legal#privacidad`
   y el de condiciones de servicio en `https://<dominio>/legal#terminos` (mismo documento,
   cada uno apunta a su mitad — ver `/legal` en el código); "Authorized domains" quedó vacío
   a propósito (`vercel.app` es un dominio compartido, Google no deja agregarlo). Confirmado
   con una cuenta real (no test user): entra sin ningún cartel de "app no verificada" —Google
   exime de la verificación completa a las apps que solo piden los scopes básicos de login
   (`openid`/`email`/`profile`), que es todo lo que pide Fechita.

---

## Documentación y convenciones

- **[`docs/product-design.md`](docs/product-design.md)** — fuente de verdad del producto. Leer antes
  de proponer cambios de producto o arquitectura: el mercado ya se investigó y hay decisiones de
  scope deliberadas.
- **[`CLAUDE.md`](CLAUDE.md)** — notas de arquitectura, decisiones tomadas al implementar, y trampas
  específicas de este repo.
- **[`web/AGENTS.md`](web/AGENTS.md)** — recordatorio de que Next.js 16 tiene breaking changes.
- Si el doc y el código se contradicen, **el código gana** y hay que actualizar el doc.

## Licencia

Proyecto personal / portfolio. Sin licencia definida.
