# Fechita — Diseño de producto

> Nombre decidido el 2026-09-10: **Fechita**. Ver sección "Nombre de la app" más abajo para el historial de opciones descartadas.

## Qué es

Una app de prode (pronósticos de fútbol) enfocada 100% en el público argentino — no una app de resultados (eso ya lo hacen Promiedos/Sofascore mejor de lo que podríamos replicar) ni un prode genérico multi-país (eso ya lo hace GameOn). El diferencial es identidad local + diseño cuidado + el eje del producto puesto en la competencia social entre amigos y clubes, no solo en acertar resultados.

## Por qué (contexto de la decisión)

Jorge (el creador) vive en Argentina y quiere un proyecto con potencial de uso real, no solo una demo de portfolio. Se validó la idea con experiencia propia: usó "Prode Master" con amigos durante todo un Mundial pese a tener muy mala UI — confirma que el loop de predecir + sumar puntos + competir con conocidos ya es adictivo por sí solo, sin necesidad de más gancho.

## Análisis competitivo (investigado 2026-09-03/04)

- **Promiedos**: la más visitada de Argentina para resultados. UI densa, utilitaria, sin identidad. No es un producto social — utility pura. No competir acá.
- **Sofascore**: stats profundas de partido. Tampoco social. No competir acá.
- **GameOn** (appgameon.com, empresa "Looping") — el competidor real y serio: 4.6★, 13.000+ reseñas combinadas iOS+Android, app nativa liviana (9.8MB), actualizada activamente (julio 2026). Tiene grupos privados + invitación por link + chat grupal + notificaciones en vivo + multi-liga (6 puntos exacto, 4 ganador+diferencia de gol, 3 solo ganador/empate). Pero es **pan-regional/genérico**: mismo producto para Argentina, México, Uruguay, España, Brasil, solo cambiando el nombre local del juego ("prode"/"penca"/"quiniela"/"porra"/"bolão"). Ese genericismo es el hueco que explotamos.
- **Prode Master, ProdeLibre, ProdeCA, Prode Digital, ProdeArgentina**: competidores menores, stacks de bajo esfuerzo (Ionic/Expo + Firebase), sin inversión de diseño — muchos parecen apps armadas rápido para un Mundial y después abandonadas (Jorge vivió esto directamente con Prode Master).

**Conclusión estratégica**: no competir en cobertura de ligas (imposible ganarle a GameOn en eso) ni en datos/stats (imposible ganarle a Promiedos/Sofascore). Competir en: identidad 100% argentina (nada de pan-regional), diseño real (nadie invierte en esto en este nicho), y en la mecánica social (bragging rights, rivalidad de clubes) como eje del producto en vez de un anexo.

## Alcance de competiciones

- Liga Profesional Argentina (core)
- Copa Argentina (bajo costo agregarla, misma API)
- Copa Libertadores
- Copa Sudamericana
- Selección Argentina (Eliminatorias / amistosos)

Deliberadamente **no** se cubren ligas de otros países — ir angosto y profundo en vez de ancho y genérico como GameOn.

## Nombre de la app

**Decidido el 2026-09-10: "Fechita".** El diminutivo de "la fecha" — la unidad que organiza todo el juego (ligas por fecha, ganador de la fecha, ascenso/descenso al cerrar cada fecha). Cálido, argentino, y es el vocabulario que la app ya usa en todos lados ("¿cargaste la fechita?"). Dominios `fechita.app` / `fechita.com.ar` libres al momento de decidir; sin colisión con ninguna app de prode en las stores. El wordmark es "fechita" en minúsculas, Manrope 800.

**Logo:** la dirección elegida es un **banderín de córner reemplazando la "i"** de _fechita_ (mástil del grosor del trazo de las letras, tela triangular con leve caída, degradé violeta→magenta; el ícono de la app es el banderín solo sobre el cuadrado con degradé). Quedó **pendiente de ejecutar en vector** — se exploró a fondo en el chat pero meter la bandera dentro de la palabra sin que choque con la "t" y con la alineación justa necesita trabajo tipográfico fino (Figma/Illustrator). Hasta entonces la app usa solo el wordmark.

