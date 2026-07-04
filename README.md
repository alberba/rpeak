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
npm install
npm run dev
```

Abre `http://localhost:3000`. Sin variables de Supabase se activa un modo demo claramente identificado, con datos en memoria.

Comandos principales:

```bash
npm run ci                 # lint + tipos + tests + build
npm run import:exercises   # actualiza el snapshot local del catálogo
npm run mcp                # inicia el servidor MCP por stdio
```

## Supabase y acceso con Google

1. Crea un proyecto en Supabase y copia `.env.example` a `apps/web/.env.local`.
2. Añade `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Ejecuta la migración de `supabase/migrations/20260101000000_init.sql` y después `supabase/seed.sql`.
4. En Google Cloud crea credenciales OAuth web y registra como callback `https://<project-ref>.supabase.co/auth/v1/callback`.
5. Activa Google en Supabase Authentication > Providers y configura sus credenciales.
6. En Authentication > URL Configuration añade `http://localhost:3000/auth/callback` y la URL equivalente de producción.

La clave pública de Supabase puede estar en el cliente: la protección efectiva está en las políticas RLS. La `service_role` nunca debe llegar al navegador.

## OpenRouter

Configura en `apps/web/.env.local`:

```dotenv
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=openrouter/free
```

El endpoint `POST /api/v1/analysis` construye un prompt estructurado y valida la respuesta antes de devolverla. Sin clave, la aplicación informa de que el análisis no está disponible. Para fijar un modelo gratuito concreto, usa un identificador vigente terminado en `:free`.

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
      "command": "npm",
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
