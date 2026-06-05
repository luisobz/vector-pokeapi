import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "@fastify/type-provider-zod";
import { getPokemonParamsSchema } from "../schemas/pokemon.schema";
import { IPokemonRepository } from "../../domain/repositories/pokemon.repository.interface";

export async function similarRoutes(fastify: FastifyInstance, opts: { pokemonRepository: IPokemonRepository }) {
  const server = fastify.withTypeProvider<ZodTypeProvider>();

  server.get(
    "/api/pokemon/:id/similar",
    {
      schema: { params: getPokemonParamsSchema },
    },
    async (request, reply) => {
      const { id } = request.params;
      const similarGroups = await opts.pokemonRepository.getConceptuallySimilar(id);
      return similarGroups;
    }
  );
}
