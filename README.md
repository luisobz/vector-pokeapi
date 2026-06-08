# 🔴 Vector PokéAPI

Pokédex semántica moderna con búsqueda vectorial. Stack: **Fastify** + **PostgreSQL/pgvector** + **Next.js** + embeddings locales.

## ⚡ Quick Start

```bash
pnpm install
docker compose up -d
pnpm db:migrate && pnpm db:seed
pnpm dev
```

🌐 **Frontend**: http://localhost:3000  
🔌 **API**: http://localhost:3001

---

## 📖 Documentación

Para instrucciones detalladas de setup, ver [README_SETUP.md](./README_SETUP.md)

---

## 🎯 Funcionalidades

## Generación de embeddings (opcional, requiere GPU Nvidia)

Ver `scripts/ai-sync/README.md`
