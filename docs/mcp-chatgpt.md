# Conectar RPeak a ChatGPT

Usa este MCP remoto:

- `https://rpeak.vercel.app/api/mcp`

OAuth server:

- `https://rpeak.vercel.app/oauth`

Autenticación:

- `Bearer token` con el valor de `MCP_BEARER_TOKEN`

Pasos:

1. En ChatGPT, activa `Developer mode`.
2. Ve a `Settings -> Apps -> Advanced settings -> Create app`.
3. Crea la app apuntando al servidor MCP remoto de RPeak.
4. En OAuth, usa el cliente pre-registrado:
   - Client ID: `rpeak-chatgpt`
   - Client secret: `08bf5976a10bda07a13291a46c8b92d9e4cf`
5. Si te pide el servidor de autorización, usa `https://rpeak.vercel.app/oauth`.

Notas:

- El servidor soporta `streaming HTTP`.
- El flujo usa PKCE.
