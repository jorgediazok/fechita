// 20 nombres de bots. Comunes, mezcla de géneros, apellidos frecuentes en Argentina.
// El orden importa: el bot N siempre es el mismo nombre (el seed es idempotente por email).
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
] as const;

export function botEmail(name: string) {
  const slug = name.toLowerCase().normalize("NFD").replace(/[^a-z]/g, "");
  return `bot-${slug}@bot.local`;
}
