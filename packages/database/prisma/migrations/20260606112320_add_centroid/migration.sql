-- CreateTable
CREATE TABLE "attribute_centroids" (
    "id" SERIAL NOT NULL,
    "attributeName" TEXT NOT NULL,
    "attributeValue" TEXT NOT NULL,
    "embedding" vector(1536) NOT NULL,

    CONSTRAINT "attribute_centroids_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "attribute_centroids_attributeName_attributeValue_key" ON "attribute_centroids"("attributeName", "attributeValue");
-- CreateIndex
CREATE INDEX attribute_centroids_embedding_idx ON attribute_centroids USING hnsw (embedding vector_cosine_ops);