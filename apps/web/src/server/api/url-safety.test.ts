import { describe, expect, it } from "vitest";
import { sanitizeRedirectTarget } from "./url-safety";

describe("sanitizeRedirectTarget", () => {
  it("returns / when there is no next param", () => {
    expect(sanitizeRedirectTarget(null)).toBe("/");
    expect(sanitizeRedirectTarget(undefined)).toBe("/");
    expect(sanitizeRedirectTarget("")).toBe("/");
  });

  it("allows relative paths within the site", () => {
    expect(sanitizeRedirectTarget("/planes")).toBe("/planes");
    expect(sanitizeRedirectTarget("/historial/123")).toBe("/historial/123");
  });

  it("rejects absolute URLs to other hosts (open redirect)", () => {
    expect(sanitizeRedirectTarget("https://evil.example")).toBe("/");
    expect(sanitizeRedirectTarget("http://evil.example/phish")).toBe("/");
  });

  it("rejects protocol-relative URLs", () => {
    expect(sanitizeRedirectTarget("//evil.example")).toBe("/");
  });

  it("rejects backslash tricks used to bypass naive checks", () => {
    expect(sanitizeRedirectTarget("/\\evil.example")).toBe("/");
  });
});
