import { MATCH_STATUSES } from "@/models/Match";

type MatchStatus = (typeof MATCH_STATUSES)[number];

// Estados mapeados a nuestro enum simplificado. Incluye los códigos cortos de API-Football
// (ver docs/product-design.md) y los strings más verbosos que devuelve TheSportsDB.
const STATUS_MAP: Record<string, MatchStatus> = {
  // API-Football (códigos cortos)
  NS: "scheduled",
  TBD: "scheduled",
  "1H": "live",
  HT: "live",
  "2H": "live",
  ET: "live",
  BT: "live",
  P: "live",
  SUSP: "live",
  INT: "live",
  LIVE: "live",
  FT: "finished",
  AET: "finished",
  PEN: "finished",
  AP: "finished",
  PST: "postponed",
  CANC: "cancelled",
  ABD: "cancelled",
  AWD: "cancelled",
  WO: "cancelled",
  // TheSportsDB (strStatus verboso)
  "Not Started": "scheduled",
  "First Half": "live",
  "Halftime": "live",
  "Second Half": "live",
  "Extra Time": "live",
  "Penalty": "live",
  "In Progress": "live",
  Live: "live",
  Suspended: "live",
  "Match Finished": "finished",
  Finished: "finished",
  FRO: "finished",
  "After Extra Time": "finished",
  "After Penalties": "finished",
  Postponed: "postponed",
  Cancelled: "cancelled",
  Canceled: "cancelled",
  Abandoned: "cancelled",
  Awarded: "cancelled",
  Walkover: "cancelled",
};

export function mapApiStatus(shortCode: string): MatchStatus {
  return STATUS_MAP[shortCode] ?? "scheduled";
}
