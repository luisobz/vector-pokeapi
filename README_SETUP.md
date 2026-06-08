# 🔴 Vector PokéAPI - Setup Guía de Inicio

Una Pokédex semántica moderna con búsqueda vectorial, construida con **TypeScript**, **Next.js** y **Fastify**.

---

## 📋 Requisitos Previos

- **Node.js** ≥ 22
- **pnpm** ≥ 9 (gestor de paquetes)
- **Docker** y **Docker Compose** (para PostgreSQL)

---

## 🚀 Setup Rápido (5 minutos)

### 1. Instalar Dependencias

```bash
pnpm install
```

### 2. Levantar la Base de Datos

```bash
docker compose up -d
```

Esto inicia PostgreSQL con la extensión `pgvector` (necesaria para búsqueda vectorial).

### 3. Migrar y Rellenar Base de Datos

```bash
pnpm db:migrate
pnpm db:seed
```

El seed pre-vectorizado incluye:
- 1,025 Pokémon con sus embeddings
- Relaciones de evolución completas
- Datos bilingües (EN/ES)
- Templates de búsqueda semántica

### 4. Iniciar el Desarrollo

```bash
pnpm dev
```

Esto levanta:
- **Frontend**: http://localhost:3000 (Next.js)
- **API**: http://localhost:3001 (Fastify)

---

## 📁 Estructura del Proyecto

```
vector-pokeapi/
├── apps/
│   ├── api/              # Backend con Fastify
│   │   ├── src/
│   │   │   ├── domain/           # Lógica de negocio
│   │   │   ├── infrastructure/   # Repositorios, servicios
│   │   │   └── presentation/     # Controllers, routes
│   │   └── tsconfig.json
│   │
│   └── web/              # Frontend con Next.js
│       ├── src/
│       │   ├── app/           # App Router pages
│       │   ├── components/    # React components
│       │   ├── composables/   # Custom hooks
│       │   ├── services/      # API client
│       │   └── lib/           # Utilidades
│       └── tsconfig.json
│
├── packages/
│   ├── database/         # Prisma + Modelos
│   ├── shared-types/     # Types compartidos
│   ├── config/           # ESLint, TypeScript config
│   ├── ui/               # Componentes reutilizables
│   └── elements-effects/ # Estilos de tipos Pokémon
│
├── scripts/              # (Opcional, no ejecutar)
│   └── ai-sync/          # Generación de embeddings (requiere GPU)
│
└── docker-compose.yml    # PostgreSQL con pgvector
```

---

## 🎯 Funcionalidades

### ✅ Listado de Pokémon
- Ordenados por ID por defecto
- Filtros por tipo y generación
- Búsqueda en tiempo real por nombre

### ✅ Busador Avanzado
- Búsqueda de texto: nombre, descripción
- Búsqueda semántica: conceptos relacionados
- Templates predefinidos para búsquedas comunes

### ✅ Página de Detalle
- Información completa del Pokémon
- Cadena de evoluciones interactiva
- Stats visualizados
- Pokémon conceptualmente similares (vía embeddings)

### ✅ Persistencia de Estado
- Filtros y búsqueda se mantienen al navegar
- Estados se restauran en la misma sesión

---

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
pnpm dev              # Inicia API + Web

# Build
pnpm build           # Build producción
pnpm start           # Inicia servidor producción

# Base de datos
pnpm db:migrate      # Ejecuta migraciones
pnpm db:seed         # Rellena BD con datos
pnpm db:studio       # Abre Prisma Studio (editor visual)

