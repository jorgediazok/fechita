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

Todavía sin resolver. Se evaluaron y descartaron: "Cómo Van", "Cómo Salieron", "Quién Ganó", "Resultado Final", "Ganó o Perdió" (muy literales, suenan a categoría de sitio, no a marca), "La Fija", "Cantala", "La Posta", "Ojo Clínico" (rechazados sin razón específica), "Tribuna" (colisiona con marca real de medios deportivos, Tribuna.com edición Argentina). Dirección más prometedora explorada: "La Cargada" (jerga argentina para la joda/burla que le hacés a alguien cuando le ganás algo) — dominios `lacargada.com.ar` / `lacargada.app` / `cargada.app` verificados libres al 2026-09-04, pero tampoco confirmado como definitivo.

**"Cómo Van" se usa acá solo como placeholder de trabajo** para poder nombrar el repo y avanzar con la arquitectura sin bloquearse en branding.

## Mecánicas de juego

### Sistema de puntos por pronóstico
- 4 puntos: resultado exacto
- 3 puntos: acierta solo la dirección (gana/empata/pierde)
- 0 puntos: no acierta nada
- Pendiente de revisar: la diferencia entre 4 y 3 es chica dado lo mucho más difícil que es acertar el resultado exacto — considerar separar más (ej. 5/2/0) si en la práctica no incentiva arriesgar el resultado exacto.

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

## Stack técnico (decidido, no iniciado)

- **Frontend/backend**: Next.js + TypeScript
- **DB**: MongoDB
- **Datos de partidos**: API-Football (api-football.com vía RapidAPI), free tier (100 req/día) sincronizado por cron a la DB propia — nunca exponer la API externa directo a usuarios finales, así el costo escala con cantidad de partidos sincronizados, no con cantidad de usuarios.
- **Resultados en vivo** (si se implementa más adelante): caché compartida con TTL de 60-90s, solo pollear partidos con espectadores activos — mismo principio de desacople. Requiere plan pago de API-Football (~$10-19/mes) para volumen real de partidos simultáneos.
- **Mobile**: arrancar como PWA (instalable, casi gratis de agregar sobre Next.js). Evaluar Capacitor más adelante si se quiere presencia en App Store/Play Store sin rehacer la UI.

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
    return 4; // exacto
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