**Descartados en el camino (2026-09):**
- Literales (suenan a categoría de sitio, no a marca): "Cómo Van", "Cómo Salieron", "Quién Ganó", "Resultado Final", "Ganó o Perdió", "Buen Resultado".
- Sin razón específica: "La Fija", "Cantala", "La Posta", "Ojo Clínico".
- Colisión: "Tribuna" (marca de medios). "Prodecito" (ya hay una web). "En Racha" (marca de juego de The Rank Group, con `enracha.com.ar` tomado defensivamente; además existe "Racha FC" en la App Store argentina). "Predikta" / "Predix" (productos idénticos ya publicados; Predix es además la plataforma industrial de GE). "Picadito" (`picadito.app` es una app viva de reserva de canchas).
- "La Cargada" (2026-09-08, no le gusta). "Puntazo" (también = navajazo). "Puntero" (carga política negativa en Argentina).
- Descriptivos / sin color local: "Data", "Maestro", "Olfato", "Pálpito" (Jorge: el que menos le gustó), "Ficha", "La Equis", "LEV" (críptico, no comunica).
- Familia "prode + X" — genérica, es lo que hace GameOn.

**Criterio que quedó (2026-09-08):** palabra real, evocativa antes que descriptiva, con un guiño a que es un prode sin decirlo literal. El tirón de Jorge fue siempre hacia el mundo de la ficha / L·E·V / la fecha.

## Mecánicas de juego

### Sistema de puntos por pronóstico
- 5 puntos: resultado exacto
- 3 puntos: acierta solo la dirección (gana/empata/pierde)
- 0 puntos: no acierta nada
- Decidido 2026-09-04: se separó de 4/3/0 a 5/3/0 para incentivar arriesgar el resultado exacto en vez de conformarse con acertar solo la dirección.

### Partidos suspendidos/anulados
- Si se reprograma y juega después (lo normal en Argentina): la predicción espera, sin regla especial.
- Si se anula del todo (raro): 1 punto flat a todos los que ya habían cargado pronóstico para ese partido.

### Grupos privados de amigos
Capa social opcional. Cada grupo elige qué competencias sigue. Se arma con código de invitación / link.

### Ligas por fecha (el diferencial más fuerte)
Inspirado en las ligas de Duolingo, pero con identidad 100% argentina y atado a la unidad natural del fútbol: **la fecha**.

**La regla, en una línea:** *cada fecha, los mejores de tu grupo suben de categoría y los últimos bajan.*

