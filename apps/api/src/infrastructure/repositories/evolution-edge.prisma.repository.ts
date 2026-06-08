import { PrismaClient } from "@vector-pokeapi/database";
import { IEvolutionEdgeRepository } from "../../domain/repositories/evolution-edge.repository.interface.js";
import { EvolutionEdge } from "@vector-pokeapi/shared-types";

export class EvolutionEdgeRepository implements IEvolutionEdgeRepository {
    constructor(private prisma: PrismaClient) { }

    async findEdgesFrom(pokemonId: number): Promise<EvolutionEdge[]> {
        const edges = await this.prisma.evolutionEdge.findMany({
            where: { fromPokemonId: pokemonId },
            include: {
                to: {
                    select: {
                        id: true,
                        name: true,
                        nameEs: true,
                        description: true,
                        types: true,
                        generation: true,
                        stats: true,
                        sprite: true,
                    },
                },
            },
        });
        return edges.map((e) => ({
            id: e.id,
            fromPokemonId: e.fromPokemonId,
            toPokemonId: e.toPokemonId,
            trigger: e.trigger,
            minLevel: e.minLevel,
            itemName: e.itemName,
            to: e.to as any,
        }));
    }

    async findEdgesTo(pokemonId: number): Promise<EvolutionEdge[]> {
        const edges = await this.prisma.evolutionEdge.findMany({
            where: { toPokemonId: pokemonId },
            include: {
                from: {
                    select: {
                        id: true,
                        name: true,
                        nameEs: true,
                        description: true,
                        types: true,
                        generation: true,
                        stats: true,
                        sprite: true,
                    },
                },
            },
        });
        return edges.map((e) => ({
            id: e.id,
            fromPokemonId: e.fromPokemonId,
            toPokemonId: e.toPokemonId,
            trigger: e.trigger,
            minLevel: e.minLevel,
            itemName: e.itemName,
            from: e.from as any,
        }));
    }
}