# Vector PokéAPI Turbo

Pokédex semántica con búsqueda vectorial. Stack: Fastify + PostgreSQL/pgvector + Next.js + embeddings locales (Qwen3-Embedding-4B).

## Requisitos

- Node.js >= 22
- pnpm >= 9
- Docker (para PostgreSQL)

## Setup

```bash
# 1. Instalar dependencias
pnpm install

# 2. Levantar PostgreSQL con pgvector
docker compose up -d

# 3. Migrar y popular la base de datos (seed pre-vectorizado incluido)
pnpm db:migrate
pnpm db:seed

# 4. Desarrollo
pnpm dev
```

- API:      http://localhost:3001
- Web:      http://localhost:3000

## Generación de embeddings (opcional, requiere GPU Nvidia)

Ver `scripts/ai-sync/README.md`
