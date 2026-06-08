import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "@fastify/type-provider-zod";
import { getPokemonParamsSchema } from "../schemas/pokemon.schema.js";
import { PokemonController } from "../controllers/pokemon.controller.js";

export async function pokemonRoutes(fastify: FastifyInstance, opts: { controller: PokemonController }) {
  const server = fastify.withTypeProvider<ZodTypeProvider>();
  const ctrl = opts.controller;

  server.get(
    "/api/pokemon/:id",
    { schema: { params: getPokemonParamsSchema } },
    ctrl.getById.bind(ctrl)
  );

  server.get(
    "/api/pokemon/:id/similar",
    { schema: { params: getPokemonParamsSchema } },
    ctrl.getSimilar.bind(ctrl)
  );
}