import { FastifyInstance } from "fastify";
import { serializerCompiler, validatorCompiler } from "@fastify/type-provider-zod";

export function setupValidator(app: FastifyInstance): void {
    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);
}