# 📋 Plan de Proyecto: Pokédex Semántica (Monorrepo) — v2.0

## 1. Stack Tecnológico Definitivo

| Capa | Tecnología |
|---|---|
| Monorrepo | Turborepo + pnpm workspaces |
| Back-end | Fastify + TypeScript (Clean Architecture) |
| Front-end | Next.js (App Router) + Tailwind CSS + Framer Motion |
| Base de datos | Docker compose postgresql+pgvector |
| ORM | Prisma |
| Vectorización (offline) | Python 3.10+ · sentence-transformers · Qwen/Qwen3-Embedding-4B · CUDA |

---

## 2. Estructura del Monorrepo

```
vector-pokeapi-turbo/
├── apps/
│   ├── api/                        # Fastify REST API
│   │   └── src/
│   │       ├── domain/             # Interfaces y tipos de dominio
│   │       └── presentation/       # Rutas y controladores Fastify
│   └── web/                        # Next.js App Router
├── packages/
│   ├── database/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── seed.ts             # Lee seed-data.json y popula la DB
│   │   │   └── seed-data.json      # ⭐ Commitado al repo, generado por ti
│   │   └── src/                    # Cliente Prisma exportable
│   │       ├── infrastructure/     # Repositorios Prisma
│   ├── shared-types/               # Pokemon, EvolutionEdge, SearchTemplate, etc.
│   ├── ui/                         # HolographicCard, RadarChart, EvolutionGraph
│   └── config/                     # ESLint y TS configs compartidas
├── scripts/
│   └── ai-sync/                    # Solo necesario en tu máquina (GPU)
│       ├── fetch_data.py           # PokéAPI → raw-data.json
│       ├── vectorize.py            # raw-data.json → seed-data.json
│       └── requirements.txt
├── turbo.json
├── pnpm-workspace.yaml
└── docker-compose.yml
```

---

## 3. Esquema de Base de Datos (Prisma)

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [pgvector(map: "vector"), unaccent]
}

// Pokémon principal
model Pokemon {
  id           Int      @id
  name         String
  nameEs       String?
  description  String?
  types        String[]
  generation   Int                              // Extraído de /pokemon-species
  stats        Json                             // hp, attack, defense, spAtk, spDef, speed
  sprite       String?                          // URL sprite oficial
  embedding    Unsupported("vector(4096)")?     // Qwen3-Embedding-4B (generado offline)

  evolvesFrom  EvolutionEdge[] @relation("EvolvesTo")
  evolvesTo    EvolutionEdge[] @relation("EvolvesFrom")

  @@index([embedding(ops: vector_cosine_ops)], type: Hnsw)
  @@map("pokemons")
}

// Grafo de evoluciones (extraído de /evolution-chain)
model EvolutionEdge {
  id            Int     @id @default(autoincrement())
  fromPokemonId Int
  toPokemonId   Int
  trigger       String  // "level-up" | "use-item" | "trade" | "other"
  minLevel      Int?
  itemName      String? // piedra lunar, etc.

  from Pokemon @relation("EvolvesFrom", fields: [fromPokemonId], references: [id])
  to   Pokemon @relation("EvolvesTo",   fields: [toPokemonId],   references: [id])

  @@map("evolution_edges")
}

// Templates semánticos pre-vectorizados (UX showcase)
model SearchTemplate {
  id          Int     @id @default(autoincrement())
  queryText   String  @unique @map("query_text")
  category    String? // "tipo", "rol", "lore", "evolución" — para agrupar en UI
  embedding   Unsupported("vector(4096)")?

  @@index([embedding(ops: vector_cosine_ops)], type: Hnsw)
  @@map("search_templates")
}
```

---

## 4. Scripts Python (Solo en tu máquina)

### Flujo general

```
PokéAPI ──► fetch_data.py ──► raw-data.json
                                    │
                              vectorize.py
                              (5070 Ti / CUDA)
                                    │
                              seed-data.json ──► commitado al repo
```

### `fetch_data.py`

Consume tres endpoints de PokéAPI por Pokémon y construye el JSON maestro:

- `/pokemon/{id}` → tipos, stats, sprites
- `/pokemon-species/{id}` → flavor text en español, generación (`generation.name` → `int`)
- `/evolution-chain/{id}` → grafo completo de la línea evolutiva

El script parsea el árbol recursivo de `chain` que devuelve el endpoint y lo aplana en una lista de edges `{ from, to, trigger, minLevel, itemName }`. Esto cubre automáticamente líneas simples (Bulbasaur), ramificadas (Eevee) y sin evolución (Legendarios).

Guarda un `checkpoint.json` por generación para ser idempotente: si se interrumpe, reanuda desde donde quedó.

```
raw-data.json
├── pokemons: [{ id, name, nameEs, description, types, generation, stats, sprite }]
├── evolutionEdges: [{ fromId, toId, trigger, minLevel?, itemName? }]
└── searchTemplates: [{ queryText, category }]
```

### `vectorize.py`

Carga `Qwen/Qwen3-Embedding-4B` en VRAM una sola vez y vectoriza en batches:

1. **Pokémon** — genera el texto de entrada concatenando: `"{name} | tipos: {types} | gen: {generation} | {description}"`. Batch size 32–64 según VRAM disponible.
2. **Search Templates** — mismo proceso para las ~1000 queries de ejemplo.

El output es `seed-data.json`, idéntico a `raw-data.json` pero con campo `embedding: number[]` añadido a cada Pokémon y template. Este archivo se commitea al repo.

### Search Templates — contenido y propósito

Los ~1000 templates son queries pre-vectorizadas que sirven como **showcase de búsqueda semántica** en la UI: aparecen como chips clickables en la barra de búsqueda y demuestran el potencial de los vectores sin que el visitante tenga GPU ni sepa qué buscar.

Ejemplos por categoría:

| Categoría | Ejemplos |
|---|---|
| `tipo` | "ratón eléctrico", "serpiente venenosa", "dragón volador" |
| `rol` | "tanque defensivo lento", "atacante físico rápido", "soporte curación" |
| `lore` | "criatura misteriosa de las profundidades", "guardián de las montañas" |
| `evolución` | "se transforma con piedra lunar", "evoluciona al intercambiar" |

---

## 5. Seed (Prisma)

`seed.ts` lee `seed-data.json` y ejecuta:

1. `prisma.$executeRaw` para los inserts de Pokémon usando cast `::vector` para el embedding
2. `createMany` para los `EvolutionEdge`
3. `prisma.$executeRaw` para los `SearchTemplate` con sus vectores

Cualquier desarrollador despliega con:

```bash
pnpm db:migrate && pnpm db:seed
```

Sin Python. Sin GPU. Sin configuración adicional.

---

## 6. Back-end (Fastify — Clean Architecture)

### Capas

```
presentation/    rutas + validación de input (Zod)
     │