- Categorías con nombres reales de las divisiones del ascenso argentino: **Primera D → Primera C → Primera B → Primera Nacional → Primera División**. Todos arrancan en la D.
- Grupos de ~24 usuarios por (fecha, categoría), **mezclados entre hinchas de distintos clubes a propósito** (la rivalidad entre clubes distintos motiva más que competir con hinchas del propio equipo). Cada usuario muestra el escudo de su club en la tabla.
- **El ciclo es la fecha del campeonato, no la semana calendario** (decidido 2026-09-09). Una fecha que se estira jueves-lunes es una unidad; la semana calendario no significa nada en el fútbol. Los puntos del grupo son la suma de `Prediction.points` de los partidos de esa fecha.
- **Al cerrar la fecha** (cuando terminan todos sus partidos, o 24h después del último kickoff si alguno quedó postergado): top ~25% del grupo asciende, últimos ~25% descienden, el resto se mantiene. `zoneSize()` en `lib/leagues.ts` — con un grupo de ~24 da ~6.
- **Ganador de la fecha**: el #1 de tu grupo esa fecha. Es un highlight + insignia, no una capa aparte (es literalmente el primero del ~25% que asciende).
- Primera División (el techo) no tiene ascenso — ahí compite la élite de la app. Descender de la D no existe (es el piso).
- **Por qué por fecha y no por torneo**: con 5 categorías y un ascenso por torneo (~4 meses) llegar de la D a la Primera lleva ~2 años — mata el juego, sobre todo al arranque con las categorías de arriba vacías. Por fecha, un usuario consistente llega a Primera en ~5 fechas. La rotación rápida **es** el gancho (así funciona Duolingo). Se evaluó un "campeón del torneo" como capa de prestigio de largo plazo y se descartó: contra todos los de Primera sería un ranking global de miles, y el doc ya descartó los rankings globales (desmotivan). El prestigio de largo plazo son las **insignias** y **tu categoría en sí** (estar en Primera es el flex, visible en el perfil).
- Reemplaza una idea anterior de ranking geolocalizado por barrio/provincia (descartada por fricción de permisos/batería de geolocalización en vivo — la pertenencia por club + liga rotativa cumple la misma función de "enganchar al que no tiene amigos futboleros" sin ese costo técnico).
- **Otras competencias (Copa Argentina, Copa de la Liga, Libertadores, Sudamericana)**: fuera del v1. Cuando se sumen se decide si una fecha de copa es una "fecha" más de la misma escalera, o si las internacionales van a una "Liga Continental" aparte (no juegan todos los equipos, es entre semana). **Verificado (2026-09-11) contra el catálogo real de The Odds API**: Libertadores (`soccer_conmebol_copa_libertadores`) y Sudamericana (`soccer_conmebol_copa_sudamericana`) están activas y disponibles — sumarlas es trabajo de ingeniería (sync multi-competencia, más créditos por consultar una fuente extra), no un problema de datos. **Copa Argentina no aparece en el catálogo** — no hay fuente gratis que la cubra hoy (API-Football Pro sí, pero es pago).
- **Pestañas de competencia probadas y sacadas (2026-09-11)**: hubo una implementación (`CompetitionTabs.tsx`, `/pronosticos`) con las 4 pestañas —Liga funcional, las otras 3 mostrando "todavía no está esto"—. Se sacó tras feedback real de gente probando la app: un click que termina en un cartel de "no disponible" es peor primera impresión que no mostrar la pestaña. Vuelven el día que al menos Libertadores/Sudamericana tengan fixtures sincronizados de verdad.
- **Bots (decidido 2026-09-08, ampliado a 50 el 2026-09-11)**: para el arranque, cuando haya pocos jugadores reales, hay 50 usuarios bot (10 por categoría) que pronostican solos antes de cada partido y compiten en las ligas como cualquiera (ascienden/descienden igual). Se muestran con un tag "BOT" — no son rivales encubiertos, es a propósito. Pronostican con un criterio simple (favorito/local pesado por una tabla tosca de fuerza de equipo, con más o menos azar según un "nivel" por bot) para que la tabla tenga spread creíble. Implementación en `web/src/lib/bots/` (ver `CLAUDE.md`). A medida que entren jugadores reales se puede bajar la cantidad o sacarlos.

### Premios
Sin dinero ni apuestas — descartado por riesgo legal/regulatorio de juego en Argentina, validado además con el caso real de la app Pasito (su fundador declaró públicamente que lo que más motiva no es el canje de premios sino el ranking en sí mismo). Alternativa sugerida si se quiere algo "picante" sin plata de por medio: una prenda/desafío para el último de la semana (costumbre ya existente en los prodes de oficina argentinos) — no implementada, solo sugerida.

### Insignias (permanentes, no se resetean como las ligas)
- Por aciertos acumulados: 10, 50, 100, 500
- Por rachas: fechas seguidas acertando
- Por ascensos: la primera vez que se llega a cada categoría (aunque después baje, la insignia queda)
- Por hitos ligados a partidos reales: acertar un Superclásico, acertar una sorpresa/"caño"

