import { SimilarGroupedByGen, PokemonDetail } from "@vector-pokeapi/shared-types";

export type SearchByEmbeddingOptions = {
  type?: string;
  gen?: number;
  limit?: number;
  distanceThreshold?: number;
};

export type SearchByMultipleEmbeddingsOptions = {
  type?: string;
  gen?: number;
  limit?: number;
  minSimilarityThreshold?: number;
  positiveThreshold?: number;
  negativeWeight?: number;
};

export interface IPokemonRepository {
  getById(id: number): Promise<PokemonDetail | null>;
  searchByEmbedding(embedding: number[], options?: SearchByEmbeddingOptions): Promise<PokemonDetail[]>;
  searchByMultipleEmbeddings(embeddings: number[][], options?: SearchByMultipleEmbeddingsOptions): Promise<PokemonDetail[]>;
  searchByText(query: string, options?: { type?: string; gen?: number; limit?: number }): Promise<PokemonDetail[]>;
  getConceptuallySimilar(id: number): Promise<SimilarGroupedByGen[]>;
}