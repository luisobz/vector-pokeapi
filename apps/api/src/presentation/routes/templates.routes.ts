import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "@fastify/type-provider-zod";
import { ISearchTemplateRepository } from "../../domain/repositories/search-template.repository.interface";

export async function templatesRoutes(fastify: FastifyInstance, opts: { templateRepository: ISearchTemplateRepository }) {
  const server = fastify.withTypeProvider<ZodTypeProvider>();

  server.get(
    "/api/templates",
    async (request, reply) => {
      const templates = await opts.templateRepository.getAll();
      return templates;
    }
  );
}