### Retención entre fechas (problema: el fútbol no tiene ritmo diario como Duolingo)
- La "racha" del usuario se mide por fecha/partido jugado, no por día calendario — evita forzar un hábito diario artificial sobre un deporte que no lo tiene.
- Para los días sin partido: el gancho es revisar la posición en la liga de la fecha (puede moverse por otros cargando pronósticos), reforzado con notificaciones push inteligentes ("te superaron", "cierra la carga en 2 horas", "estás cerca de ascender").
  - **Estado (v1, 2026-09-09):** web push implementado (`web/src/lib/push/`, ver README §"Notificaciones push"). Opt-in con toggle en `/perfil` + tarjeta post-onboarding en `/pronosticos`. Disparadores activos: terminó la fecha / sumaste N pts (T2), insignia nueva (T3), cierre de fecha con ascenso/descenso/ganador (T4), y una de prueba. **Pendiente:** "cierra la carga en ~2h" (T5, necesita el cron corriendo) y "te superaron" / "cerca de ascender" (T6, necesita snapshot de posición para diffear).
- **Trivia diaria de cultura futbolera** (no ligada a un partido específico): aporta un tope de **5 puntos extra por fecha** a la liga (no ilimitado, para no diluir que el ascenso refleje saber predecir fútbol real de verdad). Todos los aciertos —haya o no tope disponible esa fecha— suman también a un track separado de insignias, sin afectar el ascenso.
  - **Implementado (2026-09-11).** 1 pregunta múltiple choice por día (`web/src/lib/trivia/`), banco de 61 preguntas curadas a mano en código (mismo criterio que el catálogo de insignias — nada de IA en vivo ni colección en DB), historia estable del fútbol argentino (Mundiales, clubes, Libertadores/Sudamericana, jugadores), sin datos "vigentes" que puedan desactualizarse. La pregunta del día es determinística por fecha (hash de `YYYY-MM-DD` en huso argentino, `lib/hash.ts` — mismo mecanismo que el RNG de los bots) y cambia a la medianoche de Argentina, no de UTC. `TriviaAnswer` (un doc por usuario y día) guarda la respuesta; el bonus a la liga se calcula en vivo en `lib/leagues.ts` contando aciertos con fecha dentro de la ventana de kickoffs de esa ronda, topeado en 5. Insignias nuevas ("Preguntón"/"Sabelotodo"/"Enciclopedia", 10/30/60 aciertos de por vida) en el catálogo existente — no hay pantalla propia. **Ajustado tras feedback (2026-09-11):** no es una tarjeta fija en el feed (le restaba protagonismo a los partidos) sino un modal a demanda (ícono en el hero, `TriviaModal`) que además se abre solo al entrar si falta responder; y no se muestra en absoluto en la primera visita a la app (ver "Bienvenida" abajo) — quedaba fuera de contexto antes de que el usuario entienda que esto es un prode.
- **Bienvenida (implementado 2026-09-11).** Antes, un usuario nuevo caía directo a `/pronosticos` sin ninguna explicación —y, peor, se topaba con la trivia antes de entender que la app es un prode. Ahora `User.welcomedAt` marca la primera visita real a `/pronosticos` (el punto en común entre Credentials, que elige club en `/signup`, y Google/`/onboarding`); mientras no esté seteado, la pantalla se tapa con `WelcomeOverlay` — 3 líneas del loop central + el festejo de una insignia de bienvenida nueva, combinados en un solo momento para no encadenar dos interrupciones. Se evaluó (y se descartó) un tutorial de varios pasos con modales encadenados: `/reglas` ya cubre el detalle, y una secuencia obligatoria de varios clicks es fricción clásica de abandono en el primer minuto.

## Dirección de diseño visual (mockups, 2026-09-05)

Se hicieron mockups mobile-first en un canvas de diseño (iterado varias veces con el usuario) antes de tocar el código de UI real. Decisiones que quedaron validadas:

