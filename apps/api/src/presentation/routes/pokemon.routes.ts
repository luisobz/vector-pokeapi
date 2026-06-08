import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "@fastify/type-provider-zod";
import { getPokemonSchema } from "@vector-pokeapi/shared-types";
import { PokemonController } from "../controllers/pokemon.controller.js";

export async function pokemonRoutes(fastify: FastifyInstance, opts: { controller: PokemonController }) {
  const server = fastify.withTypeProvider<ZodTypeProvider>();
  const ctrl = opts.controller;

  server.get(
    "/api/pokemon/:id",
    { schema: getPokemonSchema },
    ctrl.getById.bind(ctrl)
  );

  server.get(
    "/api/pokemon/:id/similar",
    { schema: getPokemonSchema },
    ctrl.getSimilar.bind(ctrl)
  );
}