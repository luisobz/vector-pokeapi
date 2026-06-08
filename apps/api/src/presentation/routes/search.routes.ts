import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "@fastify/type-provider-zod";
import { getSearchSchema } from "@vector-pokeapi/shared-types";
import { SearchController } from "../controllers/search.controller.js";

export async function searchRoutes(fastify: FastifyInstance, opts: { controller: SearchController }) {
  const server = fastify.withTypeProvider<ZodTypeProvider>();
  const ctrl = opts.controller;

  server.get(
    "/api/search",
    { schema: getSearchSchema },
    ctrl.search.bind(ctrl)
  );
}