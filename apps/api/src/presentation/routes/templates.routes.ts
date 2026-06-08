import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "@fastify/type-provider-zod";
import { TemplatesController } from "../controllers/templates.controller.js";

export async function templatesRoutes(fastify: FastifyInstance, opts: { controller: TemplatesController }) {
  const server = fastify.withTypeProvider<ZodTypeProvider>();
  const ctrl = opts.controller;

  server.get(
    "/api/templates",
    ctrl.getAll.bind(ctrl)
  );
}