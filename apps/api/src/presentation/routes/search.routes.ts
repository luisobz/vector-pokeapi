import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "@fastify/type-provider-zod";
import { searchQuerystringSchema } from "../schemas/search.schema.js";
import { ISearchService } from "../../domain/services/search.service.interface.js";

export async function searchRoutes(fastify: FastifyInstance, opts: { searchService: ISearchService }) {
  const server = fastify.withTypeProvider<ZodTypeProvider>();

  server.get(
    "/api/search",
    {
      schema: { querystring: searchQuerystringSchema },
    },
    async (request, reply) => {
      const { q, type, gen, limit, templateId } = request.query;
      const options: { type?: string; gen?: number; limit?: number; templateId?: number } = {};
      if (type !== undefined) options.type = type;
      if (gen !== undefined) options.gen = gen;
      if (limit !== undefined) options.limit = limit;
      if (templateId !== undefined) options.templateId = templateId;
      const pokemons = await opts.searchService.search(q || "", options);
      return pokemons;
    }
  );
}
