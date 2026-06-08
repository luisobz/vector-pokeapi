import { PrismaClient } from "@vector-pokeapi/database";
import { Pokemon, PokemonDetail, PokemonStats, SimilarGroupedByGen } from "@vector-pokeapi/shared-types";
import {
  IPokemonRepository,
  SearchByEmbeddingOptions,
  SearchByMultipleEmbeddingsOptions,
} from "../../domain/repositories/pokemon.repository.interface.js";
import { IEvolutionEdgeRepository } from "../../domain/repositories/evolution-edge.repository.interface.js";

export class PokemonRepository implements IPokemonRepository {
  constructor(
    private prisma: PrismaClient,
    private evolutionEdgeRepository: IEvolutionEdgeRepository
  ) { }

  private formatStats(stats: any): PokemonStats {
    return {
      hp: stats?.hp || 0,
      attack: stats?.attack || 0,
      defense: stats?.defense || 0,
      spAtk: stats?.sp_atk || 0,
      spDef: stats?.sp_def || 0,
      speed: stats?.speed || 0,
    }
  }

  async getById(id: number): Promise<PokemonDetail | null> {
    const rawPokemon = await this.prisma.pokemon.findUnique({
      where: { id },
    });

    if (!rawPokemon) return null;

    const [evolvesFrom, evolvesTo] = await Promise.all([
      this.evolutionEdgeRepository.findEdgesTo(id),
      this.evolutionEdgeRepository.findEdgesFrom(id),
    ]);

    return {
      id: rawPokemon.id,
      name: rawPokemon.name,
      nameEs: rawPokemon.nameEs,
      description: rawPokemon.description,
      types: rawPokemon.types,
      generation: rawPokemon.generation,
      stats: this.formatStats(rawPokemon.stats),
      sprite: rawPokemon.sprite,
      evolvesFrom,
      evolvesTo,
    };
  }

  async searchByEmbedding(
    embedding: number[],
    options?: SearchByEmbeddingOptions
  ): Promise<Pokemon[]> {
    const limit = options?.limit ?? 12;
    const type = options?.type ?? null;
    const gen = options?.gen ?? null;
    const distanceThreshold = options?.distanceThreshold ?? null;

    const embeddingString = `[${embedding.join(",")}]`;
    const sqlParams: any[] = [embeddingString];
    const embeddingParamIndex = 1;

    let query = `
      SELECT id, name, name_es, description, types, generation, stats, sprite, height, weight
      FROM pokemons
      WHERE embedding IS NOT NULL
    `;

    if (type) {
      sqlParams.push(type);
      query += ` AND $${sqlParams.length} = ANY(types)`;
    }
    if (gen) {
      sqlParams.push(Number(gen));
      query += ` AND generation = $${sqlParams.length}`;
    }
    if (distanceThreshold !== null) {
      sqlParams.push(distanceThreshold);
      query += ` AND (embedding <=> $${embeddingParamIndex}::vector) <= $${sqlParams.length}`;
    }

    query += ` ORDER BY embedding <=> $${embeddingParamIndex}::vector ASC`;
    sqlParams.push(limit);
    query += ` LIMIT $${sqlParams.length}`;

    const rawResults = await this.prisma.$queryRawUnsafe<any[]>(query, ...sqlParams);
    return this.mapResults(rawResults);
  }

