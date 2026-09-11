import { describe, it, expect } from "vitest";
import { bestTierOf } from "./profile";
import type { User } from "@/models/User";

type PickedUser = Pick<User, "currentTier" | "bestTier">;

describe("bestTierOf", () => {
  it("devuelve currentTier cuando coincide con bestTier", () => {
    expect(bestTierOf({ currentTier: "C", bestTier: "C" })).toBe("C");
  });

  it("devuelve el más alto entre currentTier y bestTier (el techo no baja al descender)", () => {
    expect(bestTierOf({ currentTier: "D", bestTier: "NACIONAL" })).toBe("NACIONAL");
  });

  it("currentTier más alto que un bestTier desactualizado también gana", () => {
    expect(bestTierOf({ currentTier: "PRIMERA", bestTier: "B" })).toBe("PRIMERA");
  });

  it("sin bestTier persistido (documentos previos al campo), cae a D o al currentTier si es más alto", () => {
    // bestTier tiene default "D" en el schema, pero un documento viejo migrado a mano puede
    // no tenerlo — de ahí el `?? "D"` en la implementación. Se castea porque el tipo generado
    // por Mongoose no admite undefined (el default lo hace no-opcional en TS).
    expect(bestTierOf({ currentTier: "D" } as PickedUser)).toBe("D");
    expect(bestTierOf({ currentTier: "B" } as PickedUser)).toBe("B");
  });
});
