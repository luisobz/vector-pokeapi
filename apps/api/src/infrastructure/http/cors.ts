import { FastifyInstance } from "fastify";
import cors from "@fastify/cors";

export async function registerCors(app: FastifyInstance): Promise<void> {
    await app.register(cors, {
        origin: "*",
        methods: ["GET", "OPTIONS"],
    });
}