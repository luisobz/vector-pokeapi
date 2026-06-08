import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "@fastify/type-provider-zod";
import { searchQuerystringSchema } from "../schemas/search.schema.js";
import { SearchController } from "../controllers/search.controller.js";

export async function searchRoutes(fastify: FastifyInstance, opts: { controller: SearchController }) {
  const server = fastify.withTypeProvider<ZodTypeProvider>();
  const ctrl = opts.controller;

  server.get(
    "/api/search",
    { schema: { querystring: searchQuerystringSchema } },
    ctrl.search.bind(ctrl)
  );
}