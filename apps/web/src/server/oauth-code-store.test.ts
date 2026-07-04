import { beforeEach, describe, expect, it, vi } from "vitest";

const supabase = vi.hoisted(() => ({
  insert: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: () => ({ insert: supabase.insert }),
    rpc: supabase.rpc,
  }),
}));

import { consumeAuthCode, saveAuthCode } from "@/server/oauth-code-store";
import { sha256Base64Url } from "@/server/oauth";

describe("almacén de códigos OAuth", () => {
  beforeEach(() => {
    vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role-de-prueba");
    supabase.insert.mockReset();
    supabase.rpc.mockReset();
  });

  it("persiste únicamente el hash del código", async () => {
    supabase.insert.mockResolvedValue({ error: null });

    await saveAuthCode("codigo-secreto", {
      userId: "8c4972d7-54da-42e6-9363-d1e0c247582b",
      clientId: "rpeak-chatgpt",
      redirectUri: "https://chatgpt.com/connector/oauth/test",
      codeChallenge: "challenge",
      scope: "plans:read",
      resource: "https://rpeak.vercel.app",
      state: "state",
      expiresAt: Date.parse("2026-07-04T20:00:00.000Z"),
    });

    expect(supabase.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        code_hash: sha256Base64Url("codigo-secreto"),
        user_id: "8c4972d7-54da-42e6-9363-d1e0c247582b",
        client_id: "rpeak-chatgpt",
      }),
    );
    expect(JSON.stringify(supabase.insert.mock.calls[0])).not.toContain("codigo-secreto");
  });

  it("consume el código mediante la función atómica", async () => {
    supabase.rpc.mockResolvedValue({
      error: null,
      data: [{
        user_id: "8c4972d7-54da-42e6-9363-d1e0c247582b",
        client_id: "rpeak-chatgpt",
        redirect_uri: "https://chatgpt.com/connector/oauth/test",
        code_challenge: "challenge",
        scope: "plans:read",
        resource: "https://rpeak.vercel.app",
        state: "state",
        expires_at: "2026-07-04T20:00:00.000Z",
      }],
    });

    await expect(consumeAuthCode("codigo-secreto")).resolves.toMatchObject({
      userId: "8c4972d7-54da-42e6-9363-d1e0c247582b",
      clientId: "rpeak-chatgpt",
      codeChallenge: "challenge",
      scope: "plans:read",
    });
    expect(supabase.rpc).toHaveBeenCalledWith("consume_oauth_authorization_code", {
      p_code_hash: sha256Base64Url("codigo-secreto"),
    });
  });

  it("devuelve null si el código no existe o ya fue consumido", async () => {
    supabase.rpc.mockResolvedValue({ error: null, data: [] });
    await expect(consumeAuthCode("inexistente")).resolves.toBeNull();
  });
});
