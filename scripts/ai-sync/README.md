# AI Sync — Generación de Embeddings (requiere GPU)

Sistema para generar embeddings de alta calidad de datos Pokémon usando **Qwen3-Embedding-8B** y preparar el `seed-data.json` para Prisma.

---

## Características

- Descarga fresca desde PokéAPI
- Embeddings con modelo Qwen3-Embedding-8B (4096 → padded a 1536)
- Soporte de checkpoint y reanudación
- Servidor FastAPI para búsquedas en runtime

---

## Prerrequisitos Local minimos

- **RTX 5070 Ti** → Perfectamente compatible (16GB)
- Python 3.13
- [mise](https://mise.jdx.dev)
- Ollama

---

## Uso con Mise

```bash
mise run install     # Instalar dependencias
mise run all         # Fetch + Vectorize completo
```

### Comandos individuales

```bash
mise run fetch      # Descargar datos PokéAPI
mise run vectorize  # Generar embeddings
```

---

## Detalles del Pipeline

### 1. Fetch
- `python fetch_data.py`
- Output: `data/raw-data.json`

### 2. Vectorize (mejorado)
- `python vectorize.py`
- Modelo: **Qwen/Qwen3-Embedding-4B**
- Batch size recomendado: **48-64** (RTX 5070 Ti)
- Flash Attention 2 + FP16
- Padding automático a 4096 dimensiones

---

## Servidor de Embeddings

```bash
python embed_server.py
```

**Endpoint:**
`POST http://localhost:8000/embed`

```json
{
  "text": "ratón eléctrico tipo planta"
}
```

---

## Troubleshooting (RTX 5070 Ti)

- **CUDA out of memory** → Baja `batch_size` a 32 en `vectorize.py`
- **No detecta GPU** → Verifica con:
  ```bash
  python -c "import torch; print(torch.cuda.is_available()); print(torch.cuda.get_device_name(0))"
  ```
- **Error de compute capability** → Asegúrate de haber instalado Torch con `cu128`

---

