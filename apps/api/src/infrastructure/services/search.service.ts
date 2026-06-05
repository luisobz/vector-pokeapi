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
    if (options?.templateId) {
      const template = await this.templateRepository.getById(options.templateId);
      if (template?.embedding) {
        return this.pokemonRepository.searchBySimilarity(template.embedding, options);
      }
    }

    if (query) {
      const embedding = await this.embedClient.getEmbedding(query);
      if (embedding) {
        return this.pokemonRepository.searchBySimilarity(embedding, options);
      }

      return this.pokemonRepository.searchByText(query, options);
    }

    return this.pokemonRepository.searchByText("", options);
  }
}
