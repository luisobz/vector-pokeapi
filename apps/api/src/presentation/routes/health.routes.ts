import { FastifyInstance } from "fastify";

export async function healthRoutes(fastify: FastifyInstance): Promise<void> {
    fastify.get("/health", async () => ({
        status: "OK",
        timestamp: new Date().toISOString(),
    }));
}