# Calidad de código
pnpm lint            # Ejecuta ESLint
pnpm typecheck       # Verifica tipos TypeScript
```

---

## 🗄️ Base de Datos

### Estructura

- **pokemons**: Datos principales de Pokémon + embeddings vectoriales
- **evolution_edges**: Relaciones de evolución (nivel, objeto, intercambio)
- **search_templates**: Búsquedas pre-vectorizadas para UX mejorada
- **template_words**: Palabras clave de templates

### Extensiones

- **pgvector**: Búsqueda vectorial (embeddings)
- **unaccent**: Búsquedas sin tildes

---

## 🔍 API Endpoints

### Pokémon

```
GET /api/pokemon/:id               # Detalle de Pokémon
GET /api/pokemon/:id/similar       # Pokémon conceptualmente similares
```

### Búsqueda

```
GET /api/search?q=pikachu&type=electric&gen=1&limit=24
  - q: texto de búsqueda (opcional)
  - type: tipo Pokémon (opcional)
  - gen: generación (opcional)
  - templateId: ID de template (opcional)
  - useKeywords: usar palabras clave (default: true)
  - limit: resultados máximos (default: 12)
```

### Templates

```
GET /api/templates                 # Todas las búsquedas sugeridas
```

---

## 💡 Notas Técnicas

### Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4, Framer Motion
- **Backend**: Fastify, Zod (validación)
- **BD**: PostgreSQL 16 + pgvector, Prisma ORM
- **i18n**: next-intl (English/Spanish)

### Embeddings

Los Pokémon incluyen embeddings vectoriales (3,072 dimensiones, modelo Qwen3-Embedding-4B).

⚠️ **Nota**: Para regenerar embeddings necesitas GPU Nvidia. Ver `scripts/ai-sync/README.md`.

### Arquitectura Backend

- **Domain**: Interfaces de servicios y repositorios (agnóstico de frameworks)
- **Infrastructure**: Implementaciones con Prisma
- **Presentation**: Controllers y routes

Esta separación permite testabilidad y flexibilidad.

---

## 🐛 Troubleshooting

### Error: "PostgreSQL connection refused"

```bash
# Verifica que Docker está corriendo
docker ps

# Si no aparece PostgreSQL, reinicia los contenedores
docker compose down
docker compose up -d
```

### Error: "Migration failed"

```bash
# Limpia y recrea la BD
docker compose down -v  # ⚠️ Borra datos
docker compose up -d
pnpm db:migrate
pnpm db:seed
```

### Puerto 3000 o 3001 en uso

Modifica el puerto en:
- **Web**: `apps/web/package.json` script `dev`
- **API**: `apps/api/src/server.ts` línea del `listen()`

---

## 📚 Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [Fastify Docs](https://www.fastify.io/)
- [Prisma Docs](https://www.prisma.io/docs/)
- [PokéAPI](https://pokeapi.co/)

---

## 📝 Notas para el Desarrollo

### Agregar una nueva página

```tsx
// apps/web/src/app/nueva/page.tsx
export default function NuevaPage() {
  return <div>Contenido</div>;
}
```

### Agregar un nuevo endpoint API

```ts
// apps/api/src/presentation/routes/nueva.routes.ts
export async function nuevaRoutes(fastify: FastifyInstance) {
  fastify.get("/api/nueva", async (request, reply) => {
    return { data: "respuesta" };
  });
}

// Registrar en apps/api/src/presentation/routes/index.ts
```

### Mantener tipos sincronizados

Todos los tipos están en `packages/shared-types/src/`. Úsalos en:
- API: importa de `@vector-pokeapi/shared-types`
- Web: importa de `@vector-pokeapi/shared-types`

---

## ✨ Características Adicionales

- ✅ Interfaz oscura moderna con Tailwind
- ✅ Animaciones fluidas con Framer Motion
- ✅ Responsive design (mobile-first)
- ✅ Internacionalización (EN/ES)
- ✅ Tipado strict en todo el stack
- ✅ Validación con Zod
- ✅ Rate limiting y CORS en API

---

## 📞 Soporte

Para problemas o preguntas, revisa:
1. Los logs de Docker: `docker logs vector-pokeapi-db-1`
2. Console del navegador (F12)
3. Terminal de desarrollo

---

**Última actualización**: 8 de junio de 2026
**Versión**: 1.0.0
