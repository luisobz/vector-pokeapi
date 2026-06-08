import { FastifyRequest, FastifyReply } from "fastify";
import { IPokemonService } from "../../domain/services/pokemon.service.interface";
import { GetPokemonParams } from "../schemas/pokemon.schema";

export class PokemonController {
    constructor(private pokemonService: IPokemonService) { }

    async getById(request: FastifyRequest<{ Params: GetPokemonParams }>, reply: FastifyReply) {
        const { id } = request.params;
        const pokemon = await this.pokemonService.getById(id);
        if (!pokemon) {
            return reply.status(404).send({ error: "Pokemon not found" });
        }
        return pokemon;
    }

    async getSimilar(request: FastifyRequest<{ Params: GetPokemonParams }>) {
        const { id } = request.params;
        return this.pokemonService.getConceptuallySimilar(id);
    }
}