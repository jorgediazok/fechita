// 50 nombres de bots (ampliado de 20 a 50 el 2026-09-11, para que cada categoría tenga
// ~10 bots y las tablas no se sientan vacías con pocos jugadores reales). Comunes, mezcla
// de géneros, apellidos frecuentes en Argentina. El orden importa: el bot N siempre es el
// mismo nombre (el seed es idempotente por email) y determina su categoría inicial
// (tierFor en seedBots.ts) — por eso los primeros 20 nunca se reordenan, los nuevos van
// siempre al final.
export const BOT_NAMES = [
  "Rubén Ortiz",
  "Marcela Paz",
  "Hernán Sosa",
  "Lucía Ferreyra",
  "Pablo Godoy",
  "Carla Benítez",
  "Andrés Quiroga",
  "Sofía Ledesma",
  "Martín Cabrera",
  "Julieta Ríos",
  "Gastón Vera",
  "Romina Acuña",
  "Emiliano Molina",
  "Daniela Ibarra",
  "Nicolás Peralta",
  "Florencia Ojeda",
  "Sebastián Correa",
  "Valentina Herrera",
  "Maximiliano Luna",
  "Agustina Cardozo",
  "Diego Aguirre",
  "Marina Rojas",
  "Facundo Torres",
  "Camila Núñez",
  "Leandro Funes",
  "Antonella Díaz",
  "Ezequiel Castro",
  "Milagros Farías",
  "Ramiro Bustos",
  "Yamila Coria",
  "Franco Paredes",
  "Ayelén Suárez",
  "Matías Juárez",
  "Brenda Villagra",
  "Ignacio Palacios",
  "Guadalupe Medina",
  "Tomás Figueroa",
  "Rocío Barrios",
  "Bruno Navarro",
  "Lucas Cabral",
  "Micaela Toledo",
  "Damián Escobar",
  "Florencia Gauna",
  "Federico Ávila",
  "Paula Zárate",
  "Cristian Leiva",
  "Noelia Chávez",
  "Joaquín Salas",
  "Karen Mansilla",
  "Alan Domínguez",
] as const;

export function botEmail(name: string) {
  const slug = name.toLowerCase().normalize("NFD").replace(/[^a-z]/g, "");
  return `bot-${slug}@bot.local`;
}