infrastructure/  repositorios que implementan interfaces de dominio (Prisma)
     │
domain/          interfaces, entidades, lógica de negocio pura
```

### Endpoints

#### `GET /api/pokemon/:id`
Devuelve el Pokémon completo con su grafo evolutivo resuelto: tanto las evoluciones anteriores (`evolvesFrom`) como las posteriores y laterales (`evolvesTo`), incluyendo el trigger de cada edge. El frontend recibe un objeto listo para renderizar el diagrama sin lógica adicional.

#### `GET /api/search?q=texto&type=X&gen=Y`

Dos modos según el origen del query:

**Modo semántico** (query viene de click en template):
```
GET /api/search?templateId=42&type=fuego&gen=1
```
El repositorio extrae el vector pre-calculado del template y ejecuta KNN con filtros opcionales:
```sql
SELECT * FROM pokemons
WHERE ($type IS NULL OR $type = ANY(types))
  AND ($gen  IS NULL OR generation = $gen)
ORDER BY embedding <=> (SELECT embedding FROM search_templates WHERE id = $templateId)
LIMIT 12;
```

**Modo textual** (query libre del usuario):
```
GET /api/search?q=charizard&type=fuego&gen=1
```
Full-text search con `ILIKE` sobre `name` y `description`, con los mismos filtros opcionales.

#### `GET /api/pokemon/:id/similar`
El endpoint estrella para el showcase vectorial. Devuelve los N Pokémon más similares semánticamente al Pokémon dado, **agrupados por generación**:
```sql
SELECT *, 1 - (embedding <=> $targetEmbedding) AS similarity_score
FROM pokemons
WHERE id != $id
ORDER BY embedding <=> $targetEmbedding
LIMIT 24;
```
El repositorio agrupa los resultados por `generation` antes de devolver la respuesta, para que el frontend pueda renderizar las secciones directamente.

---

## 7. Front-end (Next.js App Router)

Eres un experto frontend. Siempre usa Tailwind CSS v4.3+ el cual puedes ver en tailwind.md informacion util. Prioriza clases utility-first, responsive (mobile-first), dark mode, accesibilidad y animaciones suaves. Usa clsx o cn(). Evita CSS vanilla a menos que sea estrictamente necesario.

### Páginas

```
/                    → Buscador principal
/pokemon/[id]        → Vista detalle
```

### Buscador (`/`)

- **Barra de búsqueda** con debounce de 300ms
- **Chips de templates** agrupados por categoría debajo del input. Al cargar la página se muestran ~12 templates destacados (mix de categorías). Al hacer click en uno, se lanza búsqueda semántica con su `templateId`
- **Filtros** de tipo (con iconografía oficial) y generación (I–IX)
- **Grid de resultados** con `HolographicCard`

### `HolographicCard` (packages/ui)

Construida con Framer Motion:
- Registra posición del cursor con `onMouseMove`
- Aplica `rotateX`/`rotateY` para el efecto 3D
- Capa pseudo-elemento con gradiente dinámico que simula el reflejo holográfico del TCG
- **Hover abanico:** lee el array de `evolvesTo` del Pokémon y despliega tarjetas secundarias con `stagger` de Framer Motion

### Vista Detalle (`/pokemon/[id]`)

Layout en dos columnas:
- **Izquierda:** `HolographicCard` estática + tipos + generación
- **Derecha:** Stats con Radar Chart (Recharts), línea evolutiva y similares semánticos

**Evolution Roadmap:**
- Diagrama de nodos donde cada nodo es el sprite del Pokémon
- Las líneas de conexión llevan tooltip con el trigger evolutivo (ícono de nivel, sprite del ítem, icono de intercambio)
- Cubre ramificaciones (Eevee renderiza 8 nodos en abanico)

**Pokémon Conceptualmente Similares:**
- Sección inferior con título tipo *"Pokémon con esencia similar"*
- Resultados de `GET /api/pokemon/:id/similar` agrupados en acordeones por generación (Gen I, Gen II…)
- Cada resultado muestra su `similarity_score` como barra de progreso
- Esta sección es el showcase principal del valor de los embeddings

---

## 8. Flujo de Desarrollo por Fases

```
Fase 0 — Setup
  └── Turborepo + pnpm + packages base + Prisma configurado

Fase 1 — Data pipeline (en tu máquina)
  └── fetch_data.py → vectorize.py → seed-data.json commitado

Fase 2 — Base de datos
  └── Schema Prisma + migraciones + seed.ts verificado

Fase 3 — API
  └── GET /pokemon/:id → GET /search → GET /pokemon/:id/similar

Fase 4 — Frontend
  └── Buscador → HolographicCard → Vista detalle → Similares
```