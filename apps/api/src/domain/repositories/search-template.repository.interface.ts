import { SearchTemplate } from "@vector-pokeapi/shared-types";

export interface ISearchTemplateRepository {
  getAll(): Promise<SearchTemplate[]>;
  getById(id: number): Promise<SearchTemplate | null>;
  getTemplateWithKeywords(id: number): Promise<{ template: SearchTemplate; keywords: { word: string; embedding: number[] }[] } | null>;
}
