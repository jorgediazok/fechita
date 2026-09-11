import { Schema, model, models, type InferSchemaType } from "mongoose";

// Una respuesta de trivia por usuario y por día. `dayKey` = triviaDayKey() (lib/trivia/today.ts,
// "YYYY-MM-DD" en huso argentino) — el índice único evita responder dos veces el mismo día
// aunque la acción se dispare dos veces (doble click, reintento de red). `questionId` queda
// guardado por si el catálogo cambia de orden más adelante: la corrección de esa respuesta
// puntual no depende de qué pregunta "cae" hoy, sino de la que cayó el día que se respondió.
const TriviaAnswerSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  dayKey: { type: String, required: true },
  questionId: { type: String, required: true },
  chosenIndex: { type: Number, required: true },
  correct: { type: Boolean, required: true },
  createdAt: { type: Date, default: Date.now },
});

TriviaAnswerSchema.index({ userId: 1, dayKey: 1 }, { unique: true });

export type TriviaAnswer = InferSchemaType<typeof TriviaAnswerSchema>;

export default models.TriviaAnswer || model("TriviaAnswer", TriviaAnswerSchema);
