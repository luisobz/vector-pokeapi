import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

export interface IEnvironment {
    DATABASE_URL: string;
    PORT: string;
    NODE_ENV?: string;
    HOST: string;
    // Generation weights
    TEMPLATE_DISTANCE_THRESHOLD: string;
    KEYWORD_MIN_SIMILARITY: string;
    KEYWORD_POSITIVE_THRESHOLD: string;
    KEYWORD_NEGATIVE_WEIGHT: string;
}

export class Environments {
    private static instance: IEnvironment;

    static load(): void {
        if (Environments.instance) return;

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const envPath = path.resolve(__dirname, '../../../.env');
        const result = dotenv.config({ path: envPath, override: true });

        if (result.error) {
            console.warn(`No se pudo cargar el archivo .env desde ${envPath}: ${result.error.message}`);
        }

        const env = process.env as unknown as IEnvironment;

        if (!env.DATABASE_URL) {
            throw new Error('DATABASE_URL es obligatoria y no está definida');
        }

        // Valores por defecto para los pesos
        Environments.instance = {
            DATABASE_URL: env.DATABASE_URL,
            PORT: env.PORT || '3001',
            NODE_ENV: env.NODE_ENV ?? 'development',
            HOST: env.HOST || '0.0.0.0',
            TEMPLATE_DISTANCE_THRESHOLD: env.TEMPLATE_DISTANCE_THRESHOLD || '0.60',
            KEYWORD_MIN_SIMILARITY: env.KEYWORD_MIN_SIMILARITY || '0.35',
            KEYWORD_POSITIVE_THRESHOLD: env.KEYWORD_POSITIVE_THRESHOLD || '0.25',
            KEYWORD_NEGATIVE_WEIGHT: env.KEYWORD_NEGATIVE_WEIGHT || '1.2',
        };
    }

    static get<K extends keyof IEnvironment>(key: K): IEnvironment[K] {
        if (!Environments.instance) {
            throw new Error('Environments no inicializado. Llama a Environments.load() primero');
        }
        return Environments.instance[key];
    }

    static get DATABASE_URL(): string { return Environments.get('DATABASE_URL'); }
    static get PORT(): string { return Environments.get('PORT'); }
    static get NODE_ENV(): string | undefined { return Environments.get('NODE_ENV'); }
    static get HOST(): string { return Environments.get('HOST'); }

    // Getters para los pesos
    static get TEMPLATE_DISTANCE_THRESHOLD(): number {
        return parseFloat(Environments.get('TEMPLATE_DISTANCE_THRESHOLD'));
    }
    static get KEYWORD_MIN_SIMILARITY(): number {
        return parseFloat(Environments.get('KEYWORD_MIN_SIMILARITY'));
    }
    static get KEYWORD_POSITIVE_THRESHOLD(): number {
        return parseFloat(Environments.get('KEYWORD_POSITIVE_THRESHOLD'));
    }
    static get KEYWORD_NEGATIVE_WEIGHT(): number {
        return parseFloat(Environments.get('KEYWORD_NEGATIVE_WEIGHT'));
    }
}

Environments.load();