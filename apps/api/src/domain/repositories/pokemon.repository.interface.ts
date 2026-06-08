import { Pokemon, PokemonDetail, SimilarGroupedByGen } from "@vector-pokeapi/shared-types";

export type SearchBySimilarityOptions = {
  type?: string;
  gen?: number;
  limit?: number;
  distanceThreshold?: number;
};

export type SearchTextOptions = {
  type?: string;
  gen?: number;
  limit?: number;
};

export interface IPokemonRepository {
  getById(id: number): Promise<PokemonDetail | null>;
  searchBySimilarity(embedding: number[], options?: SearchBySimilarityOptions): Promise<Pokemon[]>;
  searchByText(query: string, options?: SearchTextOptions): Promise<Pokemon[]>;
  getConceptuallySimilar(id: number): Promise<SimilarGroupedByGen[]>;
  searchByTemplate(templateId: number, options?: SearchBySimilarityOptions & { minSimilarityThreshold: number }): Promise<Pokemon[]>;
}
