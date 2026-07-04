import { z } from "zod";

const EnvSchema = z.object({
  SUPABASE_URL: z.string().url({ message: "SUPABASE_URL debe ser una URL válida" }),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "Falta SUPABASE_SERVICE_ROLE_KEY"),
});

export type Env = z.infer<typeof EnvSchema>;

export function loadEnv(): Env {
  const result = EnvSchema.safeParse(process.env);
  if (!result.success) {
    const issues = result.error.issues.map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`).join("\n");
    // stderr, nunca stdout: el canal stdout de un servidor MCP stdio es el protocolo JSON-RPC.
    console.error(`Configuración de entorno inválida para @rpeak/mcp:\n${issues}`);
    process.exit(1);
  }
  return result.data;
}

/** El transporte stdio no tiene OAuth; por eso necesita fijar un único usuario local. */
export function loadLocalUserId(): string {
  const result = z.string().uuid("RPEAK_USER_ID debe ser un UUID válido").safeParse(process.env.RPEAK_USER_ID);
  if (!result.success) throw new Error(result.error.issues[0]?.message ?? "Falta RPEAK_USER_ID");
  return result.data;
}
