import { ISearchTemplateRepository } from "../../domain/repositories/search-template.repository.interface";

export class TemplatesController {
    constructor(private templateRepository: ISearchTemplateRepository) { }

    async getAll() {
        return this.templateRepository.getAll();
    }
}