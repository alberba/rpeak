# RPeak MCP

Este paquete expone las herramientas de RPeak por dos transportes:

- `stdio` para uso local con Claude CLI.
- `HTTP` remoto en `/mcp` para ChatGPT y Claude cuando necesitan conectarse a un servidor público.

## Variables de entorno

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RPEAK_USER_ID`
- `MCP_BEARER_TOKEN`
- `MCP_PORT` opcional, por defecto `8787`

## Arranque local

```bash
npm run -w apps/mcp dev
```

## Arranque remoto

```bash
npm run -w apps/mcp dev:http
```

## Conexión remota

Usa esta URL:

- `https://<tu-host>/mcp`

Y este header:

- `Authorization: Bearer <MCP_BEARER_TOKEN>`

## Claude

Configura un servidor MCP remoto apuntando a `/mcp` con autenticación Bearer.

## ChatGPT

En modo Developer Mode, crea una app desde un servidor MCP remoto apuntando a `/mcp`.
ChatGPT soporta `streaming HTTP` y `SSE`.
