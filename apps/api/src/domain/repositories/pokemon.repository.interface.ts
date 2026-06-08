import { Pokemon, PokemonDetail, SimilarGroupedByGen } from "@vector-pokeapi/shared-types";

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
  searchByEmbedding(embedding: number[], options?: SearchByEmbeddingOptions): Promise<Pokemon[]>;
  searchByMultipleEmbeddings(embeddings: number[][], options?: SearchByMultipleEmbeddingsOptions): Promise<Pokemon[]>;
  searchByText(query: string, options?: { type?: string; gen?: number; limit?: number }): Promise<Pokemon[]>;
  getConceptuallySimilar(id: number): Promise<SimilarGroupedByGen[]>;
}