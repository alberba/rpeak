import { NextResponse } from "next/server";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { ApiError, jsonError, parseJsonBody, withRoute } from "./http";

describe("ApiError / jsonError", () => {
  it("carries status and message", () => {
    const err = new ApiError(404, "no encontrado");
    expect(err.status).toBe(404);
    expect(err.message).toBe("no encontrado");
  });

  it("jsonError builds a NextResponse with the given status", async () => {
    const res = jsonError(400, "bad request", { field: "x" });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ error: "bad request", details: { field: "x" } });
  });
});

describe("parseJsonBody", () => {
  const schema = z.object({ name: z.string().min(1) });

  it("parses and validates a valid JSON body", async () => {
    const request = new Request("http://localhost/x", { method: "POST", body: JSON.stringify({ name: "plan" }) });
    await expect(parseJsonBody(request, schema)).resolves.toEqual({ name: "plan" });
  });

  it("throws ApiError(400) on invalid JSON", async () => {
    const request = new Request("http://localhost/x", { method: "POST", body: "{not json" });
    await expect(parseJsonBody(request, schema)).rejects.toMatchObject({ status: 400 });
  });

  it("throws a ZodError on schema mismatch", async () => {
    const request = new Request("http://localhost/x", { method: "POST", body: JSON.stringify({ name: "" }) });
    await expect(parseJsonBody(request, schema)).rejects.toThrow();
  });
});

describe("withRoute", () => {
  it("passes through a successful response", async () => {
    const handler = withRoute(async () => NextResponse.json({ ok: true }));
    const res = await handler();
    expect(await res.json()).toEqual({ ok: true });
  });

  it("translates ApiError into a JSON error response", async () => {
    const handler = withRoute(async () => {
      throw new ApiError(403, "prohibido");
    });
    const res = await handler();
    expect(res.status).toBe(403);
    expect((await res.json()).error).toBe("prohibido");
  });

  it("translates ZodError into a 400 response", async () => {
    const schema = z.object({ a: z.string() });
    const handler = withRoute(async () => {
      schema.parse({});
      return NextResponse.json({ unreachable: true });
    });
    const res = await handler();
    expect(res.status).toBe(400);
  });

  it("translates unexpected errors into a 500 response", async () => {
    const handler = withRoute(async () => {
      throw new Error("boom");
    });
    const res = await handler();
    expect(res.status).toBe(500);
  });
});
