"use client";
import { useState, useEffect, useCallback } from "react";
import { getPokemon, getSimilar } from "@/services/api";
import type { GetPokemonReply, GetSimilarReply } from "@vector-pokeapi/shared-types";
import { registerReset } from "../reset";

export function usePokemonDetail(pokemonId: number) {
    const [pokemon, setPokemon] = useState<GetPokemonReply | null>(null);
    const [similarGroups, setSimilarGroups] = useState<GetSimilarReply>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedGens, setExpandedGens] = useState<Record<number, boolean>>({});

    useEffect(() => {
        if (!pokemonId) return;
        setIsLoading(true);
        setError(null);

        Promise.all([getPokemon(pokemonId), getSimilar(pokemonId)])
            .then(([detail, similar]) => {
                setPokemon(detail);
                setSimilarGroups(similar);
                if (similar.length > 0) {
                    setExpandedGens({ [similar[0]!.generation]: true });
                }
            })
            .catch((err) => setError(err.message || "Error"))
            .finally(() => setIsLoading(false));
    }, [pokemonId]);

    const toggleGenAccordion = useCallback((gen: number) => {
        setExpandedGens((prev) => ({ ...prev, [gen]: !prev[gen] }));
    }, []);

    const reset = useCallback(() => {
        setPokemon(null);
        setSimilarGroups([]);
        setIsLoading(true);
        setError(null);
        setExpandedGens({});
    }, []);

    useEffect(() => {
        registerReset(reset);
    }, [reset]);

    return { pokemon, similarGroups, isLoading, error, expandedGens, toggleGenAccordion, resetModule: reset };
}