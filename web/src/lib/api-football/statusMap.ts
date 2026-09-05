import { MATCH_STATUSES } from "@/models/Match";

type MatchStatus = (typeof MATCH_STATUSES)[number];

// Códigos de estado de API-Football (ver docs/product-design.md) mapeados a nuestro enum simplificado.
const STATUS_MAP: Record<string, MatchStatus> = {
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
  PST: "postponed",
  CANC: "cancelled",
  ABD: "cancelled",
  AWD: "cancelled",
  WO: "cancelled",
};

export function mapApiStatus(shortCode: string): MatchStatus {
  return STATUS_MAP[shortCode] ?? "scheduled";
}
