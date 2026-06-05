import { SearchTemplate } from "@vector-pokeapi/shared-types";

export interface ISearchTemplateRepository {
  getAll(): Promise<SearchTemplate[]>;
  getById(id: number): Promise<SearchTemplate | null>;
}
