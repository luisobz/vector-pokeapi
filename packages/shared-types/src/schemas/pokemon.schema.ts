import { z } from "zod";

const getPokemonParamsSchema = z.object({
    id: z.coerce.number().positive(),
});

export const getPokemonSchema = {
    params: getPokemonParamsSchema,
};

export type GetPokemonParams = z.infer<typeof getPokemonParamsSchema>;