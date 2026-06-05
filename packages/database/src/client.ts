import { PrismaClient as PrismaClientClass } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg'
import { Environments } from '@vector-pokeapi/config/env';

Environments.load();
const adapter = new PrismaPg({ connectionString: Environments.DATABASE_URL })
export const prisma = new PrismaClientClass({ adapter });
export type PrismaClient = typeof prisma;