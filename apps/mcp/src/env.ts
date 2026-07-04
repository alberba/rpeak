import { z } from "zod";

/**
 * El servidor MCP usa la service role key (bypassa RLS), así que nunca acepta un
 * userId por parámetro de herramienta: solo opera sobre RPEAK_USER_ID, fijado en el
 * entorno de este proceso. Así un prompt no puede hacer que el modelo lea o escriba
 * los datos de otro usuario simplemente pasando otro id como argumento.
 */
const EnvSchema = z.object({
  SUPABASE_URL: z.string().url({ message: "SUPABASE_URL debe ser una URL válida" }),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "Falta SUPABASE_SERVICE_ROLE_KEY"),
  RPEAK_USER_ID: z.string().min(1, "Falta RPEAK_USER_ID"),
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
