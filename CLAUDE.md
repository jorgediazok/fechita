# CLAUDE.md

Guía para Claude Code al trabajar en este repositorio.

## Estado del proyecto

**Fase: loop central funcionando de punta a punta, con la primera pasada de diseño visual real ya en el código.** El proyecto Next.js vive en [web/](web/) (`como-van-web`) — App Router + TypeScript + Tailwind, PWA básica, Mongoose con los modelos de las capas 1-2, conectado a un cluster real de MongoDB Atlas (`MONGODB_URI` en `web/.env.local`, no versionado). Ya anda: login de desarrollo con selección de club real (auth de mentira por cookie, sin password — ver "Auth" abajo), sync de partidos (`src/lib/sync.ts`) contra un proveedor simulado de API-Football (`API_FOOTBALL_MODE=mock`), carga de pronósticos con fichas 1-X-2 + bonus de resultado exacto opcional, y cálculo de puntos 5/3/0. Falta: conectar el proveedor real de API-Football (ya tenemos key, pero el free tier no sirve para temporada actual — ver más abajo), reemplazar el auth de mentira por NextAuth, y la capa real de ligas semanales (hoy `/liga` es una vista previa visual con datos hardcodeados, no conectada).

### Identidad visual (decidida 2026-09-05, ver `docs/product-design.md`)
Fondo oscuro casi negro, degradé de marca violeta→magenta con glow (nunca colores planos ni sombras duras — se probaron y se sintieron "retro"), tipografía Anton (`--font-display`) + Manrope (`--font-body`), definidas en `web/src/app/layout.tsx` y `globals.css`. La pantalla principal es `/duelos` (no `/partidos` — renombrada a propósito): muestra tu posición real entre los usuarios registrados (no un duelo 1 contra 1 inventado, y no una lista de partidos como el resto de los prodes) y ahí mismo se cargan los pronósticos. `/liga` es una vista previa visual de la futura liga semanal, con datos de mentira — no está conectada a un modelo real todavía.

### Modelo de `Prediction` (cambió — ya no son dos números obligatorios)
`predictedDirection` (`home`/`draw`/`away`) es siempre requerido — es la ficha 1-X-2, calcada de una boleta de quiniela real. `predictedHomeScore`/`predictedAwayScore` ahora son **opcionales**: solo se completan si el usuario abre el desplegable "¿Exacto? +5 pts". `calculatePoints` (`src/lib/points.ts`) da 5 solo si hay marcador exacto Y coincide, 3 si la dirección coincide (haya o no marcador cargado), 0 si no. Ojo si tocás esto: antes de este cambio los pronósticos siempre tenían marcador — cualquier dato viejo en la DB puede no tener `predictedDirection`.

### Auth (temporal)
`src/lib/session.ts` + `src/app/login/` implementan un login de mentira: el usuario elige un nombre, se crea/busca un `User` con email sintético `<slug>@dev.local`, y la sesión se guarda en una cookie httpOnly con el `_id`. Sin contraseña ni proveedor real. Reemplazar por NextAuth es una decisión pendiente (ver `docs/product-design.md`), no bloquea seguir construyendo el resto del loop.

### API-Football (modo mock)
`src/lib/api-football/` define la interfaz `FixtureProvider` con dos implementaciones: `mockFixtureProvider` y `liveFixtureProvider`. El modo se elige con `API_FOOTBALL_MODE` (`mock` | `live`) en `.env.local`. La página `/duelos` muestra un panel dev (solo en modo mock) para sincronizar, simular resultados (`setMockResult`) y reiniciar un partido para volver a probar (`resetMockFixture`).

**Importante — el free tier de API-Football NO sirve para partidos actuales**: probado contra la API real (2026-09-06), el plan gratis solo da acceso a temporadas 2022-2024, no a la temporada en curso. El plan pago arranca en ~$19/mes (Pro, 7.500 req/día). Se investigaron alternativas gratuitas (football-data.org no cubre Argentina/Sudamérica en su free tier; TheSportsDB limita a 15 requests de por vida el endpoint de fixtures de temporada) — ninguna sirve. Decisión: seguir en modo mock hasta que el proyecto justifique pagar.

