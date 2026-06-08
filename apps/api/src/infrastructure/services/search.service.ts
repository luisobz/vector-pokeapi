import { ISearchService, SearchOptions } from "../../domain/services/search.service.interface";
import { IPokemonRepository } from "../../domain/repositories/pokemon.repository.interface";
import { ISearchTemplateRepository } from "../../domain/repositories/search-template.repository.interface";
import { ITemplateWordRepository } from "../../domain/repositories/template-word.repository.interface";
import { Pokemon } from "@vector-pokeapi/shared-types";


export class SearchService implements ISearchService {
  private readonly TEMPLATE_DISTANCE_THRESHOLD = 0.45;
  private readonly KEYWORD_MIN_SIMILARITY = 0.35;

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
            minSimilarityThreshold: this.KEYWORD_MIN_SIMILARITY,
          });
        }
      } else if (template?.embedding) {
        return this.pokemonRepository.searchByEmbedding(template.embedding, {
          ...trimmedOptions,
          distanceThreshold: this.TEMPLATE_DISTANCE_THRESHOLD,
        });
      }
    }

    return this.pokemonRepository.searchByText(query ?? "", trimmedOptions);
  }
}