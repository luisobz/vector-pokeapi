import { Pokemon } from "@vector-pokeapi/shared-types";

export type SearchOptions = {
  type?: string;
  gen?: number;
  limit?: number;
  templateId?: number;
  useKeywords?: boolean;
};

export interface ISearchService {
  search(query: string, options: SearchOptions): Promise<Pokemon[]>;
}