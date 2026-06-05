import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import { serializerCompiler, validatorCompiler } from "@fastify/type-provider-zod";
import { prisma } from "@vector-pokeapi/database";
import { PokemonRepository } from "./infrastructure/repositories/pokemon.prisma.repository.js";
import { TemplateRepository } from "./infrastructure/repositories/search-template.prisma.repository.js";
import { EmbedClientService } from "./infrastructure/services/embed-client.service.js";
import { SearchService } from "./infrastructure/services/search.service.js";

import { pokemonRoutes } from "./presentation/routes/pokemon.routes.js";
import { searchRoutes } from "./presentation/routes/search.routes.js";
import { similarRoutes } from "./presentation/routes/similar.routes.js";
import { templatesRoutes } from "./presentation/routes/templates.routes.js";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  // Add schema validator and serializer
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(cors, {
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
  });

  // Dependency Injection setup
  const pokemonRepository = new PokemonRepository(prisma);
  const templateRepository = new TemplateRepository(prisma);
  const embedClient = new EmbedClientService();
  const searchService = new SearchService(pokemonRepository, templateRepository, embedClient);

  // Register routes
  app.register(pokemonRoutes, { pokemonRepository });
  app.register(searchRoutes, { searchService });
  app.register(similarRoutes, { pokemonRepository });
  app.register(templatesRoutes, { templateRepository });

  app.get("/health", async () => ({ status: "OK", timestamp: new Date().toISOString() }));

  return app;
}
