// Banco de trivia diaria, en código — mismo criterio que el catálogo de insignias
// (badges/catalog.ts) o las categorías (tiers.ts): contenido curado a mano, sin colección
// en DB. Datos históricos estables a propósito (nada de récords "vigentes" que puedan
// quedar desactualizados) — fútbol argentino: Mundiales, clubes, Libertadores/Sudamericana
// y jugadores. La pregunta del día sale de acá vía trivia/today.ts (índice determinístico
// por fecha, cyrb53(dayKey) % largo), nunca al azar en cada request.

export type TriviaCategory = "mundiales" | "clubes" | "libertadores" | "jugadores";

export type TriviaQuestionDef = {
  id: string;
  category: TriviaCategory;
  question: string;
  options: string[];
  correctIndex: number;
};

export const TRIVIA_CATEGORY_LABELS: Record<TriviaCategory, string> = {
  mundiales: "Selección y Mundiales",
  clubes: "Historia de clubes",
  libertadores: "Libertadores y Sudamericana",
  jugadores: "Jugadores y curiosidades",
};

export const TRIVIA_QUESTIONS: TriviaQuestionDef[] = [
  // ── Selección Argentina / Mundiales ─────────────────────────────────────────
  {
    id: "mun-01",
    category: "mundiales",
    question: "¿Cuántas Copas del Mundo ganó la Selección Argentina (hasta 2022)?",
    options: ["2", "3", "4", "5"],
    correctIndex: 1,
  },
  {
    id: "mun-02",
    category: "mundiales",
    question: "¿A qué selección le ganó Argentina la final del Mundial 1986?",
    options: ["Italia", "Alemania (RFA)", "Francia", "Brasil"],
    correctIndex: 1,
  },
  {
    id: "mun-03",
    category: "mundiales",
    question:
      "¿Cómo se conoce al gol de Maradona a Inglaterra en 1986 en el que esquivó a varios rivales?",
    options: ["El Golazo del Siglo", "La Mano de Dios", "El Doblete de Oro", "El Gambeteo Eterno"],
    correctIndex: 0,
  },
  {
    id: "mun-04",
    category: "mundiales",
    question: "¿Contra qué selección Argentina perdió la final del Mundial 2014?",
    options: ["Brasil", "Alemania", "Países Bajos", "España"],
    correctIndex: 1,
  },
  {
    id: "mun-05",
    category: "mundiales",
    question: "¿En qué torneo Argentina le ganó a Brasil en el Maracaná en 2021?",
    options: ["Copa América", "Copa Libertadores", "Mundial", "Finalissima"],
    correctIndex: 0,
  },
  {
    id: "mun-06",
    category: "mundiales",
    question: "¿Ante qué selección perdió Argentina la final de su primer Mundial, en 1930?",
    options: ["Uruguay", "Brasil", "Italia", "Estados Unidos"],
    correctIndex: 0,
  },
  {
    id: "mun-07",
    category: "mundiales",
    question: "¿En qué estadio se jugó la final del Mundial 1978, que ganó Argentina?",
    options: ["La Bombonera", "El Monumental", "El Cilindro", "El Gigante de Arroyito"],
    correctIndex: 1,
  },
  {
    id: "mun-08",
    category: "mundiales",
    question:
      "¿Quién hizo el hat-trick de Francia en la final del Mundial 2022, rival de Messi por la Bota de Oro?",
    options: ["Antoine Griezmann", "Kylian Mbappé", "Olivier Giroud", "Ousmane Dembélé"],
    correctIndex: 1,
  },
  {
    id: "mun-09",
    category: "mundiales",
    question:
      "¿Cómo terminó el marcador de la final del Mundial 2022 tras el tiempo suplementario, antes de los penales?",
    options: ["2 a 2", "3 a 3", "1 a 1", "4 a 4"],
    correctIndex: 1,
  },
  {
    id: "mun-10",
    category: "mundiales",
    question: "¿Qué trofeo ganó Argentina en 2022, antes del Mundial, venciéndole a Italia?",
    options: ["La Finalissima", "La Copa Confederaciones", "La Copa Kirin", "La Copa Artemio Franchi"],
    correctIndex: 0,
  },
  {
    id: "mun-11",
    category: "mundiales",
    question: "¿Quién convirtió el gol argentino en la final de la Copa América 2021 ante Brasil?",
    options: ["Lionel Messi", "Ángel Di María", "Rodrigo De Paul", "Lautaro Martínez"],
    correctIndex: 1,
  },
  {
    id: "mun-12",
    category: "mundiales",
    question: "¿Quién fue el goleador histórico de la Selección Argentina antes de que Messi lo superara?",
    options: ["Gabriel Batistuta", "Hernán Crespo", "Diego Maradona", "Mario Kempes"],
    correctIndex: 0,
  },
  {
    id: "mun-13",
    category: "mundiales",
    question:
      "¿Qué jugador inglés fue expulsado por una patada a Diego Simeone en Argentina-Inglaterra, Mundial 1998?",
    options: ["Michael Owen", "Paul Scholes", "David Beckham", "Alan Shearer"],
    correctIndex: 2,
  },
  {
    id: "mun-14",
    category: "mundiales",
    question:
      "¿Qué selección eliminó a Argentina en los octavos de final del Mundial 2018, con doblete de un joven Mbappé?",
    options: ["Francia", "Croacia", "Bélgica", "Portugal"],
    correctIndex: 0,
  },
  {
    id: "mun-15",
    category: "mundiales",
    question: "¿Quién fue el capitán de Argentina en el Mundial de Italia 1990, subcampeón?",
    options: ["Diego Maradona", "Oscar Ruggeri", "Jorge Burruchaga", "Sergio Batista"],
    correctIndex: 0,
  },
  {
    id: "mun-16",
    category: "mundiales",
    question:
      "¿A qué selección le ganó Argentina en semifinales del Mundial 1990, por penales, en Nápoles?",
    options: ["Italia", "Inglaterra", "Bélgica", "Yugoslavia"],
    correctIndex: 0,
  },
  {
    id: "mun-17",
    category: "mundiales",
    question:
      "¿Contra qué selección debutó Argentina en el Mundial 2022, perdiendo sorpresivamente 1 a 2?",
    options: ["México", "Arabia Saudita", "Polonia", "Australia"],
    correctIndex: 1,
  },
  {
    id: "mun-18",
    category: "mundiales",
    question: "¿Quién convirtió el gol argentino en esa derrota ante Arabia Saudita en 2022?",
    options: ["Julián Álvarez", "Lionel Messi", "Alexis Mac Allister", "Ángel Di María"],
    correctIndex: 1,
  },
  {
    id: "mun-19",
    category: "mundiales",
    question:
      "¿Cuántos goles convirtió Mbappé en la final del Mundial 2022, contando la tanda de penales?",
    options: ["2", "3", "4", "5"],
    correctIndex: 2,
  },
  {
    id: "mun-20",
    category: "mundiales",
    question: "¿En qué estadio se jugó la final del Mundial 2022, en Qatar?",
    options: ["Estadio Lusail", "Estadio Al Bayt", "Estadio 974", "Estadio Education City"],
    correctIndex: 0,
  },
  {
    id: "mun-21",
    category: "mundiales",
    question: "¿Quién fue el árbitro de la final del Mundial 2022?",
    options: ["Néstor Pitana", "Szymon Marciniak", "Björn Kuipers", "Antonio Mateu Lahoz"],
    correctIndex: 1,
  },

  // ── Historia de clubes ────────────────────────────────────────────────────
  {
    id: "clu-01",
    category: "clubes",
    question: "En el sistema de categorías de Fechita (calcado del ascenso real), ¿cuál es la más baja?",
    options: ["Primera D", "Primera C", "Primera B", "Primera Nacional"],
    correctIndex: 0,
  },
  {
    id: "clu-02",
    category: "clubes",
    question: "¿Qué categoría está un escalón debajo de Primera División?",
    options: ["Primera B", "Primera C", "Primera Nacional", "Primera D"],
    correctIndex: 2,
  },
  {
    id: "clu-03",
    category: "clubes",
    question: "¿Cuál de estos clubes NO es de Buenos Aires ni del Gran Buenos Aires?",
    options: ["Talleres de Córdoba", "Boca Juniors", "River Plate", "Vélez Sarsfield"],
    correctIndex: 0,
  },
  {
    id: "clu-04",
    category: "clubes",
    question: "¿En qué año se fundó River Plate?",
    options: ["1901", "1905", "1908", "1912"],
    correctIndex: 0,
  },
  {
    id: "clu-05",
    category: "clubes",
    question: "¿En qué año se fundó Boca Juniors?",
    options: ["1901", "1905", "1908", "1912"],
    correctIndex: 1,
  },
  {
    id: "clu-06",
    category: "clubes",
    question: "¿Cuál de estos clubes es el más antiguo?",
    options: ["River Plate", "Racing Club", "Boca Juniors", "San Lorenzo"],
    correctIndex: 0,
  },
  {
    id: "clu-07",
    category: "clubes",
    question: "¿En qué año se profesionalizó el fútbol argentino?",
    options: ["1925", "1931", "1938", "1945"],
    correctIndex: 1,
  },
  {
    id: "clu-08",
    category: "clubes",
    question: "¿Qué club ganó el primer torneo profesional de Primera División en Argentina, en 1931?",
    options: ["River Plate", "Boca Juniors", "Independiente", "San Lorenzo"],
    correctIndex: 1,
  },
  {
    id: "clu-09",
    category: "clubes",
    question: "¿A manos de qué club descendió River Plate a la B Nacional en 2011?",
    options: ["Belgrano de Córdoba", "Aldosivi", "All Boys", "San Martín de Tucumán"],
    correctIndex: 0,
  },
  {
    id: "clu-10",
    category: "clubes",
    question: "¿Qué entrenador dirigió a River Plate en las finales de Copa Libertadores de 2015 y 2018?",
    options: ["Matías Almeyda", "Marcelo Gallardo", "Ramón Díaz", "Daniel Passarella"],
    correctIndex: 1,
  },
  {
    id: "clu-11",
    category: "clubes",
    question:
      "¿En qué ciudad se jugó la final de la Copa Libertadores 2018 entre River y Boca, tras los incidentes que impidieron disputarla en Argentina?",
    options: ["Asunción", "Montevideo", "Madrid", "Miami"],
    correctIndex: 2,
  },
  {
    id: "clu-12",
    category: "clubes",
    question: "¿Quién es el máximo goleador histórico de Boca Juniors?",
    options: ["Martín Palermo", "Carlos Tevez", "Guillermo Barros Schelotto", "Juan Román Riquelme"],
    correctIndex: 0,
  },
  {
    id: "clu-13",
    category: "clubes",
    question: "¿Quién es el máximo goleador histórico de River Plate?",
    options: ["Ángel Labruna", "Norberto Alonso", "Enzo Francescoli", "Daniel Onega"],
    correctIndex: 0,
  },

  // ── Copa Libertadores / Sudamericana ─────────────────────────────────────
  {
    id: "lib-01",
    category: "libertadores",
    question: "¿Qué club argentino tiene más títulos de Copa Libertadores?",
    options: ["Boca Juniors", "River Plate", "Independiente", "Racing Club"],
    correctIndex: 2,
  },
  {
    id: "lib-02",
    category: "libertadores",
    question: "¿En qué década se disputó por primera vez la Copa Libertadores?",
    options: ["1950", "1960", "1970", "1980"],
    correctIndex: 1,
  },
  {
    id: "lib-03",
    category: "libertadores",
    question: "¿Qué club uruguayo ganó la primera edición de la Copa Libertadores, en 1960?",
    options: ["Nacional", "Peñarol", "Danubio", "Defensor Sporting"],
    correctIndex: 1,
  },
  {
    id: "lib-04",
    category: "libertadores",
    question: "¿Qué club argentino ganó la primera edición de la Copa Sudamericana, en 2002?",
    options: ["San Lorenzo", "Boca Juniors", "River Plate", "Racing Club"],
    correctIndex: 0,
  },
  {
    id: "lib-05",
    category: "libertadores",
    question: "¿Qué club argentino fue el primero en ganar la Copa Libertadores, en 1964?",
    options: ["Boca Juniors", "River Plate", "Independiente", "Estudiantes de La Plata"],
    correctIndex: 2,
  },
  {
    id: "lib-06",
    category: "libertadores",
    question: "¿En qué año Boca Juniors ganó su primera Copa Libertadores?",
    options: ["1970", "1977", "1981", "1986"],
    correctIndex: 1,
  },
  {
    id: "lib-07",
    category: "libertadores",
    question: "¿Cuántos títulos de Copa Libertadores tiene River Plate?",
    options: ["2", "3", "4", "5"],
    correctIndex: 2,
  },
  {
    id: "lib-08",
    category: "libertadores",
    question: "¿Qué club brasileño le ganó a Boca Juniors la final de la Copa Libertadores 2012?",
    options: ["Corinthians", "Santos", "Flamengo", "São Paulo"],
    correctIndex: 0,
  },
  {
    id: "lib-09",
    category: "libertadores",
    question: "¿Qué club ganó la Copa Libertadores 2018, tras vencer a Boca Juniors en la final?",
    options: ["River Plate", "Grêmio", "Palmeiras", "Racing Club"],
    correctIndex: 0,
  },
  {
    id: "lib-10",
    category: "libertadores",
    question: "¿Cómo se llama el torneo que enfrenta al campeón de la Libertadores contra el de la Sudamericana?",
    options: ["Recopa Sudamericana", "Supercopa Libertadores", "Copa Intercontinental", "Copa Merconorte"],
    correctIndex: 0,
  },
  {
    id: "lib-11",
    category: "libertadores",
    question: "¿En qué año Independiente ganó su séptima y última Copa Libertadores hasta ahora?",
    options: ["1975", "1984", "1990", "1995"],
    correctIndex: 1,
  },
  {
    id: "lib-12",
    category: "libertadores",
    question:
      "¿A qué club escocés le ganó Racing Club la Copa Intercontinental de 1967, primer título mundial de un club argentino?",
    options: ["Celtic", "Rangers", "Aberdeen", "Hibernian"],
    correctIndex: 0,
  },
  {
    id: "lib-13",
    category: "libertadores",
    question: "¿Qué club argentino venció al Manchester United en la Copa Intercontinental de 1968?",
    options: ["Racing Club", "Estudiantes de La Plata", "River Plate", "Vélez Sarsfield"],
    correctIndex: 1,
  },
  {
    id: "lib-14",
    category: "libertadores",
    question: "¿En qué año Vélez Sarsfield ganó su única Copa Libertadores?",
    options: ["1988", "1994", "2000", "2009"],
    correctIndex: 1,
  },
  {
    id: "lib-15",
    category: "libertadores",
    question:
      "¿Quién fue la gran figura y autor de un gol en la final de la Copa Libertadores 2007, que Boca le ganó a Grêmio?",
    options: ["Juan Román Riquelme", "Guillermo Barros Schelotto", "Rodrigo Palacio", "Martín Palermo"],
    correctIndex: 1,
  },

  // ── Jugadores y curiosidades ──────────────────────────────────────────────
  {
    id: "jug-01",
    category: "jugadores",
    question: "¿En qué club debutó profesionalmente Diego Maradona?",
    options: ["Boca Juniors", "Argentinos Juniors", "River Plate", "Newell's Old Boys"],
    correctIndex: 1,
  },
  {
    id: "jug-02",
    category: "jugadores",
    question: "¿En qué club italiano jugó Maradona su etapa más recordada, con la que salió campeón?",
    options: ["Juventus", "Napoli", "Inter de Milán", "AC Milan"],
    correctIndex: 1,
  },
  {
    id: "jug-03",
    category: "jugadores",
    question: "¿En qué club español jugó Messi la mayor parte de su carrera antes de irse a Francia?",
    options: ["Real Madrid", "Barcelona", "Atlético de Madrid", "Valencia"],
    correctIndex: 1,
  },
  {
    id: "jug-04",
    category: "jugadores",
    question: "¿Qué arquero argentino fue clave atajando penales en la final del Mundial 2022?",
    options: ["Franco Armani", "Emiliano \"Dibu\" Martínez", "Sergio Romero", "Agustín Marchesín"],
    correctIndex: 1,
  },
  {
    id: "jug-05",
    category: "jugadores",
    question: "¿Quién fue el goleador del Mundial 1978, con 6 goles, y figura clave del campeonato?",
    options: ["Mario Kempes", "Daniel Passarella", "Leopoldo Luque", "Osvaldo Ardiles"],
    correctIndex: 0,
  },
  {
    id: "jug-06",
    category: "jugadores",
    question: "¿En qué club portugués empezó su carrera profesional Ángel Di María, antes del Real Madrid?",
    options: ["Porto", "Sporting Lisboa", "Benfica", "Braga"],
    correctIndex: 2,
  },
  {
    id: "jug-07",
    category: "jugadores",
    question: "¿A qué club llegó Sergio \"Kun\" Agüero al salir de Independiente, antes del Manchester City?",
    options: ["Atlético de Madrid", "Real Madrid", "Sevilla", "Valencia"],
    correctIndex: 0,
  },
  {
    id: "jug-08",
    category: "jugadores",
    question:
      "¿En qué club debutó Sergio \"Kun\" Agüero en primera, siendo el debutante más joven de la historia del club en su momento?",
    options: ["River Plate", "Independiente", "Vélez Sarsfield", "Racing Club"],
    correctIndex: 1,
  },
  {
    id: "jug-09",
    category: "jugadores",
    question: "¿Qué jugador argentino fue capitán del Inter de Milán campeón de la Champions League 2010?",
    options: ["Javier Zanetti", "Esteban Cambiasso", "Walter Samuel", "Diego Milito"],
    correctIndex: 0,
  },
  {
    id: "jug-10",
    category: "jugadores",
    question: "¿En qué club jugó la mayor parte de su carrera en Argentina Juan Román Riquelme?",
    options: ["River Plate", "Boca Juniors", "Argentinos Juniors", "Racing Club"],
    correctIndex: 1,
  },
  {
    id: "jug-11",
    category: "jugadores",
    question: "¿Qué jugador argentino, naturalizado italiano, ganó el Balón de Oro en 1961?",
    options: ["Humberto Maschio", "Omar Sívori", "Antonio Angelillo", "Roberto Sensini"],
    correctIndex: 1,
  },
  {
    id: "jug-12",
    category: "jugadores",
    question: "¿En qué club se retiró Diego Maradona como jugador profesional, en 1997?",
    options: ["Boca Juniors", "Newell's Old Boys", "Sevilla", "Argentinos Juniors"],
    correctIndex: 0,
  },
] as const;

const byId = new Map(TRIVIA_QUESTIONS.map((q) => [q.id, q]));

export function getTriviaQuestion(id: string): TriviaQuestionDef | undefined {
  return byId.get(id);
}
