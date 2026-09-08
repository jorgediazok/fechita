import { Schema, model, models, type InferSchemaType } from "mongoose";

// Estado del panel dev que tiene que sobrevivir reinicios del server. Hoy solo guarda
// el corrimiento de semanas simulado por el botón "Cerrar semana ahora" de /liga — antes
// vivía en una variable en memoria de lib/leagues.ts y se perdía en cada `next dev` reload,
// lo que dejaba usuarios repartidos en distintos weekKey sin poder cruzarse. Un único
// documento con key: "singleton".
const DevStateSchema = new Schema({
  key: { type: String, required: true, unique: true },
  weekOffsetDays: { type: Number, default: 0 },
});

export type DevState = InferSchemaType<typeof DevStateSchema>;

export default models.DevState || model("DevState", DevStateSchema);