- **Identidad visual**: fondo oscuro casi negro, degradé de marca violeta → magenta (con resplandor/glow, no sombras planas ni colores 100% sólidos — eso se probó y se sintió "retro/arcade"), tipografía Manrope para todo (títulos en peso 800). Se probó Anton como display condensada para títulos y se descartó el 2026-09-08 — se veía saturada como fuente de sistema, sobre todo en frases largas y en botones. Paleta descartada en el camino: celeste pastel + dorado (muy genérico/gamificado tipo Duolingo), y una dirección "prode de oficina" (papel fotocopiado/máquina de escribir) que tampoco convenció.
- **La pantalla principal NO es una lista de partidos** (ese es el patrón genérico de Prode Master/Mercado Pago que se quiso evitar a propósito). En cambio arranca mostrando **tu posición real dentro del grupo de ~24 de tu liga de la fecha** (ej. "3° de 24", con una barra de zona de ascenso/descenso), no un enfrentamiento 1 contra 1 inventado — el juego es contra el grupo entero, estilo Duolingo, no un duelo con una persona puntual.
- **Cargar pronósticos vive en esa misma pantalla principal** (sección "Pendientes"), no en una pantalla separada. La carga usa **fichas 1-X-2** (la notación real de boletas de quiniela argentinas) en vez de dos casilleros de goles — tocás la dirección del resultado, y quien quiera ir por el resultado exacto (el bonus de 5 pts) despliega un mini marcador aparte.
- **Pendiente para cuando haya más de una competencia activa** (Libertadores, Sudamericana — Copa Argentina no tiene fuente de datos gratis hoy, ver sección "Otras competencias" arriba): la sección "Pendientes" se filtra con chips de competencia arriba (Liga / Libertadores / Sudamericana) en vez de separarse en una pantalla/pestaña aparte — decidido así para no sumar navegación extra. Ya se probó una primera versión de esto (`CompetitionTabs.tsx`) y se sacó por no tener contenido real detrás de las pestañas nuevas — reimplementar recién cuando haya fixtures sincronizados.

## Stack técnico (decidido, no iniciado)

- **Frontend/backend**: Next.js + TypeScript
- **DB**: MongoDB
- **Datos de partidos**: fuente intercambiable detrás de una interfaz `FixtureProvider`, elegida con `FIXTURE_SOURCE` (ver "Fuente de partidos" en `CLAUDE.md`), sincronizada por cron a la DB propia — nunca exponer una API externa directo a usuarios finales, así el costo escala con cantidad de partidos sincronizados, no con cantidad de usuarios. **Solución actual sin costo (decidida 2026-09-08): The Odds API free tier** (500 créditos/mes, ~250 usados — el cron corre cada 2h pero saltea la llamada los días sin fútbol) — es una API de cuotas que además da fixtures y resultados, cubre la Primera argentina en curso, es oficial y gratis. Limitaciones que se bancan: solo trae la fecha actual + la próxima (lo que las casas de apuestas ya abrieron), no da número de fecha (se sintetiza) ni escudos (se mapean por nombre). La tabla real de la liga no hace falta — la liga de la app se calcula con los puntos de los usuarios. **Por qué no las otras gratis**: API-Football free solo llega a 2024; TheSportsDB free limita listas a 1 resultado; football-data.org no cubre Argentina; scrapear Promiedos es frágil y no-oficial. Los providers de TheSportsDB y API-Football en vivo se implementaron, se probaron y se **eliminaron por limpieza el 2026-09-10** — la interfaz `FixtureProvider` queda con 3 fuentes (`mock`, `theoddsapi`, `replay`). **Escalón siguiente cuando el proyecto lo justifique**: TheSportsDB Premium $9/mes o API-Football Pro $19/mes — habría que re-escribir el provider (la interfaz sigue ahí). También quedó un modo `replay` (temporada 2024 real corrida al presente, JSON congelado en el repo) para demos offline.
- **Resultados en vivo** (si se implementa más adelante): caché compartida con TTL de 60-90s, solo pollear partidos con espectadores activos — mismo principio de desacople. Requiere plan pago de API-Football (~$10-19/mes) para volumen real de partidos simultáneos.
- **Mobile**: arrancar como PWA (instalable, casi gratis de agregar sobre Next.js). El código de Next.js no cambia según esta decisión, así que no bloquea empezar a construir. Las pantallas de la app son mobile-first (columna angosta, `PhoneFrame`) a propósito — un prode se usa en el celular. La puerta de entrada en desktop es la landing (`/`, ver `CLAUDE.md`), que hoy invita a abrirla en el celular con un QR y queda armada para cambiar el QR por badges de las tiendas cuando se haga la transición a Capacitor.
- **Pendiente de decidir** (2026-09-04): cómo llegar a las stores para maximizar descargas masivas — objetivo explícito del producto es "que lo descargue todo el mundo", con preferencia mobile. Opción evaluada con mejor fit dado el perfil del creador (senior frontend, fuerte en Next.js, sin experiencia previa en apps nativas): **Capacitor** — empaqueta la misma app web en un proyecto nativo real para publicar en Play Store ($25 pago único) y App Store ($99/año), reusando ~todo el código Next.js sin reescribir en React Native. Alternativa descartada por ahora: React Native/Expo (más popular y más performante nativamente, pero exige reescribir la UI). Revisar esta decisión una vez que el loop central esté funcionando como PWA — no antes.

