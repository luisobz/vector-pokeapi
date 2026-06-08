import { Pokemon } from "@vector-pokeapi/shared-types";

export interface ISearchService {
  search(query: string, options?: { type?: string; gen?: number; limit?: number; templateId?: number; useKeywords?: boolean }): Promise<Pokemon[]>;
}
