"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, ChevronDown, ChevronUp, BarChart3, GitFork, Compass } from "lucide-react";
import { HolographicCard } from "@vector-pokeapi/ui";
import StatsRadar from "../../../components/pokemon/StatsRadar";
import EvolutionGraph from "../../../components/pokemon/EvolutionGraph";
import { Pokemon, SimilarGroupedByGen, PokemonSimilarResult } from "@vector-pokeapi/shared-types";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function PokemonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pokemonId = Number(params.id);

  const [pokemon, setPokemon] = useState<(Pokemon & { evolutionChain?: any }) | null>(null);
  const [similarGroups, setSimilarGroups] = useState<SimilarGroupedByGen[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedGens, setExpandedGens] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!pokemonId) return;

    setIsLoading(true);
    setError(null);

    // Fetch Pokemon detail and similarity groups in parallel
    Promise.all([
      fetch(`${API_BASE_URL}/api/pokemon/${pokemonId}`).then((res) => {
        if (!res.ok) throw new Error("Pokemon no encontrado");
        return res.json();
      }),
      fetch(`${API_BASE_URL}/api/pokemon/${pokemonId}/similar`).then((res) => {
        if (!res.ok) throw new Error("Error cargando similares");
        return res.json();
      }),
    ])
      .then(([detailData, similarData]) => {
        setPokemon(detailData);
        setSimilarGroups(similarData);

        // Expand the first generation category by default in the accordion
        if (similarData.length > 0) {
          setExpandedGens({ [similarData[0].generation]: true });
        }
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Error al cargar los datos del Pokémon");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [pokemonId]);

  const toggleGenAccordion = (gen: number) => {
    setExpandedGens((prev) => ({
      ...prev,
      [gen]: !prev[gen],
    }));
  };

  // Helper to color similarity scores based on match strength
  const getScoreColor = (score: number) => {
    if (score >= 0.85) return "bg-emerald-500 text-emerald-400 border-emerald-500/20";
    if (score >= 0.65) return "bg-cyan-500 text-cyan-400 border-cyan-500/20";
    return "bg-purple-500 text-purple-400 border-purple-500/20";
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-t-2 border-cyan-400 border-r-2 border-r-transparent rounded-full animate-spin" />
        <span className="text-zinc-500 text-xs font-mono">Cargando base de datos semántica...</span>
      </div>
    );
  }

  if (error || !pokemon) {
    return (
      <div className="text-center py-16 space-y-4 max-w-md mx-auto">
        <h2 className="text-xl font-bold text-red-400">Error</h2>
        <p className="text-zinc-400 text-sm">{error || "No se pudo cargar el Pokémon."}</p>
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-bold text-white hover:bg-zinc-800 transition-all"
        >
          <ArrowLeft size={14} /> Volver al Buscador
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Back Button / Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900/60 hover:bg-zinc-900 border border-white/5 rounded-xl text-xs font-bold text-zinc-300 hover:text-white transition-all shadow-sm"
        >
          <ArrowLeft size={14} /> Volver al Buscador
        </button>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column - Card Display */}
        <div className="lg:col-span-4 flex flex-col items-center space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <HolographicCard pokemon={pokemon} showEvolutionsHover={false} />
          </motion.div>
        </div>

        {/* Right Column - Stats, Evolutions, Similars */}
        <div className="lg:col-span-8 space-y-8">
          {/* Section 1: Stats & Info */}
          <section className="space-y-4">
            <h2 className="text-lg font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <BarChart3 size={18} className="text-cyan-400" /> Estadísticas Base
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Radar Chart */}
              <StatsRadar stats={pokemon.stats} />

              {/* Numerical List */}
              <div className="space-y-3 p-5 rounded-2xl bg-zinc-950/20 border border-white/5">
                {[
                  { label: "HP", val: pokemon.stats.hp, max: 150, color: "bg-emerald-500" },
                  { label: "Ataque", val: pokemon.stats.attack, max: 150, color: "bg-orange-500" },
                  { label: "Defensa", val: pokemon.stats.defense, max: 150, color: "bg-blue-500" },
                  { label: "Ataque Especial", val: pokemon.stats.spAtk, max: 150, color: "bg-purple-500" },
                  { label: "Defensa Especial", val: pokemon.stats.spDef, max: 150, color: "bg-pink-500" },
                  { label: "Velocidad", val: pokemon.stats.speed, max: 150, color: "bg-yellow-500" },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-zinc-400">{item.label}</span>
                      <span className="font-mono text-white">{item.val}</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color}`}
                        style={{ width: `${Math.min((item.val / item.max) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section 2: Evolution Roadmap */}
          {pokemon.evolutionChain && (
            <section className="space-y-4">
              <h2 className="text-lg font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <GitFork size={18} className="text-emerald-400" /> Hoja de Ruta Evolutiva
              </h2>
              <EvolutionGraph chain={pokemon.evolutionChain} currentPokemonId={pokemon.id} />
            </section>
          )}

          {/* Section 3: Conceptually Similar */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <Compass size={18} className="text-purple-400" /> Esencia Conceptual Similar
              </h2>
              <span className="flex items-center gap-1 text-[10px] font-mono text-purple-300 px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20">
                <Sparkles size={8} className="animate-pulse" /> Similitud de Coseno
              </span>
            </div>

            {similarGroups.length > 0 ? (
              <div className="space-y-3">
                {similarGroups.map((group) => {
                  const isExpanded = !!expandedGens[group.generation];
                  return (
                    <div
                      key={group.generation}
                      className="border border-white/5 rounded-xl bg-zinc-950/20 overflow-hidden shadow-sm"
                    >
                      {/* Accordion Trigger */}
                      <button
                        onClick={() => toggleGenAccordion(group.generation)}
                        className="w-full flex items-center justify-between p-4 bg-zinc-900/40 hover:bg-zinc-900/60 transition-all"
                      >
                        <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest">
                          Generación {group.generation} ({group.pokemons.length})
                        </span>
                        {isExpanded ? (
                          <ChevronUp size={16} className="text-zinc-500" />
                        ) : (
                          <ChevronDown size={16} className="text-zinc-500" />
                        )}
                      </button>

                      {/* Accordion Content */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-white/5 bg-zinc-950/40">
                              {group.pokemons.map((sim) => (
                                <Link
                                  href={`/pokemon/${sim.id}`}
                                  key={sim.id}
                                  className="flex items-center justify-between p-3 rounded-lg border border-zinc-900 hover:border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/60 transition-all group"
                                >
                                  <div className="flex items-center gap-3">
                                    {/* Sprite mini */}
                                    {sim.sprite ? (
                                      <img
                                        src={sim.sprite}
                                        alt={sim.name}
                                        className="w-10 h-10 object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] group-hover:scale-110 transition-transform"
                                      />
                                    ) : (
                                      <div className="w-10 h-10 bg-zinc-850 rounded-md" />
                                    )}
                                    <div className="text-left">
                                      <span className="text-xs font-bold text-white capitalize block group-hover:text-cyan-400 transition-colors">
                                        {sim.nameEs || sim.name}
                                      </span>
                                      <div className="flex gap-1 mt-0.5">
                                        {sim.types.map((t) => (
                                          <span
                                            key={t}
                                            className="text-[8px] px-1 bg-white/5 rounded-sm text-zinc-400"
                                          >
                                            {t}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Cosine similarity indicator */}
                                  <div className="text-right space-y-1 min-w-[70px]">
                                    <span className="text-[10px] font-mono font-bold block text-zinc-400">
                                      {(sim.similarity_score * 100).toFixed(1)}%
                                    </span>
                                    {/* Mini visual indicator */}
                                    <div className="w-16 h-1 bg-zinc-850 rounded-full overflow-hidden ml-auto">
                                      <div
                                        className={`h-full rounded-full ${getScoreColor(sim.similarity_score)}`}
                                        style={{ width: `${Math.min(sim.similarity_score * 100, 100)}%` }}
                                      />
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed border-white/5 rounded-2xl text-xs text-zinc-600">
                No hay suficientes datos de embeddings vectoriales cargados para buscar similitudes.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
