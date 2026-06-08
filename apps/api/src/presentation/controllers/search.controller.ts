import { FastifyRequest } from "fastify";
import { ISearchService } from "../../domain/services/search.service.interface";
import { SearchQuerystring } from "@vector-pokeapi/shared-types";

export class SearchController {
    constructor(private searchService: ISearchService) { }

    async search(request: FastifyRequest<{ Querystring: SearchQuerystring }>) {
        const { q, ...options } = request.query;
        return this.searchService.search(q || "", options);
    }
}