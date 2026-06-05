import { Pokemon, PokemonDetail, PokemonSimilarResult, SimilarGroupedByGen } from "@vector-pokeapi/shared-types";

export interface IPokemonRepository {
  getById(id: number): Promise<PokemonDetail | null>;
  searchBySimilarity(embedding: number[], options?: { type?: string; gen?: number; limit?: number }): Promise<Pokemon[]>;
  searchByText(query: string, options?: { type?: string; gen?: number; limit?: number }): Promise<Pokemon[]>;
  getConceptuallySimilar(id: number): Promise<SimilarGroupedByGen[]>;
}
