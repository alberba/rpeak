import { afterEach, describe, expect, it, vi } from "vitest";
import { decryptCredential, encryptCredential } from "./credential-crypto";

describe("credential-crypto", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("cifra y descifra una credencial sin dejar el texto en claro", () => {
    vi.stubEnv("CREDENTIAL_ENCRYPTION_KEY", Buffer.alloc(32, 7).toString("base64"));
    const secret = "sk-or-v1-clave-de-prueba";
    const encrypted = encryptCredential(secret);

    expect(encrypted).not.toContain(secret);
    expect(decryptCredential(encrypted)).toBe(secret);
  });

  it("rechaza una carga cifrada manipulada", () => {
    vi.stubEnv("CREDENTIAL_ENCRYPTION_KEY", Buffer.alloc(32, 7).toString("base64"));
    const encrypted = encryptCredential("sk-or-v1-clave-de-prueba");
    const tampered = encrypted.slice(0, -1) + (encrypted.endsWith("a") ? "b" : "a");

    expect(() => decryptCredential(tampered)).toThrow();
  });

  it("exige una clave maestra de 32 bytes", () => {
    vi.stubEnv("CREDENTIAL_ENCRYPTION_KEY", Buffer.from("corta").toString("base64"));
    expect(() => encryptCredential("secreto")).toThrow(/32 bytes/);
  });
});
