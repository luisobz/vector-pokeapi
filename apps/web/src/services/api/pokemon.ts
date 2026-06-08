import { fetchApi } from "./api";
import type { GetPokemonReply, GetSimilarReply } from "@vector-pokeapi/shared-types";

export function getPokemon(id: number) {
    return fetchApi<GetPokemonReply>(`/api/pokemon/${id}`);
}

export function getSimilar(id: number) {
    return fetchApi<GetSimilarReply>(`/api/pokemon/${id}/similar`);
}