import type { PokemonDetail } from "./pokemon.types.ts";

export interface SearchTemplate {
    id: number;
    queryText: string;
    category?: string | null;
    embedding?: number[] | null;
}

export interface PokemonSimilarResult extends PokemonDetail {
    similarity_score: number;
}

export interface SimilarGroupedByGen {
    generation: number;
    pokemons: PokemonSimilarResult[];
}