import { IPokemonService } from "../../domain/services/pokemon.service.interface";
import { IPokemonRepository } from "../../domain/repositories/pokemon.repository.interface";
import { PokemonDetail, SimilarGroupedByGen } from "@vector-pokeapi/shared-types";

export class PokemonService implements IPokemonService {
    constructor(private pokemonRepository: IPokemonRepository) { }

    async getById(id: number): Promise<PokemonDetail | null> {
        return this.pokemonRepository.getById(id);
    }

    async getConceptuallySimilar(id: number): Promise<SimilarGroupedByGen[]> {
        return this.pokemonRepository.getConceptuallySimilar(id);
    }
}