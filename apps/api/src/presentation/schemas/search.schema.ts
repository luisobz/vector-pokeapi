import { z } from "zod";

export const searchQuerystringSchema = z.object({
  q: z.string().optional(),
  templateId: z.coerce.number().optional(),
  type: z.string().optional(),
  gen: z.coerce.number().optional(),
  limit: z.coerce.number().optional().default(24),
  useKeywords: z.preprocess(
    (val) => val === "false" ? false : val === "true" ? true : val,
    z.boolean().optional().default(true),
  ),
});

export type SearchQuerystring = z.infer<typeof searchQuerystringSchema>;
