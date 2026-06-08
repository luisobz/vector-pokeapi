import { PrismaClient, Prisma } from "@vector-pokeapi/database";
import { EvolutionEdge, PokemonDetail, PokemonStats, SimilarGroupedByGen } from "@vector-pokeapi/shared-types";
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

  private async collectAncestors(
    pokemonId: number,
    visited = new Set<number>()
  ): Promise<EvolutionEdge[]> {
    if (visited.has(pokemonId)) return [];
    visited.add(pokemonId);

    const incoming = await this.evolutionEdgeRepository.findEdgesTo(pokemonId);
    const ordered = incoming.sort((a, b) => a.fromPokemonId - b.fromPokemonId);

    const result: EvolutionEdge[] = [];
    for (const edge of ordered) {
      result.push(...(await this.collectAncestors(edge.fromPokemonId, visited)));
      result.push(edge);
    }

    return result;
  }

  private async collectDescendants(
    pokemonId: number,
    visited = new Set<number>()
  ): Promise<EvolutionEdge[]> {
    if (visited.has(pokemonId)) return [];
    visited.add(pokemonId);

    const outgoing = await this.evolutionEdgeRepository.findEdgesFrom(pokemonId);
    const ordered = outgoing.sort((a, b) => a.toPokemonId - b.toPokemonId);

    const result: EvolutionEdge[] = [];
    for (const edge of ordered) {
      result.push(edge);
      result.push(...(await this.collectDescendants(edge.toPokemonId, visited)));
    }

    return result;
  }

  private formatStats(stats: Prisma.JsonValue): PokemonStats {
    const defaults = { hp: 0, attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0 };
    if (!stats || typeof stats !== 'object') return defaults;
    const { hp, attack, defense, sp_atk, sp_def, speed } = stats as Record<string, unknown>;
    return {
      hp: Number(hp) || 0,
      attack: Number(attack) || 0,
      defense: Number(defense) || 0,
      spAtk: Number(sp_atk) || 0,
      spDef: Number(sp_def) || 0,
      speed: Number(speed) || 0,
    };
  }

  async getById(id: number): Promise<PokemonDetail | null> {
    const rawPokemon = await this.prisma.pokemon.findUnique({
      where: { id },
    });

    if (!rawPokemon) return null;

    const [evolvesFrom, evolvesTo] = await Promise.all([
      this.collectAncestors(id),
      this.collectDescendants(id),
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
  ): Promise<PokemonDetail[]> {
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
  ): Promise<PokemonDetail[]> {
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
  ): Promise<PokemonDetail[]> {
    const limit = options?.limit ?? 12;
    const type = options?.type ?? null;
    const gen = options?.gen ?? null;

    // SELECT base
    let sql = `
    SELECT id, name, name_es, description, types, generation, stats, sprite, height, weight
  `;

    const sqlParams: any[] = [];

    if (query && query.trim() !== '') {
      sql += `, (
      CASE WHEN name ILIKE '%' || $1 || '%' THEN 99 ELSE 0 END +
      CASE WHEN name_es ILIKE '%' || $1 || '%' THEN 98 ELSE 0 END +
      COALESCE(
        (LENGTH(LOWER(description)) - LENGTH(REPLACE(LOWER(description), LOWER($1::text), '')))
        / NULLIF(LENGTH(LOWER($1::text)), 0),
        0
      )
    ) as score`;
    }

    sql += ` FROM pokemons WHERE 1=1`;

    if (type) {
      sqlParams.push(type);
      sql += ` AND $${sqlParams.length} = ANY(types)`;
    }
    if (gen) {
      sqlParams.push(Number(gen));
      sql += ` AND generation = $${sqlParams.length}`;
    }

    if (query && query.trim() !== '') {
      const trimmed = query.trim();
      sqlParams.push(trimmed);
      const qIdx = sqlParams.length;

      sql += ` AND (
      name ILIKE '%' || $${qIdx} || '%' OR 
      name_es ILIKE '%' || $${qIdx} || '%' OR 
      description ILIKE '%' || $${qIdx} || '%'
    )`;

      sql = sql.replace(/\$1::text/g, `$${qIdx}::text`);
      sql = sql.replace(/\$1/g, `$${qIdx}`);

      sql += ` ORDER BY score DESC, id ASC`;
    } else {
      sql += ` ORDER BY id ASC`;
    }

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

  private mapResults(rawResults: any[]): PokemonDetail[] {
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
      });
  }
}