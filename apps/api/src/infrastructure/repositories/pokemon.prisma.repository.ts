import { PrismaClient } from "@vector-pokeapi/database";
import { IPokemonRepository } from "../../domain/repositories/pokemon.repository.interface.js";
import { Pokemon, PokemonDetail, PokemonSimilarResult, SimilarGroupedByGen } from "@vector-pokeapi/shared-types";

export class PokemonRepository implements IPokemonRepository {
  constructor(private prisma: PrismaClient) { }

  /**
   * Fetches a Pokemon by ID with its complete bidirectional evolution graph (predecessors and successors)
   */
  async getById(id: number): Promise<PokemonDetail | null> {
    const rawPokemon = await this.prisma.pokemon.findUnique({
      where: { id },
      include: {
        evolvesFrom: {
          include: {
            from: true,
          },
        },
        evolvesTo: {
          include: {
            to: true,
          },
        },
      },
    });

    if (!rawPokemon) return null;

    const stats = rawPokemon.stats as any;

    return {
      id: rawPokemon.id,
      name: rawPokemon.name,
      nameEs: rawPokemon.nameEs,
      description: rawPokemon.description,
      types: rawPokemon.types,
      generation: rawPokemon.generation,
      stats: {
        hp: stats?.hp || 0,
        attack: stats?.attack || 0,
        defense: stats?.defense || 0,
        spAtk: stats?.spAtk || 0,
        spDef: stats?.spDef || 0,
        speed: stats?.speed || 0,
      },
      sprite: rawPokemon.sprite,
      evolvesFrom: rawPokemon.evolvesFrom.map((edge) => ({
        id: edge.id,
        fromPokemonId: edge.fromPokemonId,
        toPokemonId: edge.toPokemonId,
        trigger: edge.trigger,
        minLevel: edge.minLevel,
        itemName: edge.itemName,
        from: {
          id: edge.from.id,
          name: edge.from.name,
          nameEs: edge.from.nameEs,
          description: edge.from.description,
          types: edge.from.types,
          generation: edge.from.generation,
          stats: edge.from.stats as any,
          sprite: edge.from.sprite,
        }
        ,
      })),
      evolvesTo: rawPokemon.evolvesTo.map((edge) => ({
        id: edge.id,
        fromPokemonId: edge.fromPokemonId,
        toPokemonId: edge.toPokemonId,
        trigger: edge.trigger,
        minLevel: edge.minLevel,
        itemName: edge.itemName,
        to: {
          id: edge.to.id,
          name: edge.to.name,
          nameEs: edge.to.nameEs,
          description: edge.to.description,
          types: edge.to.types,
          generation: edge.to.generation,
          stats: edge.to.stats as any,
          sprite: edge.to.sprite,
        },
      })),
    };
  }

  /**
   * Semantic search using a pre-computed embedding vector.
   * Uses pgvector cosine distance (<=>).
   */
  async searchBySimilarity(
    embedding: number[],
    options?: { type?: string; gen?: number; limit?: number; distanceThreshold?: number }
  ): Promise<Pokemon[]> {
    const limit = options?.limit || 12;
    const type = options?.type || null;
    const gen = options?.gen || null;
    const distanceThreshold = options?.distanceThreshold ?? null;

    const embeddingString = `[${embedding.join(",")}]`;
    const sqlParams: any[] = [];

    // $1 is always the embedding vector so we can reference it multiple times
    sqlParams.push(embeddingString);
    const embeddingParamIndex = sqlParams.length; // 1

    let query = `
      SELECT id, name, "nameEs", description, types, generation, stats, sprite, height, weight
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

    // Distance threshold: only include results closer than the threshold
    if (distanceThreshold !== null) {
      sqlParams.push(distanceThreshold);
      query += ` AND (embedding <=> $${embeddingParamIndex}::vector) <= $${sqlParams.length}`;
    }

    query += ` ORDER BY embedding <=> $${embeddingParamIndex}::vector ASC`;

    sqlParams.push(limit);
    query += ` LIMIT $${sqlParams.length}`;

    const rawResults = await this.prisma.$queryRawUnsafe<any[]>(query, ...sqlParams);

    return rawResults.map((r) => {
      const stats = typeof r.stats === "string" ? JSON.parse(r.stats) : r.stats;
      return {
        id: r.id,
        name: r.name,
        nameEs: r.nameEs,
        description: r.description,
        types: r.types,
        generation: r.generation,
        stats: {
          hp: stats?.hp || 0,
          attack: stats?.attack || 0,
          defense: stats?.defense || 0,
          spAtk: stats?.spAtk || 0,
          spDef: stats?.spDef || 0,
          speed: stats?.speed || 0,
        },
        sprite: r.sprite,
        height: r.height,
        weight: r.weight,
      };
    }).sort((a, b) => a.id - b.id);
  }

  /**
   * Text-based search using ILIKE pattern matching.
   */
  async searchByText(
    query: string,
    options?: { type?: string; gen?: number; limit?: number }
  ): Promise<Pokemon[]> {
    const limit = options?.limit || 12;
    const type = options?.type || null;
    const gen = options?.gen || null;

    let sql = `
      SELECT id, name, "nameEs", description, types, generation, stats, sprite, height, weight
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
      sql += ` AND (name ILIKE $${sqlParams.length} OR "nameEs" ILIKE $${sqlParams.length} OR description ILIKE $${sqlParams.length})`;
      sql += ` ORDER BY id ASC`;
    } else {
      sql += ` ORDER BY id ASC`;
    }

