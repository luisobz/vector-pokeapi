"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { searchPokemon, getTemplates } from "../../services/api";
import type { GetSearchRequest, GetSearchReply, GetTemplatesReply } from "@vector-pokeapi/shared-types";
import { useDebounce } from "../../hooks/useDebounce";
import { registerReset } from "../reset";

const STORAGE_KEY = "pokemonSearchState";
const TEMPLATE_CACHE_MS = 5 * 60 * 1000;

export function useSearch() {
    const getInitialState = () => {
        if (typeof window === "undefined") return {};
        try {
            const saved = sessionStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    };

    const initialState = getInitialState();

    const [searchTerm, setSearchTerm] = useState(initialState.searchTerm || "");
    const [selectedType, setSelectedType] = useState(initialState.selectedType || "");
    const [selectedGen, setSelectedGen] = useState<number | "">(initialState.selectedGen || "");
    const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(initialState.selectedTemplateId ?? null);
    const [useKeywords, setUseKeywords] = useState(initialState.useKeywords ?? true);
    const [showFilters, setShowFilters] = useState(false);

    const [templates, setTemplates] = useState<GetTemplatesReply>([]);
    const [pokemonList, setPokemonList] = useState<GetSearchReply>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);

    const lastTemplatesFetch = useRef(0);

    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    useEffect(() => {
        const state = { searchTerm, selectedType, selectedGen, selectedTemplateId, useKeywords };
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [searchTerm, selectedType, selectedGen, selectedTemplateId, useKeywords]);

    useEffect(() => {
        const now = Date.now();
        if (templates.length === 0 || now - lastTemplatesFetch.current > TEMPLATE_CACHE_MS) {
            getTemplates()
                .then((data) => {
                    setTemplates(data);
                    lastTemplatesFetch.current = now;
                })
                .catch(console.error);
        }
    }, []);

    const performSearch = useCallback(async () => {
        setIsSearching(true);
        try {
            const query: NonNullable<GetSearchRequest["query"]> = {
                limit: 24,
                useKeywords,
                q: selectedTemplateId ? undefined : debouncedSearchTerm || undefined,
                templateId: selectedTemplateId ?? undefined,
                type: selectedType || undefined,
                gen: selectedGen ? Number(selectedGen) : undefined,
            };
            const data = await searchPokemon(query);
            setPokemonList(data);
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsSearching(false);
            setIsLoading(false);
        }
    }, [debouncedSearchTerm, selectedType, selectedGen, selectedTemplateId, useKeywords]);

    useEffect(() => {
        performSearch();
    }, [performSearch]);

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedTemplateId(null);
        setSearchTerm(e.target.value);
    };

    const handleTemplateClick = (template: { id: number; queryText: string }) => {
        if (selectedTemplateId === template.id) {
            setSelectedTemplateId(null);
            setSearchTerm("");
        } else {
            setSelectedTemplateId(template.id);
            setSearchTerm(template.queryText);
        }
    };

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedType("");
        setSelectedGen("");
        setSelectedTemplateId(null);
    };

    const reset = useCallback(() => {
        clearFilters();
        setShowFilters(false);
        setIsLoading(true);
        setPokemonList([]);
        sessionStorage.removeItem(STORAGE_KEY);
    }, []);

    useEffect(() => {
        registerReset(reset);
    }, [reset]);

    return {
        searchTerm,
        setSearchTerm: handleTextChange,
        selectedType,
        setSelectedType,
        selectedGen,
        setSelectedGen,
        selectedTemplateId,
        useKeywords,
        setUseKeywords,
        templates,
        pokemonList,
        isLoading,
        isSearching,
        showFilters,
        setShowFilters,
        handleTemplateClick,
        clearFilters,
        resetModule: reset,
    };
}