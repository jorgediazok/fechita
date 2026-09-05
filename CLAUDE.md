# CLAUDE.md

Guía para Claude Code al trabajar en este repositorio.

## Estado del proyecto

**Fase: diseño de producto cerrado, código sin empezar.** Este repo hoy solo contiene documentación — no hay app, no hay `package.json`, no hay stack instalado todavía. No asumas que existe código: si el usuario pide "arrancá a codear" o similar, empezá por hacer el scaffold del proyecto (ver "Stack técnico" abajo), no busques archivos que no existen.

## Qué es este proyecto

Una app de prode (pronósticos de fútbol) enfocada 100% en el público argentino, pensada como proyecto de portfolio con potencial de uso real. El diseño completo del producto — por qué existe, contra quién compite, todas las mecánicas de juego, y el modelo de datos de las primeras dos capas — está en **[docs/product-design.md](docs/product-design.md)**. Leé ese archivo completo antes de proponer cambios de producto o de arquitectura: ya se investigó el mercado (GameOn, Promiedos, Sofascore, Prode Master y otros) y se tomaron decisiones deliberadas de scope que no conviene re-litigar sin motivo.

## Cómo seguir sin perder el hilo

Este proyecto nació de una conversación larga en el repo `portfolio` (carpeta hermana, `~/Developer/portfolio`) donde se pensó de cero: la idea, el análisis competitivo, el nombre, y todas las reglas del juego. Todo lo relevante de esa charla ya está volcado en `docs/product-design.md` — no hace falta ir a buscar la conversación original para tener contexto, este documento es la fuente de verdad actualizada.

Cuando el usuario retome el trabajo acá:
1. Si pregunta "¿en qué quedamos?" o similar: resumí desde `docs/product-design.md`, no inventes ni asumas decisiones que no estén ahí.
2. Si el documento y el código ya escrito se contradicen (por ejemplo, el modelo de datos real terminó siendo distinto al propuesto): confiá en el código, y actualizá `docs/product-design.md` para que refleje la realidad — el doc se queda desactualizado si no se mantiene.
3. Las decisiones marcadas como "pendiente" o "no confirmado" en el doc (ej. el nombre de la app, si separar más los puntos 4/3/0 a algo como 5/2/0) son temas abiertos — no los des por cerrados, preguntá si hace falta decidir antes de construir algo que dependa de esa decisión.

## Nombre del proyecto

**"Cómo Van" es un placeholder**, no el nombre final — todavía no se decidió (ver sección "Nombre de la app" en `docs/product-design.md` para el historial de opciones evaluadas y descartadas). Si en algún momento el usuario dice "ya tengo el nombre", actualizá este archivo, `docs/product-design.md`, y el nombre del paquete/carpeta si corresponde.

## Stack técnico (decidido, pendiente de scaffold)

- Next.js + TypeScript
- MongoDB (Mongoose)
- Datos de partidos vía API-Football (api-football.com), sincronizados por cron a la DB propia — nunca exponer esa API externa directo al cliente
- PWA desde el arranque (mobile viene gratis encima del sitio, sin app nativa separada por ahora)

## Orden de construcción sugerido

Seguir el orden ya acordado en `docs/product-design.md`: primero el loop central (sincronizar partidos + cargar pronósticos + calcular puntos), recién después las capas aditivas (grupos de amigos, ligas semanales con ascenso/descenso, insignias, trivia diaria).