`mockFixtureProvider` usa datos **reales** como semilla: `src/lib/api-football/data/liga-profesional-fechas-1-3.json` son las fechas 1, 2 y 3 de la Liga Profesional Argentina, temporada 2024, sacadas de la API real (equipos, ids, logos y fixtures reales) — solo las fechas de kickoff se corren al futuro en runtime (mismo espaciado relativo entre fechas) para poder cargar pronósticos antes del "kickoff". Los `externalId` de partidos y equipos son reales, así que al pasar a `live` no hace falta remapear nada — alcanza con cambiar `API_FOOTBALL_MODE`, la key, y el `externalId`/`season` de la competencia en `src/lib/competitions.ts` (Liga Profesional Argentina = league id **128** en API-Football, confirmado contra la API real).

Cuando se quiera sumar el resto del alcance del doc de producto (Copa Argentina, Libertadores, Sudamericana), los league ids de Argentina ya confirmados son: Copa Argentina 130, Primera Nacional 129, Primera B Metropolitana 131, Primera C 132, Primera D 133 (Libertadores/Sudamericana son competencias CONMEBOL, no aparecen bajo country=Argentina — hay que buscarlas aparte).

## Qué es este proyecto

Una app de prode (pronósticos de fútbol) enfocada 100% en el público argentino, pensada como proyecto de portfolio con potencial de uso real. El diseño completo del producto — por qué existe, contra quién compite, todas las mecánicas de juego, y el modelo de datos de las primeras dos capas — está en **[docs/product-design.md](docs/product-design.md)**. Leé ese archivo completo antes de proponer cambios de producto o de arquitectura: ya se investigó el mercado (GameOn, Promiedos, Sofascore, Prode Master y otros) y se tomaron decisiones deliberadas de scope que no conviene re-litigar sin motivo.

## Cómo seguir sin perder el hilo

Este proyecto nació de una conversación larga en el repo `portfolio` (carpeta hermana, `~/Developer/portfolio`) donde se pensó de cero: la idea, el análisis competitivo, el nombre, y todas las reglas del juego. Todo lo relevante de esa charla ya está volcado en `docs/product-design.md` — no hace falta ir a buscar la conversación original para tener contexto, este documento es la fuente de verdad actualizada.

Cuando el usuario retome el trabajo acá:
1. Si pregunta "¿en qué quedamos?" o similar: resumí desde `docs/product-design.md`, no inventes ni asumas decisiones que no estén ahí.
2. Si el documento y el código ya escrito se contradicen (por ejemplo, el modelo de datos real terminó siendo distinto al propuesto): confiá en el código, y actualizá `docs/product-design.md` para que refleje la realidad — el doc se queda desactualizado si no se mantiene.
3. Las decisiones marcadas como "pendiente" o "no confirmado" en el doc (ej. el nombre de la app, cómo publicar en las stores) son temas abiertos — no los des por cerrados, preguntá si hace falta decidir antes de construir algo que dependa de esa decisión.

## Nombre del proyecto

**"Cómo Van" es un placeholder**, no el nombre final — todavía no se decidió (ver sección "Nombre de la app" en `docs/product-design.md` para el historial de opciones evaluadas y descartadas). Si en algún momento el usuario dice "ya tengo el nombre", actualizá este archivo, `docs/product-design.md`, y el nombre del paquete/carpeta si corresponde.

## Stack técnico (scaffold hecho en [web/](web/))

- Next.js + TypeScript (App Router, Tailwind)
- MongoDB (Mongoose) — modelos de capas 1-2 ya definidos en `web/src/models/`, falta conectar a una instancia real
- Datos de partidos vía API-Football (api-football.com), sincronizados por cron a la DB propia — nunca exponer esa API externa directo al cliente (sync todavía sin implementar)
- PWA desde el arranque (manifest + metadata mobile ya en `web/src/app/`). Presencia en Play Store/App Store vía Capacitor queda como decisión pendiente (ver `docs/product-design.md`), a retomar una vez que el loop central esté funcionando.

## Orden de construcción sugerido

Seguir el orden ya acordado en `docs/product-design.md`: primero el loop central (sincronizar partidos + cargar pronósticos + calcular puntos), recién después las capas aditivas (grupos de amigos, ligas semanales con ascenso/descenso, insignias, trivia diaria).