## Modelo de datos — capas 1 y 2 (definidas en detalle)

Pensado en Mongoose (Mongo + TS).

### `Team`
```ts
{
  _id: ObjectId,
  externalId: number,      // id de API-Football, para hacer upsert sin duplicar
  name: string,
  shortName: string,
  logoUrl: string,
  country: string,
}
```

### `Competition`
```ts
{
  _id: ObjectId,
  externalId: number,       // league id de API-Football
  name: string,              // "Liga Profesional Argentina", "Copa Libertadores"...
  slug: string,              // "liga-profesional", "libertadores"
  season: number,            // API-Football pide temporada/año como parámetro obligado
  logoUrl: string,
}
```

### `Match` (la tabla más importante)
```ts
{
  _id: ObjectId,
  externalId: number,        // fixture id de API-Football — índice único, para upsert sin duplicar
  competitionId: ObjectId,
  round: string,              // API-Football lo da como texto, ej. "Regular Season - 10"
  homeTeamId: ObjectId,
  awayTeamId: ObjectId,
  kickoffAt: Date,
  status: 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled',
  homeScore: number | null,
  awayScore: number | null,
  lastSyncedAt: Date,
}
```
Ojo: API-Football usa sus propios códigos de estado (`NS`, `1H`, `2H`, `FT`, `PST`, `CANC`, `ABD`, etc.) — hay que mapearlos a este enum simplificado en la capa de sync, no guardar el código crudo de la API.

### `User`
```ts
{
  _id: ObjectId,
  name: string,
  email: string,
  favoriteTeamId: ObjectId,
  avatarUrl: string,
  createdAt: Date,
}
```
Perfil, no credenciales — auth manejado aparte (ej. NextAuth).

### `Prediction` (el corazón del sistema)
```ts
{
  _id: ObjectId,
  userId: ObjectId,
  matchId: ObjectId,
  predictedHomeScore: number,
  predictedAwayScore: number,
  points: number | null,     // null hasta que el partido termina
  createdAt: Date,
  updatedAt: Date,
}
```
- Índice único compuesto `(userId, matchId)` — un pronóstico por usuario por partido, se actualiza (no se duplica) mientras la carga esté abierta.
- Regla de negocio (no de esquema): la carga de cada partido **cierra 1 hora antes del kickoff**, no al kickoff. `isPredictionLocked()` / `PREDICTION_LOCK_LEAD_MS` en `web/src/lib/time.ts` — puro cálculo de tiempo contra `Match.kickoffAt`, nunca llama a la API. Lo aplican las server actions de `pronosticos/actions.ts` (autoridad, reloj del server) y `MatchPredictor.tsx` en el cliente (deshabilita la UI con un timer al llegar la hora límite, aunque la pestaña quede abierta).

