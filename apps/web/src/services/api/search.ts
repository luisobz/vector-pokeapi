import { fetchApi } from "./api";
import type { GetSearchReply, GetSearchRequest, GetTemplatesReply } from "@vector-pokeapi/shared-types";

export function searchPokemon(query: NonNullable<GetSearchRequest["query"]>) {
    const urlParams = new URLSearchParams();
    if (query.q) urlParams.set("q", query.q);
    if (query.templateId) urlParams.set("templateId", String(query.templateId));
    if (query.type) urlParams.set("type", query.type);
    if (query.gen) urlParams.set("gen", String(query.gen));
    if (query?.limit) urlParams.set("limit", String(query.limit));
    urlParams.set("useKeywords", String(query.useKeywords ?? true));
    return fetchApi<GetSearchReply>(`/api/search?${urlParams.toString()}`);
}
