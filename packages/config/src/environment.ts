import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

export interface IEnvironment {
    DATABASE_URL: string;
    PORT: string;
    NODE_ENV?: string;
    HOST: string;
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

        Environments.instance = {
            DATABASE_URL: env.DATABASE_URL,
            PORT: env.PORT || '3001',
            NODE_ENV: env.NODE_ENV ?? 'development',
            HOST: env.HOST || '0.0.0.0',
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
}

Environments.load();