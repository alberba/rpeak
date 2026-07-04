import { describe, expect, it } from "vitest";
import { DELETE, GET, PATCH } from "./route";

function ctx(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe("GET /api/v1/plans/[id] (modo demo)", () => {
  it("returns a seeded plan owned by the demo user", async () => {
    const res = await GET(new Request("http://localhost"), ctx("demo-plan-fullbody"));
    expect(res.status).toBe(200);
    expect((await res.json()).id).toBe("demo-plan-fullbody");
  });

  it("returns 404 for a plan that doesn't exist", async () => {
    const res = await GET(new Request("http://localhost"), ctx("does-not-exist"));
    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/v1/plans/[id] (modo demo)", () => {
  it("updates the name of an existing plan", async () => {
    const request = new Request("http://localhost", { method: "PATCH", body: JSON.stringify({ name: "Renombrado" }) });
    const res = await PATCH(request, ctx("demo-plan-superset"));
    expect(res.status).toBe(200);
    expect((await res.json()).name).toBe("Renombrado");
  });

  it("returns 404 when updating a plan that doesn't exist", async () => {
    const request = new Request("http://localhost", { method: "PATCH", body: JSON.stringify({ name: "x" }) });
    const res = await PATCH(request, ctx("does-not-exist"));
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/v1/plans/[id] (modo demo)", () => {
  it("returns 404 when deleting a plan that doesn't exist", async () => {
    const res = await DELETE(new Request("http://localhost"), ctx("does-not-exist"));
    expect(res.status).toBe(404);
  });

  it("deletes an existing plan and returns 204", async () => {
    const res = await DELETE(new Request("http://localhost"), ctx("demo-plan-fullbody"));
    expect(res.status).toBe(204);

    const after = await GET(new Request("http://localhost"), ctx("demo-plan-fullbody"));
    expect(after.status).toBe(404);
  });
});
