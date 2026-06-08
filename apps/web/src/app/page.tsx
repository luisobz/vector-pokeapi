"use client";

import React, { useState, useEffect, useCallback } from "react";
import { HolographicCard } from "@vector-pokeapi/ui";
import { Pokemon, SearchTemplate } from "@vector-pokeapi/shared-types";
import { useDebounce } from "../hooks/useDebounce";

import SearchHero from "../components/search/SearchHero";
import SearchInput from "../components/search/SearchInput";
import ClearFiltersButton from "../components/search/ClearFiltersButton";
import FilterPanel from "../components/search/FilterPanel";
import TypeSelector from "../components/search/TypeSelector";
import GenerationSelector from "../components/search/GenerationSelector";
import ResultsGrid from "../components/search/ResultsGrid";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Sparkles, ToggleLeft, ToggleRight } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const pokemonTypes = ["grass", "fire", "water", "electric", "poison", "normal"];
const generations = [
  { value: 1, label: "Gén I" },
  { value: 2, label: "Gén II" },
  { value: 3, label: "Gén III" },
  { value: 4, label: "Gén IV" },
  { value: 5, label: "Gén V" },
  { value: 6, label: "Gén VI" },
  { value: 7, label: "Gén VII" },
  { value: 8, label: "Gén VIII" },
  { value: 9, label: "Gén IX" },
];

export default function SearchPage() {
  const t = useTranslations("SearchPage");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedGen, setSelectedGen] = useState<number | "">("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [useKeywords, setUseKeywords] = useState(true);

  const [templates, setTemplates] = useState<SearchTemplate[]>([]);
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fetch templates once on mount
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/templates`)
      .then((res) => res.json())
      .then((data) => setTemplates(data))
      .catch((err) => console.error("Error loading templates:", err));
  }, []);

  // Main search API caller
  const performSearch = useCallback(async () => {
    setIsSearching(true);
    try {
      const queryParams = new URLSearchParams();

      // If we clicked a template, search semantically
      if (selectedTemplateId) {
        queryParams.append("templateId", String(selectedTemplateId));
        queryParams.append("useKeywords", String(useKeywords));
      } else if (debouncedSearchTerm) {
        // Otherwise use plain text
        queryParams.append("q", debouncedSearchTerm);
      }

      if (selectedType) queryParams.append("type", selectedType);
      if (selectedGen) queryParams.append("gen", String(selectedGen));
      queryParams.append("limit", "24");

      const response = await fetch(`${API_BASE_URL}/api/search?${queryParams.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setPokemonList(data);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
      setIsLoading(false);
    }
  }, [debouncedSearchTerm, selectedType, selectedGen, selectedTemplateId, useKeywords]);

  // Re-run search whenever any filter value changes
  useEffect(() => {
    performSearch();
  }, [performSearch]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedTemplateId(null); // Clear active template since user is typing
    setSearchTerm(e.target.value);
  };

  const handleTemplateClick = (template: SearchTemplate) => {
    if (selectedTemplateId === template.id) {
      // Toggle off
      setSelectedTemplateId(null);
      setSearchTerm("");
    } else {
      setSelectedTemplateId(template.id);
      setSearchTerm(template.queryText);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedType("");
    setSelectedGen("");
    setSelectedTemplateId(null);
  };

  const hasActiveFilters = !!(selectedType || selectedGen || selectedTemplateId);

  return (
    <div className="space-y-8 pb-12">
      {/* Title Hero */}
      <SearchHero />

      {/* Search Bar & Filters Interface */}
      <div className="w-full max-w-4xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Text Input with embedded filter toggle and autocomplete */}
          <SearchInput
            value={searchTerm}
            onChange={handleTextChange}
            isSearching={isSearching}
            templates={templates}
            onTemplateSelect={handleTemplateClick}
            activeTemplateId={selectedTemplateId}
            onFilterToggle={() => setShowFilters(!showFilters)}
            hasActiveFilters={hasActiveFilters}
          />

          {/* Filter Toggle & Clear */}
          <div className="flex gap-2">
            <ClearFiltersButton
              isVisible={!!(searchTerm || selectedType || selectedGen || selectedTemplateId)}
              onClick={handleClearFilters}
            />
          </div>
        </div>

        {/* Collapsible Filter Panel */}
        <FilterPanel isOpen={showFilters} onClose={() => setShowFilters(false)}>
          <TypeSelector
            selectedType={selectedType}
            onSelect={setSelectedType}
            types={pokemonTypes}
          />
          <GenerationSelector
            selectedGen={selectedGen}
            onSelect={setSelectedGen}
            generations={generations}
          />
          <div className="col-span-1 sm:col-span-2 pt-4 mt-2 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-cyan-400" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-zinc-200">Use Keywords (Template)</span>
                <span className="text-xs text-zinc-500">Filtrar por palabras clave de IA en lugar de similitud vectorial</span>
              </div>
            </div>
            <button
              onClick={() => setUseKeywords(!useKeywords)}
              className={`flex items-center justify-center p-1 rounded-full transition-colors ${useKeywords ? "text-cyan-400" : "text-zinc-600"
                }`}
            >
              {useKeywords ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
            </button>
          </div>
        </FilterPanel>
      </div>

      {/* Grid Results Section */}
      <section className="w-full">
        <ResultsGrid
          isLoading={isLoading}
          pokemonList={pokemonList}
          renderItem={(pokemon) => (
            <Link href={`/pokemon/${pokemon.id}`} key={pokemon.id} draggable={false}>
              <HolographicCard pokemon={pokemon} />
            </Link>
          )}
        />
      </section>
    </div>
  );
}
