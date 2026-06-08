import Fastify, { FastifyInstance } from "fastify";
import { prisma } from "@vector-pokeapi/database";
import { setupValidator } from "./infrastructure/http/validator.js";
import { registerCors } from "./infrastructure/http/cors.js";
import { registerRateLimit } from "./infrastructure/http/rate-limit.js";
import { registerRoutes } from "./presentation/routes/index.js";

function initFastifyApp(): FastifyInstance {
  return Fastify({ logger: true });
}

export async function buildApp(): Promise<FastifyInstance> {
  const app = initFastifyApp();

  setupValidator(app);
  await registerCors(app);
  await registerRateLimit(app);
  await registerRoutes(app, { prisma });

  return app;
}