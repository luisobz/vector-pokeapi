import { ISearchService, SearchOptions } from "../../domain/services/search.service.interface";
import { IPokemonRepository } from "../../domain/repositories/pokemon.repository.interface";
import { ISearchTemplateRepository } from "../../domain/repositories/search-template.repository.interface";
import { ITemplateWordRepository } from "../../domain/repositories/template-word.repository.interface";
import { Pokemon } from "@vector-pokeapi/shared-types";
import { Environments } from "@vector-pokeapi/config/env";


export class SearchService implements ISearchService {

  constructor(
    private pokemonRepository: IPokemonRepository,
    private templateRepository: ISearchTemplateRepository,
    private templateWordRepository: ITemplateWordRepository,
  ) { }

  async search(
    query: string,
    options?: SearchOptions
  ): Promise<Pokemon[]> {
    const { templateId, useKeywords, ...trimmedOptions } = options ?? {};

    if (templateId) {
      const template = await this.templateRepository.getById(templateId);
      if (useKeywords) {
        const keywords = await this.templateWordRepository.getKeywordsByTemplateId(templateId);
        if (keywords.length > 0) {
          const embeddings = keywords.map((k) => k.embedding);
          return this.pokemonRepository.searchByMultipleEmbeddings(embeddings, {
            ...trimmedOptions,
            minSimilarityThreshold: Environments.KEYWORD_MIN_SIMILARITY,
            positiveThreshold: Environments.KEYWORD_POSITIVE_THRESHOLD,
            negativeWeight: Environments.KEYWORD_NEGATIVE_WEIGHT,
          });
        }
      } else if (template?.embedding) {
        return this.pokemonRepository.searchByEmbedding(template.embedding, {
          ...trimmedOptions,
          distanceThreshold: Environments.TEMPLATE_DISTANCE_THRESHOLD,
        });
      }
    }

    return this.pokemonRepository.searchByText(query ?? "", trimmedOptions);
  }
}