  async searchByMultipleEmbeddings(
    embeddings: number[][],
    options?: SearchByMultipleEmbeddingsOptions
  ): Promise<Pokemon[]> {
    const limit = options?.limit ?? 12;
    const type = options?.type ?? null;
    const gen = options?.gen ?? null;
    const minSimilarity = options?.minSimilarityThreshold ?? 0.0;
    const positiveThreshold = options?.positiveThreshold ?? 0.0;
    const negativeWeight = options?.negativeWeight ?? 1.2;

    if (!embeddings.length) return [];


    const vectorLiterals = embeddings
      .map((emb) => `'[${emb.join(",")}]'::vector`)
      .join(", ");

    const sqlParams: any[] = [positiveThreshold, minSimilarity];
    let paramIndex = 3;

    let query = `
    WITH keyword_vectors AS (
      SELECT emb
      FROM unnest(ARRAY[${vectorLiterals}]::vector[]) AS kv(emb)
    ),
    base AS (
      SELECT
        p.id,
        p.name,
        p.name_es,
        p.description,
        p.types,
        p.generation,
        p.stats,
        p.sprite,
        p.height,
        p.weight,
        1 - (p.embedding <=> kv.emb) AS similarity
      FROM pokemons p
      CROSS JOIN keyword_vectors kv
      WHERE p.embedding IS NOT NULL
  `;

    if (type) {
      sqlParams.push(type);
      query += ` AND $${paramIndex} = ANY(p.types)`;
      paramIndex++;
    }

    if (gen) {
      sqlParams.push(Number(gen));
      query += ` AND p.generation = $${paramIndex}`;
      paramIndex++;
    }

    query += `
    ),
    scored AS (
      SELECT
        id,
        name,
        name_es,
        description,
        types,
        generation,
        stats,
        sprite,
        height,
        weight,
        COUNT(*) AS keyword_count,
        COUNT(*) FILTER (WHERE similarity >= $1) AS matched_keywords,
        MAX(similarity) AS best_similarity,
        AVG(similarity) AS avg_similarity,
        SUM(
          CASE
            WHEN similarity >= $1 THEN similarity
            ELSE -( $1 - similarity ) * ${negativeWeight}
          END
        ) / COUNT(*)::float AS score
      FROM base
      GROUP BY
        id, name, name_es, description, types, generation, stats, sprite, height, weight
      HAVING
        COUNT(*) FILTER (WHERE similarity >= $1) > 0
    )
    SELECT *
    FROM scored
    WHERE score >= $2
    ORDER BY
      matched_keywords DESC,
      score DESC,
      best_similarity DESC,
      avg_similarity DESC,
      id ASC
    LIMIT $${paramIndex};
  `;

    sqlParams.push(limit);

    const rawResults = await this.prisma.$queryRawUnsafe<any[]>(query, ...sqlParams);
    return this.mapResults(rawResults);
  }

  async searchByText(
    query: string,
    options?: { type?: string; gen?: number; limit?: number }
  ): Promise<Pokemon[]> {
    const limit = options?.limit ?? 12;
    const type = options?.type ?? null;
    const gen = options?.gen ?? null;

    let sql = `
      SELECT id, name, name_es, description, types, generation, stats, sprite, height, weight
      FROM pokemons
      WHERE 1=1
    `;
    const sqlParams: any[] = [];

    if (type) {
      sqlParams.push(type);
      sql += ` AND $${sqlParams.length} = ANY(types)`;
    }
    if (gen) {
      sqlParams.push(Number(gen));
      sql += ` AND generation = $${sqlParams.length}`;
    }
    if (query) {
      sqlParams.push(`%${query}%`);
      sql += ` AND (name ILIKE $${sqlParams.length} OR name_es ILIKE $${sqlParams.length} OR description ILIKE $${sqlParams.length})`;
    }
    sql += ` ORDER BY id ASC`;
    sqlParams.push(limit);
    sql += ` LIMIT $${sqlParams.length}`;

    const rawResults = await this.prisma.$queryRawUnsafe<any[]>(sql, ...sqlParams);
    return this.mapResults(rawResults);
  }

  async getConceptuallySimilar(id: number): Promise<SimilarGroupedByGen[]> {
    const query = `
      SELECT id, name, name_es, description, types, generation, stats, sprite,
             1 - (embedding <=> (SELECT embedding FROM pokemons WHERE id = $1)) AS similarity_score
      FROM pokemons
      WHERE id != $1 AND embedding IS NOT NULL
      ORDER BY embedding <=> (SELECT embedding FROM pokemons WHERE id = $1) ASC
      LIMIT 24;
    `;
    const rawResults = await this.prisma.$queryRawUnsafe<any[]>(query, Number(id));

    const similar = rawResults.map((r) => {
      const stats = typeof r.stats === "string" ? JSON.parse(r.stats) : r.stats;
      return {
        id: r.id,
        name: r.name,
        nameEs: r.nameEs,
        description: r.description,
        types: r.types,
        generation: r.generation,
        stats: this.formatStats(stats),
        sprite: r.sprite,
        similarity_score: Number(r.similarity_score || 0),
      };
    });

    const grouped = new Map<number, typeof similar>();
    for (const p of similar) {
      const gen = p.generation;
      if (!grouped.has(gen)) grouped.set(gen, []);
      grouped.get(gen)!.push(p);
    }
    return Array.from(grouped.entries())
      .map(([generation, pokemons]) => ({ generation, pokemons }))
      .sort((a, b) => a.generation - b.generation);
  }

  private mapResults(rawResults: any[]): Pokemon[] {
    return rawResults
      .map((r) => {
        const stats = typeof r.stats === "string" ? JSON.parse(r.stats) : r.stats;
        return {
          id: r.id,
          name: r.name,
          nameEs: r.nameEs,
          description: r.description,
          types: r.types,
          generation: r.generation,
          stats: this.formatStats(stats),
          sprite: r.sprite,
          height: r.height,
          weight: r.weight,
        };
      })
      .sort((a, b) => a.id - b.id);
  }
}