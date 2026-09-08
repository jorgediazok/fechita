# Cómo Van (nombre placeholder) — Diseño de producto

> Nombre de la app todavía sin definir. "Cómo Van" es un placeholder de trabajo, no una decisión final — ver sección "Nombre" más abajo.

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

Todavía sin resolver. Se evaluaron y descartaron: "Cómo Van", "Cómo Salieron", "Quién Ganó", "Resultado Final", "Ganó o Perdió" (muy literales, suenan a categoría de sitio, no a marca), "La Fija", "Cantala", "La Posta", "Ojo Clínico" (rechazados sin razón específica), "Tribuna" (colisiona con marca real de medios deportivos, Tribuna.com edición Argentina). "La Cargada" (jerga argentina para la joda/burla que le hacés a alguien cuando le ganás algo) se exploró como la dirección más prometedora y se descartó 2026-09-08 — a Jorge no le gusta.

**"Cómo Van" se usa acá solo como placeholder de trabajo** para poder nombrar el repo y avanzar con la arquitectura sin bloquearse en branding.

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

### Ligas semanales (el diferencial más fuerte)
Inspirado en las ligas de Duolingo, pero con identidad 100% argentina:
- Categorías con nombres reales de las divisiones del ascenso argentino: **Primera D → Primera C → Primera B → Primera Nacional → Primera División**.
- Grupos de ~20-25 usuarios por liga semanal, **mezclados entre hinchas de distintos clubes a propósito** (no agrupados por mismo club — la rivalidad entre clubes distintos motiva más que competir con hinchas del propio equipo).
- Cada usuario muestra el escudo/colores de su club junto a su nombre en la tabla de la liga.
- Al cerrar la semana: ~top 5 ascienden de categoría, ~últimos 5 descienden, el resto se mantiene.
- Primera División (el techo) no tiene ascenso — ahí compite la élite de la app permanentemente.
- Reemplaza una idea anterior de ranking geolocalizado por barrio/provincia (descartada por fricción de permisos/batería de geolocalización en vivo — la pertenencia por club + liga rotativa cumple la misma función de "engachar al que no tiene amigos futboleros" sin ese costo técnico).
- **Bots (decidido 2026-09-08)**: para el arranque, cuando haya pocos jugadores reales, hay 20 usuarios bot que pronostican solos antes de cada partido y compiten en las ligas como cualquiera (ascienden/descienden igual). Se muestran con un tag "BOT" — no son rivales encubiertos, es a propósito. Pronostican con un criterio simple (favorito/local pesado por una tabla tosca de fuerza de equipo, con más o menos azar según un "nivel" por bot) para que la tabla tenga spread creíble. Implementación en `web/src/lib/bots/` (ver `CLAUDE.md`). A medida que entren jugadores reales se puede bajar la cantidad o sacarlos.

### Premios
Sin dinero ni apuestas — descartado por riesgo legal/regulatorio de juego en Argentina, validado además con el caso real de la app Pasito (su fundador declaró públicamente que lo que más motiva no es el canje de premios sino el ranking en sí mismo). Alternativa sugerida si se quiere algo "picante" sin plata de por medio: una prenda/desafío para el último de la semana (costumbre ya existente en los prodes de oficina argentinos) — no implementada, solo sugerida.

### Insignias (permanentes, no se resetean como las ligas)
- Por aciertos acumulados: 10, 50, 100, 500
- Por rachas: fechas seguidas acertando
- Por ascensos: la primera vez que se llega a cada categoría (aunque después baje, la insignia queda)
- Por hitos ligados a partidos reales: acertar un Superclásico, acertar una sorpresa/"caño"

### Retención entre semana (problema: el fútbol no tiene ritmo diario como Duolingo)
- La "racha" del usuario se mide por fecha/partido jugado, no por día calendario — evita forzar un hábito diario artificial sobre un deporte que no lo tiene.
- Para los días sin partido: el gancho es revisar la posición en la liga semanal (puede moverse por otros cargando pronósticos), reforzado con notificaciones push inteligentes ("te superaron", "cierra la carga en 2 horas", "estás cerca de ascender").
- **Trivia diaria de cultura futbolera** (no ligada a un partido específico): aporta un tope de **5 puntos extra por semana** a la liga semanal (no ilimitado, para no diluir que el ascenso refleje saber predecir fútbol real de verdad). El resto de puntos de trivia van a un track separado de XP/insignias, sin afectar el ascenso.

## Dirección de diseño visual (mockups, 2026-09-05)

Se hicieron mockups mobile-first en un canvas de diseño (iterado varias veces con el usuario) antes de tocar el código de UI real. Decisiones que quedaron validadas:

- **Identidad visual**: fondo oscuro casi negro, degradé de marca violeta → magenta (con resplandor/glow, no sombras planas ni colores 100% sólidos — eso se probó y se sintió "retro/arcade"), tipografía Manrope para todo (títulos en peso 800). Se probó Anton como display condensada para títulos y se descartó el 2026-09-08 — se veía saturada como fuente de sistema, sobre todo en frases largas y en botones. Paleta descartada en el camino: celeste pastel + dorado (muy genérico/gamificado tipo Duolingo), y una dirección "prode de oficina" (papel fotocopiado/máquina de escribir) que tampoco convenció.
- **La pantalla principal NO es una lista de partidos** (ese es el patrón genérico de Prode Master/Mercado Pago que se quiso evitar a propósito). En cambio arranca mostrando **tu posición real dentro del grupo de ~20 de tu liga semanal** (ej. "3° de 20", con una barra de zona de ascenso/descenso), no un enfrentamiento 1 contra 1 inventado — el juego es contra el grupo entero, estilo Duolingo, no un duelo con una persona puntual.
- **Cargar pronósticos vive en esa misma pantalla principal** (sección "Pendientes"), no en una pantalla separada. La carga usa **fichas 1-X-2** (la notación real de boletas de quiniela argentinas) en vez de dos casilleros de goles — tocás la dirección del resultado, y quien quiera ir por el resultado exacto (el bonus de 5 pts) despliega un mini marcador aparte.
- **Pendiente para cuando haya más de una competencia activa** (Copa Argentina, Libertadores, etc.): la sección "Pendientes" se filtra con chips de competencia arriba (Liga / Copa Argentina / Libertadores) en vez de separarse en una pantalla/pestaña aparte — decidido así para no sumar navegación extra.

## Stack técnico (decidido, no iniciado)

- **Frontend/backend**: Next.js + TypeScript
- **DB**: MongoDB
- **Datos de partidos**: API-Football (api-football.com, registro directo en su propio dashboard — no hace falta pasar por RapidAPI), sincronizado por cron a la DB propia — nunca exponer la API externa directo a usuarios finales, así el costo escala con cantidad de partidos sincronizados, no con cantidad de usuarios. **Ojo**: el free tier (100 req/día) **no da acceso a la temporada actual**, solo a temporadas 2022-2024 (confirmado contra la API real, 2026-09-06) — para partidos reales y en curso hace falta el plan Pro (~USD 19/mes, 7.500 req/día). Se investigaron alternativas gratis con cobertura de fútbol argentino actual (football-data.org, TheSportsDB) y ninguna sirve: la primera no cubre Argentina/Sudamérica en su free tier, la segunda limita a 15 requests de por vida el endpoint que se necesita. Mientras tanto, desarrollo sigue con datos simulados (ver `CLAUDE.md`) hasta que se decida pagar el plan Pro.
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
- Índice único compuesto `(userId, matchId)` — un pronóstico por usuario por partido, se actualiza (no se duplica) mientras el partido no arrancó.
- Regla de negocio (no de esquema): rechazar cualquier escritura/edición si `Date.now() >= match.kickoffAt`.

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
- **`WeeklyLeague` / `LeagueMembership`** — ligas semanales con categoría (Primera D→Primera División), puntos acumulados, posición final, resultado (ascendió/descendió/se mantuvo). Se genera un lote nuevo cada semana, agrupando usuarios de a ~20-25 mezclados por club.
- **`Badge` / `UserBadge`** — insignias, criterio de obtención, fecha.
- **`TriviaQuestion` / `TriviaAnswer`** — trivia diaria, con el tope de 5 pts/semana hacia la liga.

## Orden de construcción sugerido

Arrancar con las capas 1+2 nomás (sincronizar partidos + cargar pronósticos + calcular puntos) y tenerlo funcionando de punta a punta antes de tocar grupos, ligas semanales, insignias o trivia — esas cuatro capas son aditivas y no rompen nada del loop central si se agregan después.

## Endurecer auth y registro (PENDIENTE — bloqueante antes de difundir la app públicamente)

Estado hoy (2026-09-08): NextAuth v5, Google OAuth + email/contraseña (bcrypt, mínimo 6 caracteres), sesión JWT sin adapter. Anda para desarrollo y para validar, pero es rudimentario. **No difundir la URL / no promocionar hasta cerrar esto:**

- **Sin verificación de email**: cualquiera se registra con un mail que no es suyo.
- **Sin rate limiting ni captcha**: un script puede crear miles de cuentas. El daño real no es la DB (miles de usuarios son KB) sino que `enrollUserForCurrentWeek` mete cada registro en un grupo de Primera D → decenas de grupos basura con cuentas que no juegan, y los usuarios reales de la D compiten contra fantasmas con el ascenso/descenso deformado. Además cada signup corre un bcrypt (~100ms CPU) → una ráfaga spikea el server / dispara la factura de Vercel.
- **Sin "olvidé mi contraseña"**.

Plan en dos niveles:

1. **Rápido, antes de cualquier difusión** (~medio día): Cloudflare Turnstile (captcha gratis, sin fricción) en el form de signup + rate limit por IP en los server actions de signup/login (Upstash Redis, estándar en Vercel).
2. **De fondo**: verificación de email + **no inscribir en la liga semanal a los usuarios no verificados** (separar "existe la cuenta" de "participa"). Esto necesita infra de mail (Resend, free tier generoso) — que es el mismo laburo que se necesita para "olvidé mi contraseña" y para los recordatorios de retención ("la fecha arranca en 2h"): una sola inversión, triple uso.

Decisión abierta: ¿seguir con contraseñas o pasar a magic link (login por email sin contraseña, built-in en NextAuth v5)? Para una app casual y mobile, Google + magic link cubriría el 100% sin passwords que resetear ni filtrar, a costa de fricción en cada login.
