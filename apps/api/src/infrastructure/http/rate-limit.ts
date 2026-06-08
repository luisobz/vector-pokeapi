import { FastifyInstance } from "fastify";
import rateLimit from "@fastify/rate-limit";

export async function registerRateLimit(app: FastifyInstance): Promise<void> {
    await app.register(rateLimit, {
        max: 100,
        timeWindow: 60 * 1000,
        keyGenerator: (request) => {
            const cfIp = request.headers['cf-connecting-ip'] as string | undefined;
            const xForwardedFor = request.headers['x-forwarded-for'] as string | undefined;
            if (cfIp) return cfIp;
            if (xForwardedFor) return xForwardedFor.split(',')[0]!.trim();
            return request.ip;
        },
        errorResponseBuilder: (_request, context) => ({
            statusCode: 429,
            error: "Too Many Requests",
            message: `Has superado el límite de ${context.max} peticiones por minuto. Vuelve a intentarlo en ${Math.ceil(context.ttl / 1000)} segundos.`,
        }),
    });
}