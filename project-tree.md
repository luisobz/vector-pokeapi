# Estructura del Monorepo: `vector-pokeapi-turbo`

## Raíz del monorepo
- `vector-pokeapi-turbo/`
    - `.env.example` - Variables de entorno necesarias (DATABASE_URL, etc.)
    - `.gitignore`
    - `README.md` - Setup completo: seed, dev, docker
    - `turbo.json` - Pipelines: build, dev, lint, typecheck
    - `pnpm-workspace.yaml` - Declaración de workspaces
    - `docker-compose.yml` - PostgreSQL + pgvector. Único requisito externo
    - `package.json` - Scripts raíz: dev, build, db:migrate, db:seed

## apps/api — Fastify Backend
- `apps/api/`
    - `package.json`
    - `tsconfig.json`
    - `.env` - DATABASE_URL, EMBED_SERVER_URL, PORT
    - `src/`
        - `server.ts` - Bootstrap Fastify, registro de plugins y rutas
        - `app.ts` - Factory de la app (testeable sin levantar el servidor)
        - `domain/` - Interfaces puras, sin dependencias de infraestructura
            - `pokemon.repository.interface.ts`
            - `search-template.repository.interface.ts`
            - `search.service.interface.ts`
        - `infrastructure/` - Implementaciones concretas (Prisma, HTTP)
            - `repositories/`
                - `pokemon.prisma.repository.ts` - Queries KNN, detalle, similares
                - `search-template.prisma.repository.ts` - Lectura de templates por categoría
            - `services/`
                - `search.service.ts` - Orquesta modo semántico vs textual
                - `embed-client.service.ts` - HTTP client hacia embed_server.py (solo en dev/prod con GPU)
        - `presentation/` - Rutas Fastify + validación Zod
            - `routes/`
                - `pokemon.routes.ts` - GET /api/pokemon/:id
                - `search.routes.ts` - GET /api/search?q=&templateId=&type=&gen=
                - `similar.routes.ts` - GET /api/pokemon/:id/similar
                - `templates.routes.ts` - GET /api/search/templates
            - `schemas/` - Schemas Zod para validar params y querystrings
                - `pokemon.schema.ts`
                - `search.schema.ts`

## apps/web — Next.js Frontend
- `apps/web/`
    - `package.json`
    - `tsconfig.json`
    - `next.config.ts`
    - `tailwind.config.ts`
    - `.env.local` - NEXT_PUBLIC_API_URL
    - `src/`
        - `app/` - App Router de Next.js
            - `layout.tsx` - Root layout: fuentes, providers globales
            - `page.tsx` - Home: buscador + grid de templates
            - `globals.css`
            - `pokemon/[id]/`
                - `page.tsx` - Vista detalle: card + stats + evoluciones + similares
        - `components/`
            - `search/`
                - `SearchBar.tsx` - Input con debounce 300ms
                - `TemplateChips.tsx` - Chips clickables por categoría (showcase semántico)
                - `FilterBar.tsx` - Selects de tipo (iconografía oficial) y generación I–IX
                - `SearchResults.tsx` - Grid de HolographicCards
            - `pokemon/`
                - `StatsRadar.tsx` - Radar chart con Recharts (hp, atk, def, spA, spD, spe)
                - `EvolutionGraph.tsx` - Diagrama de nodos con sprites + tooltips de trigger
                - `SimilarPokemon.tsx` - Acordeón por generación + barra de similarity_score
            - `layout/`
                - `Navbar.tsx`
        - `lib/`
            - `api.ts` - Fetch helpers tipados hacia la API de Fastify
            - `utils.ts` - typeColorMap, generationLabel, formatSimilarity...
        - `hooks/`
            - `useSearch.ts` - Estado de búsqueda: modo semántico vs textual
            - `usePokemon.ts` - Fetch de detalle + similares

## packages — Código compartido
- `packages/database/`
    - `package.json`
    - `tsconfig.json`
    - `prisma/`
        - `schema.prisma` - Pokemon, EvolutionEdge, SearchTemplate + índices HNSW
        - `seed.ts` - Lee seed-data.json, inserta via $executeRaw con ::vector cast
        - `seed-data.json` - Generado con GPU. Commiteado al repo (no requiere GPU para usar)
    - `src/`
        - `index.ts` - Exporta PrismaClient singleton para uso en otros packages
- `packages/shared-types/`
    - `package.json`
    - `tsconfig.json`
    - `src/`
        - `pokemon.types.ts` - Pokemon, PokemonStats, PokemonDetail
        - `evolution.types.ts` - EvolutionEdge, EvolutionTrigger
        - `search.types.ts` - SearchResult, SearchTemplate, SearchMode
        - `index.ts` - Re-exporta todo
- `packages/ui/` - Componentes visuales reutilizables (React + Framer Motion)
    - `package.json`
    - `tsconfig.json`
    - `src/`
        - `HolographicCard.tsx` - Efecto 3D TCG con rotateX/Y + gradiente dinámico + abanico evolutivo en hover
        - `index.ts`
- `packages/config/` - Configs compartidas entre todos los packages y apps
    - `package.json`
    - `eslint-base.js`
    - `eslint-react.js`
    - `tsconfig.base.json`

## scripts/ai-sync — Solo en máquina con GPU
- `scripts/ai-sync/`
    - `fetch_data.py` - PokéAPI (/pokemon + /pokemon-species + /evolution-chain) → raw-data.json. Con checkpoint por generación
    - `vectorize.py` - raw-data.json + Qwen3-Embedding-4B vía CUDA → seed-data.json (pokémon + templates vectorizados)
    - `embed_server.py` - FastAPI: POST /embed. Carga el modelo en VRAM, sirve embeddings on-demand
    - `raw-data.json` - Output de fetch_data.py (en .gitignore)
    - `checkpoint.json` - Estado del fetch (en .gitignore)
    - `requirements.txt` - sentence-transformers, torch+cuda, fastapi, uvicorn, httpx
    - `README.md` - Instrucciones: entorno conda/venv, orden de ejecución, cómo commitear seed-data.json


## Puntos clave de la estructura

Aquí algunos detalles estratégicos sobre cómo está organizado el proyecto:

### Decisiones de arquitectura y organización

* **`scripts/ai-sync/` y `embed_server.py`**:
    * Esta carpeta funciona como un espacio para herramientas de desarrollo y producción específicas del entorno de generación.
    * No es un requisito indispensable para quien clona el repositorio. La API de Fastify se comunica con este servicio para realizar búsquedas de texto libre, pero está diseñada para **degradar graciosamente** a una búsqueda textual estándar si el servicio no está disponible.

* **Gestión de Datos y `.gitignore`**:
    * `raw-data.json` y `checkpoint.json` están incluidos en `.gitignore`.
    * Solo `seed-data.json` se commitea, ya que es el artefacto final y listo para consumir que permite a cualquier usuario utilizar la base de datos sin necesidad de ejecutar todo el pipeline de IA.

* **Modularidad en `packages/ui/`**:
    * `packages/ui/` contiene únicamente `HolographicCard`, por ser un componente verdaderamente agnóstico de dominio.
    * Componentes específicos como `StatsRadar`, `EvolutionGraph` y `SimilarPokemon` residen en `apps/web/`, ya que dependen directamente de los tipos del dominio Pokémon y no aportan valor fuera de ese contexto.

* **Resiliencia en `infrastructure/services/`**:
    * `embed-client.service.ts` implementa una capa de abstracción. Si el servidor de embeddings no responde, el `search.service.ts` captura el error y aplica un *fallback* automático, permitiendo que las rutas (presentation layer) funcionen sin enterarse de la incidencia.
