import { PokemonDetail } from "../models/pokemon.types.ts";
import type { GetPokemonParams } from "../schemas/pokemon.schema.js";
import type { SearchQuerystring } from "../schemas/search.schema.js";
import type { SearchTemplate, SimilarGroupedByGen } from "../models/search.types.ts";

export type GenericRequest<Params = void, Query = void, Body = void> = {
    params?: Params;
    query?: Query;
    body?: Body;
};

export type GetPokemonRequest = GenericRequest<GetPokemonParams>;
export type GetSimilarRequest = GenericRequest<GetPokemonParams>;
export type GetTemplatesRequest = GenericRequest;
export type GetSearchRequest = GenericRequest<void, SearchQuerystring>;

export type GetPokemonReply = PokemonDetail;
export type GetSimilarReply = SimilarGroupedByGen[];
export type GetTemplatesReply = SearchTemplate[];
export type GetSearchReply = PokemonDetail[];