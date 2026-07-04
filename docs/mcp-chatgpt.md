# Conectar RPeak a ChatGPT

Usa este MCP remoto:

- `https://rpeak.vercel.app/api/mcp`

Autenticación:

- `Bearer token` con el valor de `MCP_BEARER_TOKEN`

Pasos:

1. En ChatGPT, activa `Developer mode`.
2. Ve a `Settings -> Apps -> Advanced settings -> Create app`.
3. Crea la app apuntando al servidor MCP remoto de RPeak.
4. Cuando te pida autenticación, usa el token bearer.

Notas:

- El servidor soporta `streaming HTTP`.
- Si quieres máxima compatibilidad, prueba primero solo lectura con una herramienta de consulta.