### Cálculo de puntos
```ts
function calculatePoints(pred: Prediction, match: Match): number {
  if (pred.predictedHomeScore === match.homeScore && pred.predictedAwayScore === match.awayScore) {
    return 5; // exacto
  }
  const predicted = Math.sign(pred.predictedHomeScore - pred.predictedAwayScore);
  const actual = Math.sign(match.homeScore! - match.awayScore!);
  return predicted === actual ? 3 : 0;
}
```

### Flujo del cron de sync
1. Trae fixtures de API-Football por competencia+temporada, hace upsert en `Match` por `externalId`.
2. Cuando un partido pasa a `finished` en ese sync, dispara un segundo paso: busca todas las `Prediction` de ese `matchId` con `points: null` y las calcula.

## Modelo de datos — capas 3-6 (pendiente de detallar con el mismo nivel de profundidad)

Resumen de alto nivel, todavía sin definir campo por campo:

- **`Group` / `GroupMembership`** — grupos privados de amigos, código de invitación, competencias seguidas.
- **`RoundLeagueGroup` / `LeagueMembership`** — ligas por fecha con categoría (Primera D→Primera División), puntos de la fecha, resultado (ascendió/descendió/se mantuvo), ganador de la fecha. Se genera un lote nuevo cada fecha, agrupando usuarios de a ~24 mezclados por club. (El nombre en el código quedó `RoundLeagueGroup`; antes era `WeeklyLeagueGroup` cuando el ciclo era semanal.)
- **`Badge` / `UserBadge`** — insignias, criterio de obtención, fecha.
- **`TriviaAnswer`** — trivia diaria (una respuesta por usuario/día), con el tope de 5 pts/fecha hacia la liga calculado en vivo. El catálogo de preguntas quedó en código (`lib/trivia/catalog.ts`), no como colección — no hizo falta el `TriviaQuestion` que se había pensado acá.

## Orden de construcción sugerido

Arrancar con las capas 1+2 nomás (sincronizar partidos + cargar pronósticos + calcular puntos) y tenerlo funcionando de punta a punta antes de tocar grupos, ligas por fecha, insignias o trivia — esas cuatro capas son aditivas y no rompen nada del loop central si se agregan después. Las cuatro ya están implementadas (2026-09-11) — no queda ninguna capa aditiva pendiente del alcance original de este documento.

## Endurecer auth y registro (PENDIENTE — bloqueante antes de difundir la app públicamente)

Estado hoy (2026-09-08): NextAuth v5, Google OAuth + email/contraseña (bcrypt, mínimo 6 caracteres), sesión JWT sin adapter. Anda para desarrollo y para validar, pero es rudimentario. **No difundir la URL / no promocionar hasta cerrar esto:**

- **Sin verificación de email**: cualquiera se registra con un mail que no es suyo.
- **Sin rate limiting ni captcha**: un script puede crear miles de cuentas. El daño real no es la DB (miles de usuarios son KB) sino que `enrollUserForCurrentRound` mete cada registro en un grupo de Primera D → decenas de grupos basura con cuentas que no juegan, y los usuarios reales de la D compiten contra fantasmas con el ascenso/descenso deformado. Además cada signup corre un bcrypt (~100ms CPU) → una ráfaga spikea el server / dispara la factura de Vercel.
- **Sin "olvidé mi contraseña"**.

Plan en dos niveles:

1. **Rápido, antes de cualquier difusión** (~medio día): Cloudflare Turnstile (captcha gratis, sin fricción) en el form de signup + rate limit por IP en los server actions de signup/login (Upstash Redis, estándar en Vercel).
2. **De fondo**: verificación de email + **no inscribir en la liga a los usuarios no verificados** (separar "existe la cuenta" de "participa"). Esto necesita infra de mail (Resend, free tier generoso) — que es el mismo laburo que se necesita para "olvidé mi contraseña" y para los recordatorios de retención ("la fecha arranca en 2h"): una sola inversión, triple uso.

Decisión abierta: ¿seguir con contraseñas o pasar a magic link (login por email sin contraseña, built-in en NextAuth v5)? Para una app casual y mobile, Google + magic link cubriría el 100% sin passwords que resetear ni filtrar, a costa de fricción en cada login.
