import { z } from "zod";

export const getPokemonParamsSchema = z.object({
  id: z.coerce.number().positive(),
});

export type GetPokemonParams = z.infer<typeof getPokemonParamsSchema>;
