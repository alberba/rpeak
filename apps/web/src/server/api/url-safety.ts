/**
 * Restringe redirecciones post-login a rutas relativas del propio sitio, para evitar
 * open redirects (p.ej. ?next=https://evil.example o ?next=//evil.example).
 */
export function sanitizeRedirectTarget(nextParam: string | null | undefined): string {
  if (!nextParam) return "/";
  if (!nextParam.startsWith("/") || nextParam.startsWith("//") || nextParam.startsWith("/\\")) return "/";
  return nextParam;
}
