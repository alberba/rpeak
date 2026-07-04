import { describe, expect, it } from "vitest";
import { buildAuthorizationServerMetadata } from "@/server/oauth";

describe("metadata del servidor OAuth", () => {
  it("solo anuncia las capacidades implementadas", () => {
    expect(buildAuthorizationServerMetadata()).toMatchObject({
      issuer: "https://rpeak.vercel.app/oauth",
      grant_types_supported: ["authorization_code"],
      code_challenge_methods_supported: ["S256"],
      token_endpoint_auth_methods_supported: ["client_secret_basic", "client_secret_post"],
    });
    expect(buildAuthorizationServerMetadata()).not.toHaveProperty("registration_endpoint");
    expect(buildAuthorizationServerMetadata()).not.toHaveProperty("client_id_metadata_document_supported");
  });
});
