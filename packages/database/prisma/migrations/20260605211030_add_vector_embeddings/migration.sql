-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- CreateTable
CREATE TABLE "pokemons" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "nameEs" TEXT,
    "description" TEXT,
    "types" TEXT[],
    "generation" INTEGER NOT NULL,
    "stats" JSONB NOT NULL,
    "sprite" TEXT,
    "embedding" vector(1536),

    CONSTRAINT "pokemons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evolution_edges" (
    "id" SERIAL NOT NULL,
    "fromPokemonId" INTEGER NOT NULL,
    "toPokemonId" INTEGER NOT NULL,
    "trigger" TEXT NOT NULL,
    "minLevel" INTEGER,
    "itemName" TEXT,

    CONSTRAINT "evolution_edges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_templates" (
    "id" SERIAL NOT NULL,
    "query_text" TEXT NOT NULL,
    "category" TEXT,
    "embedding" vector(1536),

    CONSTRAINT "search_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "search_templates_query_text_key" ON "search_templates"("query_text");

-- CreateIndex
CREATE INDEX pokemon_embedding_idx ON pokemons USING hnsw (embedding vector_cosine_ops);

-- CreateIndex
CREATE INDEX templates_embedding_idx ON search_templates USING hnsw (embedding vector_cosine_ops);

-- AddForeignKey
ALTER TABLE "evolution_edges" ADD CONSTRAINT "evolution_edges_fromPokemonId_fkey" FOREIGN KEY ("fromPokemonId") REFERENCES "pokemons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evolution_edges" ADD CONSTRAINT "evolution_edges_toPokemonId_fkey" FOREIGN KEY ("toPokemonId") REFERENCES "pokemons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
