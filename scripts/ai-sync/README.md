# AI Sync — Generación de embeddings (requiere GPU)

## Setup

```bash
cd scripts/ai-sync
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# Si tienes CUDA 12.8:
pip install torch --index-url https://download.pytorch.org/whl/cu128
```

## Orden de ejecución

### 1. Fetch de datos desde PokéAPI
```bash
python fetch_data.py
# Output: raw-data.json (ignorado por git)
# Usa checkpoint.json para reanudar si se interrumpe
```

### 2. Vectorización con Qwen3-Embedding-4B
```bash
python vectorize.py
# Input:  raw-data.json
# Output: ../../packages/database/prisma/seed-data.json
# Carga el modelo en VRAM una sola vez, procesa en batches de 32
```

### 3. Commitear la seed
```bash
cd ../..
git add packages/database/prisma/seed-data.json
git commit -m "chore: update vectorized seed data"
```

## Servidor de embeddings (búsqueda de texto libre en runtime)

```bash
python embed_server.py
# Levanta FastAPI en http://localhost:8000
# POST /embed { "text": "ratón eléctrico" } → { "embedding": [...] }
```