    sqlParams.push(limit);
    sql += ` LIMIT $${sqlParams.length}`;

    const rawResults = await this.prisma.$queryRawUnsafe<any[]>(sql, ...sqlParams);

    return rawResults.map((r) => {
      const stats = typeof r.stats === "string" ? JSON.parse(r.stats) : r.stats;
      return {
        id: r.id,
        name: r.name,
        nameEs: r.nameEs,
        description: r.description,
        types: r.types,
        generation: r.generation,
        stats: {
          hp: stats?.hp || 0,
          attack: stats?.attack || 0,
          defense: stats?.defense || 0,
          spAtk: stats?.spAtk || 0,
          spDef: stats?.spDef || 0,
          speed: stats?.speed || 0,
        },
        sprite: r.sprite,
        height: r.height,
        weight: r.weight,
      };
    });
  }

  /**
   * Fetches conceptually similar Pokemons to the target ID using Cosine Similarity (vector pgvector matching),
   * grouped by generation.
   */
  async getConceptuallySimilar(id: number, limit: number = 24): Promise<SimilarGroupedByGen[]> {
    const query = `
      SELECT id, name, "nameEs", description, types, generation, stats, sprite,
             1 - (embedding <=> (SELECT embedding FROM pokemons WHERE id = $1)) AS similarity_score
      FROM pokemons
      WHERE id != $1 AND embedding IS NOT NULL
      ORDER BY embedding <=> (SELECT embedding FROM pokemons WHERE id = $1) ASC
      LIMIT $2;
    `;

    const rawResults = await this.prisma.$queryRawUnsafe<any[]>(query, Number(id), limit);

    const similarResults: PokemonSimilarResult[] = rawResults.map((r) => {
      const stats = typeof r.stats === "string" ? JSON.parse(r.stats) : r.stats;
      return {
        id: r.id,
        name: r.name,
        nameEs: r.nameEs,
        description: r.description,
        types: r.types,
        generation: r.generation,
        stats: {
          hp: stats?.hp || 0,
          attack: stats?.attack || 0,
          defense: stats?.defense || 0,
          spAtk: stats?.spAtk || 0,
          spDef: stats?.spDef || 0,
          speed: stats?.speed || 0,
        },
        sprite: r.sprite,
        similarity_score: Number(r.similarity_score || 0),
      };
    });

    // Group by generation
    const grouped = new Map<number, PokemonSimilarResult[]>();
    for (const pokemon of similarResults) {
      const gen = pokemon.generation;
      if (!grouped.has(gen)) {
        grouped.set(gen, []);
      }
      grouped.get(gen)!.push(pokemon);
    }

    return Array.from(grouped.entries())
      .map(([generation, pokemons]) => ({ generation, pokemons }))
      .sort((a, b) => a.generation - b.generation);
  }
}
