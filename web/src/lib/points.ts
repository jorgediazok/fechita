import type { PREDICTION_DIRECTIONS } from "@/models/Prediction";

type Direction = (typeof PREDICTION_DIRECTIONS)[number];

type ScoredMatch = {
  homeScore: number;
  awayScore: number;
};

type ScoredPrediction = {
  predictedDirection: Direction;
  predictedHomeScore?: number | null;
  predictedAwayScore?: number | null;
};

export function directionFromScores(homeScore: number, awayScore: number): Direction {
  if (homeScore > awayScore) return "home";
  if (homeScore < awayScore) return "away";
  return "draw";
}

export function calculatePoints(pred: ScoredPrediction, match: ScoredMatch): number {
  const hasExactGuess = pred.predictedHomeScore != null && pred.predictedAwayScore != null;

  if (
    hasExactGuess &&
    pred.predictedHomeScore === match.homeScore &&
    pred.predictedAwayScore === match.awayScore
  ) {
    return 5;
  }

  const actualDirection = directionFromScores(match.homeScore, match.awayScore);
  return pred.predictedDirection === actualDirection ? 3 : 0;
}
