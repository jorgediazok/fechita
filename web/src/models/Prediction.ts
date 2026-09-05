import { Schema, model, models, type InferSchemaType } from "mongoose";

export const PREDICTION_DIRECTIONS = ["home", "draw", "away"] as const;

const PredictionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  matchId: { type: Schema.Types.ObjectId, ref: "Match", required: true },
  // Carga mínima tipo boleta de quiniela: quién gana. Siempre presente.
  predictedDirection: { type: String, enum: PREDICTION_DIRECTIONS, required: true },
  // Resultado exacto: opcional, solo si el usuario se anima al bonus de 5 pts.
  predictedHomeScore: { type: Number, default: null },
  predictedAwayScore: { type: Number, default: null },
  points: { type: Number, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

PredictionSchema.index({ userId: 1, matchId: 1 }, { unique: true });

export type Prediction = InferSchemaType<typeof PredictionSchema>;

export default models.Prediction || model("Prediction", PredictionSchema);
