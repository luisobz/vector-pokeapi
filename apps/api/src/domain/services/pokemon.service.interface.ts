import { PokemonDetail, SimilarGroupedByGen } from "@vector-pokeapi/shared-types";

export interface IPokemonService {
    getById(id: number): Promise<PokemonDetail | null>;
    getConceptuallySimilar(id: number): Promise<SimilarGroupedByGen[]>;
}