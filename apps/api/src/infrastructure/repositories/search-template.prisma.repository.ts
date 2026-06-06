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
    // Must use raw SQL because Prisma's Unsupported("vector(1536)") type
    // silently excludes the embedding field from standard queries.
    const results = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT id, query_text, category, embedding::text FROM search_templates WHERE id = $1`,
      id
    );

    if (!results || results.length === 0) {
      console.log(`[TemplateRepository] Template id=${id} not found`);
      return null;
    }

    const row = results[0];

    // Parse the vector string "[0.1,0.2,...]" into number[]
    let embedding: number[] | null = null;
    if (row.embedding) {
      try {
        embedding = row.embedding
          .replace(/^\[/, "")
          .replace(/\]$/, "")
          .split(",")
          .map(Number);
        console.log(`[TemplateRepository] Template id=${id} loaded with embedding of ${embedding.length} dimensions`);
      } catch (err) {
        console.error(`[TemplateRepository] Failed to parse embedding for template id=${id}:`, err);
      }
    } else {
      console.warn(`[TemplateRepository] Template id=${id} has NO embedding stored`);
    }

    return {
      id: row.id,
      queryText: row.query_text,
      category: row.category,
      embedding,
    };
  }
}
