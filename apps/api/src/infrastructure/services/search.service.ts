import { ISearchService } from "../../domain/services/search.service.interface";
import { IPokemonRepository } from "../../domain/repositories/pokemon.repository.interface";
import { ISearchTemplateRepository } from "../../domain/repositories/search-template.repository.interface";
import { Pokemon } from "@vector-pokeapi/shared-types";

export class SearchService implements ISearchService {
  constructor(
    private pokemonRepository: IPokemonRepository,
    private templateRepository: ISearchTemplateRepository,
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
    }
    return this.pokemonRepository.searchByText(query ?? "", options);
  }
}
