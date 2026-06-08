export interface TemplateKeyword {
    word: string;
    embedding: number[];
}

export interface ITemplateWordRepository {
    getKeywordsByTemplateId(templateId: number): Promise<TemplateKeyword[]>;
}