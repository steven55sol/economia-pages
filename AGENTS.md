# economía-app

Aplicación web de economía construida con Astro.

## Tecnología

- **Astro** (`^7.4.7`) — framework de sitio/SSG.
- **JavaScript puro** — sin TypeScript, sin React/Vue/Svelte ni otros frameworks de UI.
- **Tailwind CSS** — sistema de estilos del proyecto.
- **pnpm** — gestor de paquetes (`pnpm-lock.yaml`).

### Reglas de dependencias

- **No instales frameworks ni librerías.**
- No agregues React, Vue, Svelte, Solid, Preact, etc.
- No agregues librerías de UI, estado, animación, iconos ni utilidades externas.
- La interactividad se hace con JavaScript puro dentro de `<script>` en los componentes `.astro`.
- Los estilos se hacen con clases de Tailwind CSS.
- Antes de agregar cualquier dependencia, consulta con el usuario.

## Estructura del proyecto

```
economia-app/
├── public/                  # Archivos estáticos servidos tal cual (favicon.svg, favicon.ico)
├── src/
│   └── pages/               # Rutas basadas en archivos
│       └── index.astro      # Página principal (/)
├── .vscode/                 # Configuración del editor
├── node_modules/            # Dependencias instaladas (no editar)
├── .gitignore
├── AGENTS.md                # Instrucciones para agentes
├── astro.config.mjs         # Configuración de Astro
├── package.json             # Scripts y dependencias
├── pnpm-lock.yaml           # Lockfile de pnpm
├── README.md
└── tsconfig.json            # Configuración base de Astro (no implica usar TypeScript)
```

### Dónde va cada cosa

- `src/pages/` — una página por archivo; la ruta se deriva del nombre del archivo (`index.astro` → `/`, `about.astro` → `/about`).
- `public/` — assets estáticos referenciados desde la raíz (`/favicon.svg`). No se procesan.
- `src/components/` — crear aquí los componentes `.astro` reutilizables.
- `src/layouts/` — crear aquí los layouts `.astro` (por ejemplo, un layout base con `<head>`, header y footer).
- `src/styles/` — crear aquí el CSS global y la configuración de Tailwind.
- `src/scripts/` — crear aquí el JavaScript puro compartido, si hace falta.
- `src/assets/` — imágenes que deban ser optimizadas por Astro.
- `astro.config.mjs` — configuración de Astro (integraciones, opciones de build).

## Scripts

```bash
pnpm dev       # Servidor de desarrollo
pnpm build     # Build de producción
pnpm preview   # Previsualizar el build
```

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
