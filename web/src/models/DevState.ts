import { Schema, model, models, type InferSchemaType } from "mongoose";

// Estado que tiene que sobrevivir reinicios del server, en un único documento key: "singleton".
//  - weekOffsetDays: corrimiento de semanas simulado por el botón "Cerrar semana ahora" de
//    /liga (modo mock). Antes vivía en memoria en lib/leagues.ts y se perdía en cada reload,
//    dejando usuarios repartidos en distintos weekKey sin poder cruzarse.
//  - replayStartedAt: instante (reloj real) en que arrancó el modo replay. El provider de
//    replay (FIXTURE_SOURCE=replay) corre la temporada 2024 al presente usando esta ancla,
//    así el corrimiento no cambia entre syncs ni al reiniciar el proceso.
const DevStateSchema = new Schema({
  key: { type: String, required: true, unique: true },
  weekOffsetDays: { type: Number, default: 0 },
  replayStartedAt: { type: Date },
});

export type DevState = InferSchemaType<typeof DevStateSchema>;

export default models.DevState || model("DevState", DevStateSchema);
