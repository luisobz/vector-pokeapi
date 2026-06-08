-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- CreateTable
CREATE TABLE "pokemons" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "name_es" TEXT,
    "description" TEXT,
    "description_es" TEXT,
    "types" TEXT[],
    "generation" INTEGER NOT NULL,
    "stats" JSONB NOT NULL,
    "sprite" TEXT,
    "height" INTEGER,
    "order" INTEGER,
    "weight" INTEGER,
    "embedding" halfvec(3072),

    CONSTRAINT "pokemons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evolution_edges" (
    "id" SERIAL NOT NULL,
    "from_pokemon_id" INTEGER NOT NULL,
    "to_pokemon_id" INTEGER NOT NULL,
    "trigger" TEXT NOT NULL,
    "min_level" INTEGER,
    "item_name" TEXT,

    CONSTRAINT "evolution_edges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_templates" (
    "id" SERIAL NOT NULL,
    "query_text" TEXT NOT NULL,
    "category" TEXT,
    "embedding" halfvec(3072),

    CONSTRAINT "search_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_words" (
    "id" SERIAL NOT NULL,
    "template_id" INTEGER NOT NULL,
    "word" TEXT NOT NULL,
    "embedding" halfvec(3072) NOT NULL,

    CONSTRAINT "template_words_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "search_templates_query_text_key" ON "search_templates"("query_text");

-- CreateIndex
CREATE UNIQUE INDEX "template_words_template_id_word_key" ON "template_words"("template_id", "word");

-- AddForeignKey
ALTER TABLE "evolution_edges" ADD CONSTRAINT "evolution_edges_from_pokemon_id_fkey" FOREIGN KEY ("from_pokemon_id") REFERENCES "pokemons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evolution_edges" ADD CONSTRAINT "evolution_edges_to_pokemon_id_fkey" FOREIGN KEY ("to_pokemon_id") REFERENCES "pokemons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_words" ADD CONSTRAINT "template_words_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "search_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Unsupported index
CREATE INDEX pokemon_embedding_idx ON pokemons USING hnsw (embedding halfvec_cosine_ops);
CREATE INDEX templates_embedding_idx ON search_templates USING hnsw (embedding halfvec_cosine_ops);
CREATE INDEX template_words_embedding_idx ON template_words USING hnsw (embedding halfvec_cosine_ops);