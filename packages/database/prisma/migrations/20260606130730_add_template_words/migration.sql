-- DropTable
DROP TABLE "attribute_centroids";

-- CreateTable
CREATE TABLE "template_words" (
    "id" SERIAL NOT NULL,
    "templateId" INTEGER NOT NULL,
    "word" TEXT NOT NULL,
    "embedding" vector(1536) NOT NULL,

    CONSTRAINT "template_words_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "template_words_templateId_word_key" ON "template_words"("templateId", "word");

-- AddForeignKey
ALTER TABLE "template_words" ADD CONSTRAINT "template_words_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "search_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX template_words_embedding_idx ON template_words USING hnsw (embedding vector_cosine_ops);