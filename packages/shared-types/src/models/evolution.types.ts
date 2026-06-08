import { PokemonDetail } from "./pokemon.types.ts";

export interface EvolutionEdge {
    id: number;
    fromPokemonId: number;
    toPokemonId: number;
    trigger: string;
    minLevel?: number | null;
    itemName?: string | null;
    from?: PokemonDetail;
    to?: PokemonDetail;
}

