import { Schema, model, models, type InferSchemaType } from "mongoose";

// Estado que tiene que sobrevivir reinicios del server, en un único documento key: "singleton".
//  - replayStartedAt: instante (reloj real) en que arrancó el modo replay. El provider de
//    replay (FIXTURE_SOURCE=replay) corre la temporada 2024 al presente usando esta ancla,
//    así el corrimiento no cambia entre syncs ni al reiniciar el proceso.
//  - lastSyncAt: última vez que /api/cron/sync efectivamente pegó a la API. Lo usa el cron
//    para decidir si saltear la llamada cuando no hay nada nuevo (ver route.ts).
const DevStateSchema = new Schema({
  key: { type: String, required: true, unique: true },
  replayStartedAt: { type: Date },
  lastSyncAt: { type: Date },
});

export type DevState = InferSchemaType<typeof DevStateSchema>;

export default models.DevState || model("DevState", DevStateSchema);
