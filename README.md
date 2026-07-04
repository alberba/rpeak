# RPeak

PWA móvil para planificar, registrar y analizar entrenamientos. La interfaz usa el concepto de **cuaderno de entrenamiento en vivo**: una línea vertical conecta series, descansos y superseries. Está inspirada en la claridad operativa de Hevy, pero mantiene identidad, componentes y lenguaje propios.

## Qué incluye

- Planes con rangos de repeticiones o tiempo, peso, RPE objetivo, descansos y notas.
- Sesiones independientes de sus plantillas: completar series guarda marcas de tiempo reales y activa el descanso correspondiente.
- Superseries con descanso entre ejercicios y entre rondas.
- Historial, detalle y notas por ejercicio/sesión.
- Catálogo local de 873 ejercicios importado desde `wrkout/exercises.json` (Unlicense), sin dependencia en runtime. Cada ficha enlaza a una búsqueda de YouTube.
- Tema claro/oscuro y PWA instalable.
- PostgreSQL/Supabase compartido entre dispositivos, Google OAuth y políticas RLS por usuario.
- API HTTP v1 y servidor MCP reutilizando los mismos esquemas Zod.
- Análisis opcional mediante OpenRouter. Por defecto usa `openrouter/free`; la disponibilidad de modelos gratuitos y sus límites puede variar.

## Arranque rápido

Requiere Node.js 20 o superior.

```bash
pnpm install
pnpm run dev
```

Abre `http://localhost:3000`. Sin variables de Supabase se activa un modo demo claramente identificado, con datos en memoria.

Comandos principales:

```bash
pnpm run ci                 # lint + tipos + tests + build
pnpm run import:exercises   # actualiza el snapshot local del catálogo
pnpm run mcp                # inicia el servidor MCP por stdio
```

## Supabase y acceso con Google

1. Crea un proyecto en Supabase y copia `.env.example` a `apps/web/.env.local`.
2. Añade `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Ejecuta la migración de `supabase/migrations/20260101000000_init.sql` y después `supabase/seed.sql`.
4. En Google Cloud crea credenciales OAuth web y registra como callback `https://<project-ref>.supabase.co/auth/v1/callback`.
5. Activa Google en Supabase Authentication > Providers y configura sus credenciales.
6. En Authentication > URL Configuration añade `http://localhost:3000/auth/callback` y la URL equivalente de producción.

### Migraciones automáticas

El workflow `.github/workflows/deploy-database.yml` ejecuta `supabase db push` cuando una migración llega a `main`.
Configura estos secretos en GitHub, dentro del entorno `production`:

- `SUPABASE_ACCESS_TOKEN`: token personal creado en Supabase > Account > Access Tokens.
- `SUPABASE_DB_PASSWORD`: contraseña de la base de datos del proyecto (no es la service role key).

Las migraciones deben crearse siempre como archivos nuevos dentro de `supabase/migrations`; no cambies el esquema de producción
manualmente desde SQL Editor una vez inicializado este flujo.

Como las tres primeras migraciones de RPeak se aplicaron manualmente, la primera ejecución debe iniciarse desde
GitHub > Actions > Desplegar migraciones de base de datos > Run workflow, marcando `registrar_migraciones_existentes`.
Esto reconcilia el historial y aplica después las migraciones aún pendientes. No vuelvas a marcar esa opción en ejecuciones futuras.

La clave pública de Supabase puede estar en el cliente: la protección efectiva está en las políticas RLS. La `service_role` nunca debe llegar al navegador.

## OpenRouter

Cada usuario añade su propia clave en **Configuración > OpenRouter**. RPeak la cifra con AES-256-GCM antes de persistirla y la base de datos aplica RLS para aislarla por cuenta. La clave nunca se devuelve al cliente después de guardarla.

El servidor necesita una clave maestra aleatoria de 32 bytes, distinta de cualquier clave de proveedor:

```dotenv
CREDENTIAL_ENCRYPTION_KEY=<salida de: openssl rand -base64 32>
OPENROUTER_SITE_URL=https://rpeak.vercel.app
OPENROUTER_APP_NAME=RPeak
```

El endpoint `POST /api/v1/analysis` usa exclusivamente la credencial del usuario autenticado, construye un prompt estructurado y valida la respuesta antes de devolverla. Por defecto se propone `openrouter/free`; también se puede indicar un modelo concreto disponible en OpenRouter.

## API y MCP

La API expone `/api/v1/plans`, `/api/v1/workouts` y `/api/v1/analysis`. En producción obtiene el usuario de la sesión de Supabase y los repositorios aplican aislamiento por usuario.

Para MCP, crea `apps/mcp/.env` con:

```dotenv
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
RPEAK_USER_ID=<uuid-de-auth.users>
```

Ejemplo de configuración de un cliente MCP:

```json
{
  "mcpServers": {
    "rpeak": {
      "command": "pnpm",
      "args": ["run", "mcp"],
      "cwd": "/ruta/absoluta/a/rpeak"
    }
  }
}
```

Herramientas disponibles: listar, obtener, crear, editar y eliminar planes; listar y consultar entrenamientos. Cada instancia MCP queda limitada explícitamente a `RPEAK_USER_ID`.

## Arquitectura

- `apps/web`: Next.js App Router, UI, acciones de servidor y API.
- `apps/mcp`: servidor MCP por stdio.
- `packages/domain`: contratos Zod, tipos y reglas puras compartidas.
- `supabase`: migración, RLS, índices y seed.
- `scripts/import-exercises.mjs`: importación reproducible del catálogo fijado localmente.

Las plantillas (`Plan`) y las ejecuciones (`WorkoutSession`) son entidades distintas. Empezar una sesión crea una instantánea del plan, evitando que una edición posterior altere el historial.
