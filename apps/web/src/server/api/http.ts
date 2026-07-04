import { NextResponse } from "next/server";
import { ZodError, type ZodType, type ZodTypeDef } from "zod";

/** Error con código HTTP explícito, para que withRoute la traduzca a una respuesta JSON. */
export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export function jsonError(status: number, error: string, details?: unknown) {
  return NextResponse.json({ error, details }, { status });
}

/** Envuelve un handler de ruta traduciendo ApiError/ZodError/errores inesperados a respuestas JSON consistentes. */
export function withRoute<Args extends unknown[]>(
  handler: (...args: Args) => Promise<NextResponse>,
): (...args: Args) => Promise<NextResponse> {
  return async (...args: Args) => {
    try {
      return await handler(...args);
    } catch (err) {
      if (err instanceof ApiError) {
        return jsonError(err.status, err.message, err.details);
      }
      if (err instanceof ZodError) {
        return jsonError(400, "Datos inválidos", err.flatten());
      }
      console.error("Error inesperado en ruta API", err);
      return jsonError(500, "Error interno del servidor");
    }
  };
}

/**
 * Parsea el body JSON de la petición y lo valida contra el schema dado. Lanza ApiError(400) si falla.
 * El schema se tipa como ZodType<T, any, any> (en vez de ZodSchema<T>, que fija Input = Output) porque
 * varios schemas del dominio (p.ej. PlanCreateInputSchema) tienen campos con `.default(...)`: su tipo de
 * entrada es más laxo que el de salida, y queremos que T se infiera siempre como el tipo de SALIDA ya
 * validado, no como el de entrada.
 */
export async function parseJsonBody<T>(request: Request, schema: ZodType<T, ZodTypeDef, unknown>): Promise<T> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    throw new ApiError(400, "El cuerpo de la petición debe ser JSON válido");
  }
  return schema.parse(raw);
}

export function parseQuery<T>(searchParams: URLSearchParams, schema: ZodType<T, ZodTypeDef, unknown>): T {
  return schema.parse(Object.fromEntries(searchParams.entries()));
}
