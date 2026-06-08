import { EvolutionEdge } from "@vector-pokeapi/shared-types";

export interface IEvolutionEdgeRepository {
    findEdgesFrom(pokemonId: number): Promise<EvolutionEdge[]>;
    findEdgesTo(pokemonId: number): Promise<EvolutionEdge[]>;
}