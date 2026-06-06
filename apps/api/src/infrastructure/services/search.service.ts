import { ISearchService } from "../../domain/services/search.service.interface";
import { IPokemonRepository } from "../../domain/repositories/pokemon.repository.interface";
import { ISearchTemplateRepository } from "../../domain/repositories/search-template.repository.interface";
import { EmbedClientService } from "./embed-client.service";
import { Pokemon } from "@vector-pokeapi/shared-types";

export class SearchService implements ISearchService {
  constructor(
    private pokemonRepository: IPokemonRepository,
    private templateRepository: ISearchTemplateRepository,
    private embedClient: EmbedClientService
  ) { }

  async search(
    query: string,
    options?: { type?: string; gen?: number; limit?: number; templateId?: number }
  ): Promise<Pokemon[]> {
    console.log(`[SearchService] search() called — query="${query}", templateId=${options?.templateId}, type=${options?.type}, gen=${options?.gen}`);

    const TEMPLATE_DISTANCE_THRESHOLD = 0.42; // cosine distance 0–2; lower = more similar

    if (options?.templateId) {
      const template = await this.templateRepository.getById(options.templateId);
      console.log(`[SearchService] Template lookup result: id=${template?.id}, hasEmbedding=${!!template?.embedding}, embeddingLength=${template?.embedding?.length}`);
      if (template?.embedding) {
        console.log(`[SearchService] → Using template embedding for similarity search (threshold=${TEMPLATE_DISTANCE_THRESHOLD})`);
        return this.pokemonRepository.searchBySimilarity(template.embedding, {
          ...options,
          distanceThreshold: TEMPLATE_DISTANCE_THRESHOLD,
        });
      }
      console.warn(`[SearchService] → Template found but NO embedding, falling through to text search`);
    }

    if (query) {
      const embedding = await this.embedClient.getEmbedding(query);
      if (embedding) {
        console.log(`[SearchService] → Using live embedding for query "${query}"`);
        return this.pokemonRepository.searchBySimilarity(embedding, options);
      }

      console.log(`[SearchService] → Falling back to text search for "${query}"`);
      return this.pokemonRepository.searchByText(query, options);
    }

    console.log(`[SearchService] → No query, returning default text search (all results)`);
    return this.pokemonRepository.searchByText("", options);
  }
}
