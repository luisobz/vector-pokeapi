import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "@fastify/type-provider-zod";
import { getPokemonParamsSchema } from "../schemas/pokemon.schema.js";
import { IPokemonRepository } from "../../domain/repositories/pokemon.repository.interface.js";

export async function pokemonRoutes(fastify: FastifyInstance, opts: { pokemonRepository: IPokemonRepository }) {
  const server = fastify.withTypeProvider<ZodTypeProvider>();

  server.get(
    "/api/pokemon/:id",
    {
      schema: { params: getPokemonParamsSchema },
    },
    async (request, reply) => {
      const { id } = request.params;
      const pokemon = await opts.pokemonRepository.getById(id);

      if (!pokemon) {
        return reply.status(404).send({ error: "Pokemon not found" });
      }

      return pokemon;
    }
  );
}
