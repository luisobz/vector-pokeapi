"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, SlidersHorizontal, RefreshCcw, Sparkles } from "lucide-react";
import { HolographicCard } from "@vector-pokeapi/ui";
import { Pokemon, SearchTemplate } from "@vector-pokeapi/shared-types";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "../hooks/useDebounce";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedGen, setSelectedGen] = useState<number | "">("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);

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
  }, [debouncedSearchTerm, selectedType, selectedGen, selectedTemplateId]);

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

  // Group templates by their categories
  const templatesByCategory = templates.reduce<Record<string, SearchTemplate[]>>((acc, t) => {
    const cat = t.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(t);
    return acc;
  }, {});

  return (
    <div className="space-y-8 pb-12">
      {/* Title Hero */}
      <section className="text-center max-w-2xl mx-auto space-y-4 my-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-semibold tracking-wider uppercase"
        >
          <Sparkles size={12} className="animate-spin" style={{ animationDuration: "3s" }} /> Búsqueda Vectorial HNSW
        </motion.div>

        <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
          Explora la Pokédex de Forma <span className="bg-linear-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Semántica</span>
        </h1>

        <p className="text-zinc-400 text-sm sm:text-base font-medium">
          Busca por rasgos, roles competitivos o descripciones. El modelo de embeddings Qwen3 mapea tus ideas a los Pokémon correspondientes.
        </p>
      </section>

      {/* Search Bar & Filters Interface */}
      <div className="w-full max-w-4xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Text Input */}
          <div className="relative flex-grow">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
              <Search size={18} className={isSearching ? "animate-pulse text-cyan-400" : ""} />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={handleTextChange}
              placeholder="Ej. 'lagarto escupidor de fuego' o 'tanque defensivo de agua'..."
              className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-white/10 bg-zinc-900/60 backdrop-blur-md text-white placeholder-zinc-500 text-sm font-medium focus:outline-hidden focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 shadow-inner transition-all"
            />
          </div>

          {/* Filter Toggle & Clear */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3.5 rounded-xl border text-sm font-semibold transition-all ${showFilters || selectedType || selectedGen
                  ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
                  : "border-white/10 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700"
                }`}
            >
              <SlidersHorizontal size={16} />
              <span>Filtros</span>
            </button>

            {(searchTerm || selectedType || selectedGen || selectedTemplateId) && (
              <button
                onClick={handleClearFilters}
                className="flex items-center justify-center p-3.5 rounded-xl border border-white/10 bg-zinc-900/40 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all"
                title="Limpiar filtros"
              >
                <RefreshCcw size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border border-white/5 rounded-xl bg-zinc-950/40 backdrop-blur-md p-4 grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {/* Type Selector */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                  Tipo Elemental
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {pokemonTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(selectedType === type ? "" : type)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all border ${selectedType === type
                          ? "bg-white text-black border-white shadow-lg"
                          : "bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                        }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generation Selector */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                  Generación
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {generations.map((gen) => (
                    <button
                      key={gen.value}
                      onClick={() => setSelectedGen(selectedGen === gen.value ? "" : gen.value)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all border ${selectedGen === gen.value
                          ? "bg-white text-black border-white shadow-lg"
                          : "bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                        }`}
                    >
                      {gen.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Semantic Suggestion Chips */}
        {templates.length > 0 && (
          <div className="space-y-3 pt-2">
            <span className="block text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
              <Sparkles size={10} className="text-cyan-400 animate-pulse" /> Consultas Semánticas de Ejemplo
            </span>
            <div className="space-y-3">
              {Object.entries(templatesByCategory).map(([category, items]) => (
                <div key={category} className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 w-20 shrink-0">
                    {category}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => handleTemplateClick(t)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${selectedTemplateId === t.id
                            ? "bg-purple-600 text-white shadow-md border border-purple-500"
                            : "bg-zinc-900/50 hover:bg-zinc-800/80 border border-white/5 text-zinc-300"
                          }`}
                      >
                        {t.queryText}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Grid Results Section */}
      <section className="w-full">
        {isLoading ? (
          /* Loading skeletons */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="w-72 h-[420px] rounded-2xl border border-white/5 bg-zinc-900/20 animate-pulse flex flex-col justify-between p-4"
              >
                <div className="space-y-2">
                  <div className="w-16 h-3 bg-zinc-850 rounded" />
                  <div className="w-32 h-6 bg-zinc-850 rounded" />
                </div>
                <div className="w-40 h-40 rounded-full bg-zinc-850/50 mx-auto" />
                <div className="space-y-2">
                  <div className="w-24 h-5 bg-zinc-850 rounded-full" />
                  <div className="w-full h-12 bg-zinc-850 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : pokemonList.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center"
          >
            <AnimatePresence mode="popLayout">
              {pokemonList.map((pokemon) => (
                <motion.div
                  key={pokemon.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <HolographicCard pokemon={pokemon} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* Empty state */
          <div className="text-center py-16 border border-dashed border-white/5 rounded-2xl bg-zinc-950/20 max-w-md mx-auto space-y-2">
            <span className="text-zinc-500 font-bold block">No se encontraron resultados</span>
            <p className="text-zinc-600 text-xs">
              Intenta cambiar los términos de búsqueda o limpiar los filtros activos.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
