import { fetchApi } from "./api";
import type { GetTemplatesReply } from "@vector-pokeapi/shared-types";

export function getTemplates() {
    return fetchApi<GetTemplatesReply>(`/api/templates`);
}