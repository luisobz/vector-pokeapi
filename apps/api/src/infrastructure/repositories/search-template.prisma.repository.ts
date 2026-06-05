import { PrismaClient } from "@vector-pokeapi/database";
import { ISearchTemplateRepository } from "../../domain/repositories/search-template.repository.interface.js";
import { SearchTemplate } from "@vector-pokeapi/shared-types";

export class TemplateRepository implements ISearchTemplateRepository {
  constructor(private prisma: PrismaClient) { }

  async getAll(): Promise<SearchTemplate[]> {
    const templates = await this.prisma.searchTemplate.findMany({
      orderBy: { id: "asc" },
    });

    return templates.map((t) => ({
      id: t.id,
      queryText: t.queryText,
      category: t.category,
    }));
  }

  async getById(id: number): Promise<SearchTemplate | null> {
    const template = await this.prisma.searchTemplate.findUnique({
      where: { id },
    });

    if (!template) return null;

    return {
      id: template.id,
      queryText: template.queryText,
      category: template.category,
    };
  }
}
