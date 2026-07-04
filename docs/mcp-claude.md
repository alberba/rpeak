# Conectar RPeak a Claude

Usa este MCP remoto:

- `https://rpeak.vercel.app/api/mcp`

OAuth server:

- `https://rpeak.vercel.app/oauth`

Autenticación:

- `Authorization: Bearer <MCP_BEARER_TOKEN>`

Si usas Claude CLI local:

- sigue usando el transporte `stdio` del paquete `apps/mcp`

Si usas Claude con servidor remoto:

1. Añade el endpoint MCP remoto.
2. Configura OAuth con PKCE.
3. Prueba primero una herramienta de lectura.
