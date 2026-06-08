"use client";
import React from "react";
import { useTranslations } from "next-intl";
import { HolographicCard } from "@vector-pokeapi/ui";
import { useSearch } from "@/composables";
import SearchHero from "@/components/search/SearchHero";
import SearchInput from "@/components/search/SearchInput";
import ClearFiltersButton from "@/components/search/ClearFiltersButton";
import FilterPanel from "@/components/search/FilterPanel";
import TypeSelector from "@/components/search/TypeSelector";
import GenerationSelector from "@/components/search/GenerationSelector";
import ResultsGrid from "@/components/search/ResultsGrid";
import Link from "next/link";
import { Sparkles, ToggleLeft, ToggleRight } from "lucide-react";
import { buildPath } from "@/lib/routes";

export default function SearchPage() {
  const t = useTranslations("SearchPage");
  const pokemonTypes = ["grass", "fire", "water", "electric", "poison", "normal"];
  const generations = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(v => ({ value: v, label: `${t("genPrefix")} ${v}` }));
  const {
    searchTerm,
    setSearchTerm,
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
  } = useSearch();

  const hasActiveFilters = !!(selectedType || selectedGen || selectedTemplateId);

  return (
    <div className="space-y-8 pb-12">
      <SearchHero />
      <div className="w-full max-w-4xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            isSearching={isSearching}
            templates={templates}
            onTemplateSelect={handleTemplateClick}
            activeTemplateId={selectedTemplateId}
            onFilterToggle={() => setShowFilters(!showFilters)}
            hasActiveFilters={hasActiveFilters}
          />
          <ClearFiltersButton
            isVisible={!!(searchTerm || selectedType || selectedGen || selectedTemplateId)}
            onClick={clearFilters}
          />
        </div>

        <FilterPanel isOpen={showFilters} onClose={() => setShowFilters(false)}>
          <TypeSelector selectedType={selectedType} onSelect={setSelectedType} types={pokemonTypes} />
          <GenerationSelector selectedGen={selectedGen} onSelect={setSelectedGen} generations={generations} />
          <div className="col-span-1 sm:col-span-2 pt-4 mt-2 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-cyan-400" />
              <span className="text-sm font-semibold text-zinc-200">{t("useKeywordsLabel")}</span>
            </div>
            <button onClick={() => setUseKeywords(!useKeywords)}>
              {useKeywords ?
                <ToggleRight
                  size={32}
                  style={{
                    color: 'color-mix(in oklab, var(--color-cyan-500) 100%, transparent)',
                    filter: 'drop-shadow(0 0 2px color-mix(in oklab, var(--color-cyan-500) 100%, transparent))'
                  }}
                /> :
                <ToggleLeft size={32} />
              }
            </button>
          </div>
        </FilterPanel>
      </div>

      <ResultsGrid
        isLoading={isLoading}
        pokemonList={pokemonList}
        renderItem={(pokemon) => (
          <Link href={buildPath("POKEMON_DETAIL", { id: pokemon.id })} key={pokemon.id}>
            <HolographicCard pokemon={pokemon} />
          </Link>
        )}
      />
    </div>
  );
}