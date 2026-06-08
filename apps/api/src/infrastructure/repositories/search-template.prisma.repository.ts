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
    const results = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT id, query_text, category, embedding::text FROM search_templates WHERE id = $1`,
      id
    );
    if (!results?.length) return null;
    const row = results[0];
    let embedding: number[] | null = null;
    if (row.embedding) {
      try {
        embedding = row.embedding
          .replace(/^\[/, "")
          .replace(/\]$/, "")
          .split(",")
          .map(Number);
      } catch (err) {
        console.error(`Failed to parse embedding for template id=${id}`, err);
      }
    }
    return {
      id: row.id,
      queryText: row.query_text,
      category: row.category,
      embedding,
    };
  }
}