import { FastifyInstance } from "fastify";
import { PrismaClient } from "@vector-pokeapi/database";
import { PokemonRepository } from "../../infrastructure/repositories/pokemon.prisma.repository.js";
import { TemplateRepository } from "../../infrastructure/repositories/search-template.prisma.repository.js";
import { TemplateWordRepository } from "../../infrastructure/repositories/template-word.prisma.repository.js";
import { EvolutionEdgeRepository } from "../../infrastructure/repositories/evolution-edge.prisma.repository.js";
import { SearchService } from "../../infrastructure/services/search.service.js";
import { PokemonService } from "../../infrastructure/services/pokemon.service.js";
import { PokemonController } from "../controllers/pokemon.controller.js";
import { SearchController } from "../controllers/search.controller.js";
import { TemplatesController } from "../controllers/templates.controller.js";
import { pokemonRoutes } from "./pokemon.routes.js";
import { searchRoutes } from "./search.routes.js";
import { templatesRoutes } from "./templates.routes.js";
import { healthRoutes } from "./health.routes.js";

export interface RegisterRoutesOptions {
    prisma: PrismaClient;
}

export async function registerRoutes(app: FastifyInstance, opts: RegisterRoutesOptions): Promise<void> {
    const { prisma } = opts;

    // Repositories
    const evolutionEdgeRepository = new EvolutionEdgeRepository(prisma);
    const pokemonRepository = new PokemonRepository(prisma, evolutionEdgeRepository);
    const templateRepository = new TemplateRepository(prisma);
    const templateWordRepository = new TemplateWordRepository(prisma);

    // Services
    const pokemonService = new PokemonService(pokemonRepository);
    const searchService = new SearchService(pokemonRepository, templateRepository, templateWordRepository);

    // Controllers
    const pokemonController = new PokemonController(pokemonService);
    const searchController = new SearchController(searchService);
    const templatesController = new TemplatesController(templateRepository);

    // Register route modules
    await app.register(healthRoutes);
    await app.register(pokemonRoutes, { controller: pokemonController });
    await app.register(searchRoutes, { controller: searchController });
    await app.register(templatesRoutes, { controller: templatesController });
}