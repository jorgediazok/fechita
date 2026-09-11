import { describe, it, expect, afterEach } from "vitest";
import { isEmailVerified, isVerificationRequired, canParticipate } from "./emailVerification";

describe("isEmailVerified", () => {
  it("true si emailVerified tiene una fecha", () => {
    expect(isEmailVerified({ emailVerified: new Date() })).toBe(true);
  });

  it("false si es null o undefined", () => {
    expect(isEmailVerified({ emailVerified: null })).toBe(false);
    expect(isEmailVerified({})).toBe(false);
  });
});

describe("isVerificationRequired", () => {
  const original = process.env.REQUIRE_EMAIL_VERIFICATION;

  afterEach(() => {
    if (original === undefined) delete process.env.REQUIRE_EMAIL_VERIFICATION;
    else process.env.REQUIRE_EMAIL_VERIFICATION = original;
  });

  it("false por default (sin la env var)", () => {
    delete process.env.REQUIRE_EMAIL_VERIFICATION;
    expect(isVerificationRequired()).toBe(false);
  });

  it("false con cualquier valor que no sea el string exacto 'true'", () => {
    process.env.REQUIRE_EMAIL_VERIFICATION = "1";
    expect(isVerificationRequired()).toBe(false);
    process.env.REQUIRE_EMAIL_VERIFICATION = "TRUE";
    expect(isVerificationRequired()).toBe(false);
  });

  it("true solo con 'true'", () => {
    process.env.REQUIRE_EMAIL_VERIFICATION = "true";
    expect(isVerificationRequired()).toBe(true);
  });
});

// canParticipate es lo que efectivamente gatea "cargar pronósticos" / "crear-unirse a un
// grupo" en las server actions — la política (isVerificationRequired) es independiente del
// estado real del usuario (isEmailVerified).
describe("canParticipate", () => {
  const original = process.env.REQUIRE_EMAIL_VERIFICATION;

  afterEach(() => {
    if (original === undefined) delete process.env.REQUIRE_EMAIL_VERIFICATION;
    else process.env.REQUIRE_EMAIL_VERIFICATION = original;
  });

  it("con la política apagada, participa aunque no haya confirmado el mail", () => {
    delete process.env.REQUIRE_EMAIL_VERIFICATION;
    expect(canParticipate({ emailVerified: null })).toBe(true);
  });

  it("con la política prendida, solo participa si confirmó el mail", () => {
    process.env.REQUIRE_EMAIL_VERIFICATION = "true";
    expect(canParticipate({ emailVerified: null })).toBe(false);
    expect(canParticipate({ emailVerified: new Date() })).toBe(true);
  });
});
