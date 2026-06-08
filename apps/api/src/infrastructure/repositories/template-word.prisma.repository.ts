import { PrismaClient } from "@vector-pokeapi/database";
import { ITemplateWordRepository, TemplateKeyword } from "../../domain/repositories/template-word.repository.interface.js";

export class TemplateWordRepository implements ITemplateWordRepository {
    constructor(private prisma: PrismaClient) { }

    async getKeywordsByTemplateId(templateId: number): Promise<TemplateKeyword[]> {
        const rows = await this.prisma.$queryRawUnsafe<any[]>(
            `SELECT word, embedding::text FROM template_words WHERE template_id = $1 ORDER BY id`,
            templateId
        );
        return rows.map((row) => {
            let embedding: number[] = [];
            if (row.embedding) {
                try {
                    embedding = row.embedding
                        .replace(/^\[/, "")
                        .replace(/\]$/, "")
                        .split(",")
                        .map(Number);
                } catch (err) {
                    console.error(`Failed to parse embedding for word ${row.word}`, err);
                }
            }
            return { word: row.word, embedding };
        });
    }
}