import type { EvolutionEdge } from "./evolution.types.ts";

export interface PokemonStats {
    hp: number;
    attack: number;
    defense: number;
    spAtk: number;
    spDef: number;
    speed: number;
}

export interface Pokemon {
    id: number;
    name: string;
    nameEs?: string | null;
    description?: string | null;
    types: string[];
    generation: number;
    stats: PokemonStats;
    sprite?: string | null;
    embedding?: number[] | null;
    evolvesFrom?: EvolutionEdge[];
    evolvesTo?: EvolutionEdge[];
}

export interface PokemonDetail extends Pokemon {
    evolutionChain?: any;
}
